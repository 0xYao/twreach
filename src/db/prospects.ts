import { EngagementRecord, Prospect } from '../types'
import { db } from './client'

interface IProspectStore {
  // read
  getNotContactedProspects(): Promise<Prospect[]>

  // write
  addProspects(prospects: Prospect[]): Promise<void>
  addEngagementRecords(
    engagements: Omit<EngagementRecord, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<void>
}

export const prospectStore: IProspectStore = {
  async getNotContactedProspects() {
    return db.prospect.findMany({
      where: {
        engagement: {
          is: null,
        },
      },
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
}
