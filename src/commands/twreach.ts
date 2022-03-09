import { PreDMEngagement } from '@prisma/client'
import { GluegunCommand, GluegunPrint } from 'gluegun'
import * as prompts from 'prompts'
import { SECOND } from '../constants/time'
import { prospectStore } from '../db/prospects'
import {
  followTwitterUser,
  getTwitterTimeline,
  twitterDm,
} from '../services/twitter/engage'
import { likeTweet, replyToTweet } from '../services/twitter/tweets'
import { twitterV1Client } from '../services/twitter/twitterClient'
import {
  EngagementErrorRecordCreateManyInput,
  EngagementRecordCreateManyInput,
  Maybe,
  Prospect,
} from '../types'
import { random, sleep } from '../utils'

type DMVariation = {
  text: string
  withImage: boolean
}

// TODO:
// 1. Allow message customisation and gitignore the messages.
// 2. Replace the withImage field with the image string value. This requires a db schema change
const getVariations = (
  name?: Maybe<string>,
  projectName?: Maybe<string>
): DMVariation[] => {
  const greeting = name ? `Hey ${name} 👋` + ',' : `Hey 👋` + ','
  const congratulations = projectName
    ? `Congrats on all the success from ${projectName} 🎉.`
    : `Congrats on all the success from the project 🎉.`

  const variationOne: DMVariation = {
    withImage: false,
    text: `${greeting}\n\n${congratulations} I was just wondering if you knew who I could talk to about community engagement?\n\nI'm part of a ex-bigtech dev team building tooling for community managers (focused on incentivizing social engagement + rewarding top community members).\n\nLooking to learn more about problems that community leads are facing right now (and to see if there is anything we can build to make your life easier).\n\nWe’re launching with a couple of other projects soon @indexcoop and @soundmintxyz`,
  }

  const variationTwo: DMVariation = {
    withImage: true,
    text: `${greeting}\n\n${congratulations} I was just wondering if you knew who I could talk to about community engagement\n\nI'm part of a ex-bigtech dev team building a social activity dashboard that helps you track and reward top community members for their contributions. Keen to hear your thoughts.\n\np.s. prototype design attached. we’re launching our alpha with a couple of other projects soon @indexcoop and @soundmintxyz`,
  }

  const variationThree: DMVariation = {
    withImage: true,
    text: `${greeting}\n\n${congratulations} I was just wondering if you knew who I could talk to about community engagement?\n\nI'm part of an ex-bigtech dev team building tooling for some of the top DAOs/projects. We’re launching with @indexcoop and @soundmintxyz.\n\nUp for a short chat? Keen to learn about your background and the problems you faced when starting the project\n\np.s. prototype design of our first product (a social activity dashboard attached)`,
  }

  return [variationOne, variationTwo, variationThree]
}

const getRandomDMMessage = <T>(
  messages: T[]
): {
  index: number
  message: T
} => {
  const index = random(0, messages.length - 1)

  return {
    index,
    message: messages[index],
  }
}

type EngageWithUserInput = Prospect & {
  print: GluegunPrint
}

const engageWithUser = async ({
  print,
  username,
  greetingName,
  projectName,
  preDMEngagement = PreDMEngagement.LIKE_AND_REPLY,
}: EngageWithUserInput): Promise<EngagementRecordCreateManyInput> => {
  let repliedTweetsCount = 0
  let _preDMEngagement = preDMEngagement

  print.info(`Engaging with ${username}...`)
  const { tweets, user } = await getTwitterTimeline(username)
  const userId = user.id

  // follow the person
  await followTwitterUser(userId)
  print.info(`Your followed ${userId}`)

  if (_preDMEngagement === PreDMEngagement.LIKE_AND_REPLY) {
    const tweetsResp = await prompts({
      min: 1,
      name: 'tweets',
      type: 'multiselect',
      hint: 'Space to select. Return to submit',
      message: 'Pick some tweets from the timeline to interact with',
      choices: [
        ...tweets.map((tweet) => {
          return {
            title: tweet.text + '\n\n',
            value: { id: tweet.id, text: tweet.text },
          }
        }),
        {
          title: 'Follow this project only',
          value: PreDMEngagement.FOLLOW_ONLY,
        },
      ],
    })

    for (const value of tweetsResp.tweets) {
      if (value === PreDMEngagement.FOLLOW_ONLY) {
        _preDMEngagement = PreDMEngagement.FOLLOW_ONLY
      }
    }

    // Like and reply to the tweet I want to engage with
    if (_preDMEngagement === PreDMEngagement.LIKE_AND_REPLY) {
      for (const tweet of tweetsResp.tweets) {
        const replyResp = await prompts({
          type: 'text',
          name: 'value',
          message:
            'Write your reply for this tweet:\n\n' +
            print.colors.green(tweet.text),
        })

        await likeTweet(tweet.id)
        print.info('You liked ' + print.colors.green(`tweet ${tweet.id}`))

        await replyToTweet(tweet.id, replyResp.value)
        print.info(
          `Replied to tweet ${tweet.id}: ${print.colors.green(replyResp.value)}`
        )
      }

      repliedTweetsCount = tweetsResp.tweets.length
    }
  }

  // Wait for a bit after you have already engaged with their tweet, don't make it seem spammy
  if (_preDMEngagement === PreDMEngagement.LIKE_AND_REPLY) {
    print.warning(`Waiting for 10 seconds before direct messaging...`)
    await sleep(10 * SECOND)
  }

  const dmMessage = getRandomDMMessage<DMVariation>(
    getVariations(greetingName, projectName)
  )
  if (dmMessage.message.withImage) {
    const mediaId = await twitterV1Client.uploadMedia(
      './src/assets/dashboard.jpeg',
      { target: 'dm' }
    )

    await twitterDm({
      recipient_id: userId,
      text: dmMessage.message.text,
      attachment: { type: 'media', media: { id: mediaId } },
    })
  } else {
    await twitterDm({
      recipient_id: userId,
      text: dmMessage.message.text,
    })
  }

  print.success(`You messaged ${username}`)

  return {
    replied: false,
    repliedTweetsCount,
    prospectUsername: username,
    preDMEngagement: _preDMEngagement,
    message: dmMessage.message.text,
    messageVariationIndex: dmMessage.index,
    withImage: dmMessage.message.withImage,
  }
}

const command: GluegunCommand = {
  name: 'twreach',
  run: async ({ print, parameters }) => {
    const prospects = await prospectStore.getNotContactedProspects(
      parameters.options.limit ?? 5
    )

    const engagementRecords: EngagementRecordCreateManyInput[] = []
    const engagementErrors: EngagementErrorRecordCreateManyInput[] = []

    for (const prospect of prospects) {
      try {
        const engagementRecord = await engageWithUser({
          ...prospect,
          print,
        })

        print.success(
          `\nThe engagement record is ${JSON.stringify(
            engagementRecord,
            null,
            2
          )}`
        )

        engagementRecords.push(engagementRecord)
      } catch (err) {
        print.info(err)
        print.error(`\nFailed to engage with ${prospect.username}.`)

        engagementErrors.push({
          prospectUsername: prospect.username,
          errorMessage: err instanceof Error ? err.message : 'Unknown error.',
        })
      }
    }

    await prospectStore.addEngagementRecords(engagementRecords)
    await prospectStore.addEngagementErrors(engagementErrors)

    // Report stats
    const outreachStats = await prospectStore.getOutreachStats()
    print.success(
      `\nThe outreach statistics are: ${JSON.stringify(outreachStats, null, 2)}`
    )
  },
}

module.exports = command
