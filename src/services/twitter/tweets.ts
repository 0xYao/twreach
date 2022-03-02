import { currentTwitterUser } from '.'
import { twitterV2Client } from './twitterClient'

export const likeTweet = async (tweetId: string): Promise<void> => {
  const currUser = await currentTwitterUser()
  await twitterV2Client.like(currUser.id_str, tweetId)
}

export const replyToTweet = async (
  tweetId: string,
  replyMsg: string
): Promise<void> => {
  await twitterV2Client.reply(replyMsg, tweetId)
}
