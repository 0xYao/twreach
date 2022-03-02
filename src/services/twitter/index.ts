import { UserV1 } from 'twitter-api-v2'
import { twitterV1Client } from './twitterClient'

export const currentTwitterUser = async (): Promise<UserV1> => {
  return twitterV1Client.verifyCredentials()
}
