import { GluegunCommand } from 'gluegun'
import { DirectMessageCreateV1, UserV1 } from 'twitter-api-v2'
import { db } from '../db/client'
import { prospectStore } from '../db/prospects'
import { currentTwitterUser } from '../services/twitter'
import { twitterV1Client } from '../services/twitter/twitterClient'
import { UpdateReplyData } from '../types'

const isMeRecipient = async (dm: DirectMessageCreateV1, me?: UserV1) => {
  const _me = me ?? (await currentTwitterUser())
  return dm['message_create'].target.recipient_id === _me.id_str
}

const cmd: GluegunCommand = {
  alias: ['up'],
  name: 'update-replies',
  run: async ({ print }) => {
    const dmEvents = await twitterV1Client.listDmEvents()
    const currentUser = await currentTwitterUser()

    const latestReplies: UpdateReplyData[] = []
    const seenProspects: Set<string> = new Set()

    print.info('Fetching DMs from the last 30 days...')

    for await (const dm of dmEvents) {
      const senderId = dm['message_create'].sender_id
      const recipientIsMe = await isMeRecipient(dm, currentUser)

      if (recipientIsMe && !seenProspects.has(senderId)) {
        const prospect = await db.prospect.findFirst({
          where: {
            userId: senderId,
          },
        })

        if (prospect) {
          latestReplies.push({
            repliedAt: Number(dm.created_timestamp),
            prospectUsername: prospect.username,
          })
        } else {
          print.warning(
            `Prospect data is not found Twitter user ${dm['message_create'].sender_id}.`
          )
        }

        seenProspects.add(senderId)
      }
    }

    await prospectStore.updateReplies(latestReplies)
    print.success(
      `Updated the latest replies for ${latestReplies.length} prospects.`
    )
  },
}

module.exports = cmd
