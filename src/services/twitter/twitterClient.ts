import { TwitterApi } from 'twitter-api-v2'
import { AppConfig } from '../../utils/config'

export const twitterClient = new TwitterApi({
  appKey: AppConfig.appKey,
  appSecret: AppConfig.appSecret,
  accessToken: AppConfig.accessToken,
  accessSecret: AppConfig.accessSecret,
})

export const twitterV1Client = twitterClient.v1
export const twitterV2Client = twitterClient.v2
