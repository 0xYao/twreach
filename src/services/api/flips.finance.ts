import { Maybe } from '../../types'
import { requestWrapper } from './request'

type FlipFinanceStats = {
  // ...other fields omitted
  market_cap: number
  floor_price: number
}

type FlipFinanceRanking = {
  // ...other fields omitted
  stats: FlipFinanceStats
  name: string
  slug: string
  stake: boolean
  _id: string
}

type FlipFinanceCollectionData = FlipFinanceRanking & {
  website: string
  contract_address: string
  twitter: Maybe<string>
  instagram: Maybe<string>
  discord_url: Maybe<string>
}

const requestBackend = requestWrapper('https://flipsback.herokuapp.com')
const requestNextServer = requestWrapper(
  'https://www.flips.finance/_next/data/jppPvdaU03ITeCBQJmDQi'
)

export const getFlipFinanceRankings = async (): Promise<
  FlipFinanceRanking[]
> => {
  return requestBackend('/getRankings')
}

const getFlipFinanceCollectionData = async (
  slugName: string
): Promise<FlipFinanceCollectionData> => {
  return requestNextServer<{
    pageProps: {
      d: {
        collection: FlipFinanceCollectionData[]
      }
    }
  }>(`/collection/${slugName}.json`).then(
    (res) => res.pageProps.d.collection[0]
  )
}

export const getFlipFinanceCollections = async (): Promise<
  FlipFinanceCollectionData[]
> => {
  const rankings = await getFlipFinanceRankings()

  const result = await Promise.all(
    rankings.map(async (ranking) => {
      try {
        return await getFlipFinanceCollectionData(
          ranking.slug.trim().toLowerCase()
        )
      } catch (err) {
        return null
      }
    })
  )

  return result.filter((res) => !!res) as FlipFinanceCollectionData[]
}
