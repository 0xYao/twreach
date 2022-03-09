import {
  EngagementErrorRecordCreateManyInput,
  EngagementRecordCreateManyInput,
  Prospect,
} from '../types'
import { db } from './client'

type OutReachStats = {
  notContactedCounts: number
  totalProspectCounts: number
  contactedErrorCounts: number
  contactedSuccessCounts: number
}

interface IProspectStore {
  // read
  getNotContactedProspects(limit?: number): Promise<Prospect[]>
  getOutreachStats(): Promise<OutReachStats>

  // write
  addProspects(prospects: Prospect[]): Promise<void>
  addEngagementRecords(
    engagements: EngagementRecordCreateManyInput[]
  ): Promise<void>

  addEngagementErrors(
    errors: EngagementErrorRecordCreateManyInput[]
  ): Promise<void>
}

export const prospectStore: IProspectStore = {
  // read
  async getNotContactedProspects(limit) {
    return db.prospect.findMany({
      where: {
        engagement: {
          is: null,
        },
        engagementError: {
          is: null,
        },
      },
      take: limit,
    })
  },
  async getOutreachStats() {
    const _1 = db.prospect.count()
    const _2 = db.prospect.count({
      where: {
        engagementError: {
          isNot: null,
        },
      },
    })

    const _3 = db.prospect.count({
      where: {
        engagement: {
          isNot: null,
        },
      },
    })

    const [totalProspectCounts, contactedErrorCounts, contactedSuccessCounts] =
      await Promise.all([_1, _2, _3])

    return {
      notContactedCounts:
        totalProspectCounts - contactedErrorCounts - contactedSuccessCounts,
      contactedSuccessCounts,
      contactedErrorCounts,
      totalProspectCounts,
    }
  },
  // write
  async addProspects(prospects) {
    await db.prospect.createMany({
      data: prospects,
    })
  },
  async addEngagementRecords(engagements) {
    await db.engagementRecord.createMany({
      data: engagements,
    })
  },
  async addEngagementErrors(errors) {
    await db.engagementErrorRecord.createMany({
      data: errors,
    })
  },
}
