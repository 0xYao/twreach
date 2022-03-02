import { Maybe } from '../../types'
import { requestWrapper } from './request'

type CollectionDetail = {
  name: string
  discord_url: Maybe<string>
  external_url: Maybe<string>
  twitter_username: Maybe<string>
}

type Stats = {
  total_volume: number
  average_price: number
  floor_price: number
  total_sales: number
}

type CollectionData = {
  slug: string
  image_url: string
  stats?: Stats
  details?: CollectionDetail
}

const request = requestWrapper('https://collections.rarity.tools')

const sanitizeTwitterUsername = (username: Maybe<string>) => {
  if (!username) {
    return null
  }

  const result = username[0] === '@' ? username.slice(1) : username
  return result.trim().toLowerCase()
}

export const getRarityToolsCollection = (
  collectionSlug: string
): Promise<CollectionData> => {
  return request<CollectionData>(`/collectionDetails/${collectionSlug}`).then(
    (res) => {
      return {
        ...res,
        details: res.details
          ? {
              ...res.details,
              twitter_username: sanitizeTwitterUsername(
                res.details.twitter_username
              ),
            }
          : undefined,
      }
    }
  )
}

export const getRarityToolsCollectionsStats = (): Promise<
  Omit<CollectionData, 'details'>[]
> => {
  return request('/collectionsStats')
}
