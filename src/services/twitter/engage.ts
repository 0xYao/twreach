import {
  TweetV2,
  UserV2FollowResult,
  SendDMV1Params,
  DirectMessageCreateV1Result,
  UserV2,
} from 'twitter-api-v2'
import { currentTwitterUser } from '.'
import { twitterV1Client, twitterV2Client } from './twitterClient'

export const getTwitterTimeline = async (
  username: string,
  limit = 3
): Promise<{
  user: UserV2
  tweets: TweetV2[]
}> => {
  const user = await twitterV2Client.userByUsername(username)
  const timeline = await twitterV2Client.userTimeline(user.data.id)

  return {
    user: user.data,
    tweets: timeline.tweets.slice(0, limit),
  }
}

export const followTwitterUser = async (
  followingId: string
): Promise<UserV2FollowResult> => {
  const currentUser = await currentTwitterUser()
  return twitterV2Client.follow(currentUser.id_str, followingId)
}

export const twitterDm = async (
  params: SendDMV1Params
): Promise<DirectMessageCreateV1Result> => twitterV1Client.sendDm(params)
