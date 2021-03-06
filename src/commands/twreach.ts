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
import { customImplStore } from '../tmp/custom-impl'
import {
  DMVariation,
  EngagementErrorRecordCreateManyInput,
  EngagementRecordCreateManyInput,
  Prospect,
} from '../types'
import { getRandomFromArray, sleep } from '../utils'
import { NotImplementedError } from '../utils/errors'

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

  const dmMessage = getRandomFromArray<DMVariation>(
    customImplStore.getDMVariations({
      projectName,
      name: greetingName,
    })
  )
  if (dmMessage.data.imagePath) {
    const mediaId = await twitterV1Client.uploadMedia(
      dmMessage.data.imagePath,
      { target: 'dm' }
    )

    await twitterDm({
      recipient_id: userId,
      text: dmMessage.data.text,
      attachment: { type: 'media', media: { id: mediaId } },
    })
  } else {
    await twitterDm({
      recipient_id: userId,
      text: dmMessage.data.text,
    })
  }

  print.success(`You messaged ${username}`)

  return {
    repliedTweetsCount,
    prospectUsername: username,
    preDMEngagement: _preDMEngagement,
    message: dmMessage.data.text,
    messageVariationIndex: dmMessage.index,
    imagePath: dmMessage.data.imagePath,
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
        if (err instanceof NotImplementedError) {
          throw err
        }

        print.info(err)
        print.error(`\nFailed to engage with ${prospect.username}.`)

        engagementErrors.push({
          prospectUsername: prospect.username,
          errorMessage:
            err instanceof Error ? err.message : 'Unknown engagement error.',
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
