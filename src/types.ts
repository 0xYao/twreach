import {
  Prospect as DbProspect,
  EngagementRecord as DbEngagementRecord,
} from '@prisma/client'

// prisma db types
export type Maybe<T> = T | undefined | null

export type EngagementRecord = DbEngagementRecord
export type Prospect = DbProspect
