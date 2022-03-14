import { FollowUp } from '@prisma/client'
import dayjs = require('dayjs')
import {
  EngagementErrorRecordCreateManyInput,
  EngagementRecordCreateManyInput,
  FollowUpCreateManyInput,
  Prospect,
  UpdateReplyData,
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
  getProspectsToFollowUp(options?: {
    limit?: number
    includeUsernames?: string[]
    excludeUsernames?: string[]
    minDaysSinceLastReply?: number
  }): Promise<(Prospect & { followUps: FollowUp[] })[]>

  // write
  upsertProspects(prospects: Prospect[]): Promise<void>
  addEngagementRecords(
    engagements: EngagementRecordCreateManyInput[]
  ): Promise<void>

  addEngagementErrors(
    errors: EngagementErrorRecordCreateManyInput[]
  ): Promise<void>

  addFollowUps(followUps: FollowUpCreateManyInput[]): Promise<void>
  updateReplies(replies: UpdateReplyData[]): Promise<void>
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
  async getProspectsToFollowUp(options) {
    const thresholdDate = dayjs().subtract(
      options?.minDaysSinceLastReply ?? 3,
      'day'
    )

    return db.prospect.findMany({
      where: {
        engagement: {
          createdAt: {
            lte: thresholdDate.toDate(),
          },
          repliedAt: {
            equals: null,
          },
        },
        engagementError: {
          is: null,
        },
        username: {
          in: options?.includeUsernames,
          notIn: options?.excludeUsernames,
        },
        followUps: {
          every: {
            createdAt: {
              lte: thresholdDate.toDate(),
            },
          },
        },
      },
      take: options?.limit,
      include: {
        followUps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  },
  // write
  async upsertProspects(prospects) {
    const txns = prospects.map((p) =>
      db.prospect.upsert({
        where: {
          username: p.username,
        },
        create: {
          ...p,
        },
        update: {
          ...p,
        },
      })
    )

    await db.$transaction(txns)
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
  async addFollowUps(followUps) {
    await db.followUp.createMany({
      data: followUps,
    })
  },
  async updateReplies(replies) {
    const txns = replies.map(({ repliedAt, prospectUsername }) =>
      db.engagementRecord.update({
        where: {
          prospectUsername,
        },
        data: {
          repliedAt: dayjs(repliedAt).unix(),
        },
      })
    )

    await db.$transaction(txns)
  },
}
