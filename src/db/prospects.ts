import {
  EngagementErrorRecordCreateManyInput,
  EngagementRecordCreateManyInput,
  Prospect,
} from '../types'
import { db } from './client'

interface IProspectStore {
  // read
  getNotContactedProspects(limit?: number): Promise<Prospect[]>

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
