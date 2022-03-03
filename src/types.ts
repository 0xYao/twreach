import {
  Prospect as DbProspect,
  EngagementRecord as DbEngagementRecord,
  Prisma,
} from '@prisma/client'

// prisma db types
export type Maybe<T> = T | undefined | null

export type EngagementRecord = DbEngagementRecord
export type Prospect = DbProspect

export type EngagementRecordCreateManyInput =
  Prisma.EngagementRecordCreateManyInput

export type EngagementErrorRecordCreateManyInput =
  Prisma.EngagementErrorRecordCreateManyInput
