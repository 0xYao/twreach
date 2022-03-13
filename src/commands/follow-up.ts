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
    const resp = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Have you added/updated the replies of the prospects in the DB?',
    })

    if (!resp.value) {
      print.warning(
        'Cancelled follow-up operation, use the replies data from the Notion page to update the DB.'
      )
      process.exit(0)
    }

    // follow up with all prospects by default if the limit option is not provided
    const limit: number | undefined = parameters.options.limit
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

        print.success(`Followed up with ${prospect.username}`)

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

    print.success(`Followed up with ${followUps.length} prospects.`)
  },
}

module.exports = cmd
