import 'dotenv/config'

export const AppConfig = {
  appKey: process.env.APP_KEY ?? '',
  appSecret: process.env.APP_SECRET ?? '',
  accessToken: process.env.ACCESS_TOKEN ?? '',
  accessSecret: process.env.ACCESS_SECRET ?? '',
  openSeaApiKey: process.env.OPENSEA_API_KEY ?? '',
}
