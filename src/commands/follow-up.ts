import { GluegunCommand } from 'gluegun'
import * as prompts from 'prompts'
import { prospectStore } from '../db/prospects'
import { twitterDm } from '../services/twitter/engage'
import {
  twitterV1Client,
  twitterV2Client,
} from '../services/twitter/twitterClient'
import { customImplStore } from '../tmp/custom-impl'
import {
  EngagementErrorRecordCreateManyInput,
  FollowUpCreateManyInput,
} from '../types'
import { getRandomFromArray } from '../utils'
import { NotImplementedError } from '../utils/errors'

const cmd: GluegunCommand = {
  alias: ['ff'],
  name: 'follow-up',
  run: async ({ print, parameters }) => {
    const confirmRepliesUpdated = await prompts({
      type: 'confirm',
      name: 'value',
      message:
        'Have you run the "twreach update-replies" command in the last 3 days?',
    })

    if (!confirmRepliesUpdated.value) {
      print.warning(
        'Cancelled follow-up operation, run "twreach update-replies" to update the DB.'
      )
      process.exit(0)
    }

    const limit: number | undefined =
      parameters.options.limit === 'inf'
        ? undefined
        : parameters.options.limit ?? 10

    const excludeUsernames: string[] = (
      (parameters.options.excludeUsernames as string | undefined) ?? ''
    )
      .split(',')
      .map((v) => v.trim())

    const includeUsernames: string[] | undefined = parameters.options
      .includeUsernames
      ? (parameters.options.includeUsernames as string)
          .split(',')
          .map((val) => val.trim())
      : undefined

    const prospectsToFollowUp = await prospectStore.getProspectsToFollowUp({
      limit,
      includeUsernames,
      excludeUsernames,
    })

    const confirmFollowUps = await prompts({
      type: 'confirm',
      name: 'value',
      message: `You are about to follow up with these accounts, ${print.colors.green(
        prospectsToFollowUp.map((p) => p.username).join(', ')
      )}, ${print.colors.yellow('do you want to proceed')}?`,
    })

    if (!confirmFollowUps.value) {
      print.warning(
        'Cancelled follow-up operation, operator refuse to follow up with some prospects.'
      )
      process.exit(0)
    }

    const followUps: FollowUpCreateManyInput[] = []
    const engagementErrors: EngagementErrorRecordCreateManyInput[] = []

    const followUpPromises = prospectsToFollowUp.map(async (prospect) => {
      try {
        const variations = customImplStore.getFollowUpVariations({
          name: prospect.greetingName,
          projectName: prospect.projectName,
        })

        const dm = getRandomFromArray(variations)

        const userId =
          prospect.userId ??
          (await twitterV2Client.userByUsername(prospect.username)).data.id

        const followUp: FollowUpCreateManyInput = {
          text: dm.data.text,
          variationIndex: dm.index,
          imagePath: dm.data.imagePath,
          prospectUsername: prospect.username,
        }

        if (dm.data.imagePath) {
          const mediaId = await twitterV1Client.uploadMedia(dm.data.imagePath, {
            target: 'dm',
          })

          await twitterDm({
            recipient_id: userId,
            text: dm.data.text,
            attachment: { type: 'media', media: { id: mediaId } },
          })
        } else {
          await twitterDm({
            recipient_id: userId,
            text: dm.data.text,
          })
        }

        print.info(
          `Followed up with ${print.colors.green(JSON.stringify(followUp))}`
        )

        followUps.push(followUp)
      } catch (err) {
        if (err instanceof NotImplementedError) {
          throw err
        }

        print.info(err)
        print.error(`Failed to follow up with ${prospect.username}`)

        engagementErrors.push({
          prospectUsername: prospect.username,
          errorMessage:
            err instanceof Error ? err.message : 'Unknown follow-up error.',
        })
      }
    })

    await Promise.all(followUpPromises)

    await prospectStore.addEngagementErrors(engagementErrors)
    await prospectStore.addFollowUps(followUps)

    print.success(`\nFollowed up with ${followUps.length} prospects.`)
  },
}

module.exports = cmd
