import { EngagementRecord, Prospect } from '../types'
import { db } from './client'

interface IProspectStore {
  // read
  getNotContactedProspects(limit?: number): Promise<Prospect[]>

  // write
  addProspects(prospects: Prospect[]): Promise<void>
  addEngagementRecords(
    engagements: Omit<EngagementRecord, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<void>
}

export const prospectStore: IProspectStore = {
  async getNotContactedProspects(limit) {
    return db.prospect.findMany({
      where: {
        engagement: {
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
}
