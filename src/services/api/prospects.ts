import { PreDMEngagement } from '@prisma/client'
import { Prospect } from '../../types'
import {
  getRarityToolsCollection,
  getRarityToolsCollectionsStats,
} from './rarity.tools'

export const getProspects = async (
  batchCounts: number
): Promise<Prospect[][]> => {
  const collectionsStats = await getRarityToolsCollectionsStats()

  const collections = await Promise.all(
    collectionsStats.map((r) => getRarityToolsCollection(r.slug))
  )

  // Prevent duplicates, because some projects might be created by the same people
  const seenUsername = new Set<string>()

  const prospects = await Promise.all(
    collections.map(async (c) => {
      if (
        !c.details?.twitter_username ||
        seenUsername.has(c.details.twitter_username)
      ) {
        return null
      }

      seenUsername.add(c.details.twitter_username)

      return {
        userId: null,
        engagementId: null,
        greetingName: null,
        projectName: c.details.name,
        username: c.details.twitter_username,
        preDMEngagement:
          (c.stats?.total_volume ?? 0) >= 1_000
            ? PreDMEngagement.LIKE_AND_REPLY
            : PreDMEngagement.FOLLOW_ONLY,
      } as Prospect
    })
  )

  const result: Prospect[][] = []
  const collectionsWithTwitter = prospects.filter((s) => !!s) as Prospect[]
  const arrLength = collectionsWithTwitter.length

  const batchSize = Math.floor(arrLength / batchCounts)

  let lastRecordedIdx = 0

  for (let batchNum = 0; batchNum < batchCounts; batchNum++) {
    const batchCollection: Prospect[] = []

    for (let i = 0; i < batchSize; i++) {
      const idx = batchNum * batchSize + i
      lastRecordedIdx = idx

      const collection = collectionsWithTwitter[idx]
      batchCollection.push(collection)
    }

    result.push(batchCollection)
  }

  // push the rest of the data to the last element of the array
  // skip one because that was already pushed to the result
  for (let i = lastRecordedIdx + 1; i < arrLength; i++) {
    const collection = collectionsWithTwitter[lastRecordedIdx]
    result[result.length - 1].push(collection)
  }

  return result
}
