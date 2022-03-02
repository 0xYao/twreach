import { AppConfig } from '../../utils/config'
import { requestWrapper } from '../api/request'

const BASE_URL = 'https://api.opensea.io/api/v1'

const request = requestWrapper(BASE_URL, {
  headers: {
    'X-API-KEY': AppConfig.openSeaApiKey,
  },
})

interface Stats {
  floor_price: number
  market_cap: number
  num_owners: number
  total_sales: number
  total_volume: number
}

interface Collection {
  banner_image_url: string
  chat_url?: string
  created_date: Date
  default_to_fiat: boolean
  description: string
  dev_buyer_fee_basis_points: string
  dev_seller_fee_basis_points: string
  discord_url: string
  external_url: string
  featured: boolean
  featured_image_url: string
  hidden: boolean
  safelist_request_status: string
  image_url: string
  is_subject_to_whitelist: boolean
  large_image_url: string
  medium_username?: string
  name: string
  only_proxied_transfers: boolean
  opensea_buyer_fee_basis_points: string
  opensea_seller_fee_basis_points: string
  payout_address?: string
  require_email: boolean
  short_description?: string
  slug: string
  telegram_url?: string
  twitter_username: string
  instagram_username?: string
  wiki_url?: string
  stats: Stats
}

export const getOpenSeaCollections = async (params?: {
  offset?: number
  limit?: number
}): Promise<Collection[]> => {
  return request<{ collections: Collection[] }>('/collections', {
    params,
  }).then((res) => res.collections)
}

export const getOpenSeaCollection = async (
  collectionSlug: string
): Promise<Collection> => {
  return request<{ collection: Collection }>(
    `/collection/${collectionSlug}`
  ).then((res) => res.collection)
}
