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

export type FollowUpCreateManyInput = Prisma.FollowUpCreateManyInput

export type DMVariation = {
  text: string
  imagePath?: string
}

export type GetDMVariationInput = {
  name?: Maybe<string>
  projectName?: Maybe<string>
}

export type GetDMVariationsFunc = (input: GetDMVariationInput) => DMVariation[]

export interface CustomImplStore {
  getDMVariations: GetDMVariationsFunc
  getFollowUpVariations: GetDMVariationsFunc
}

// repliedAt is a unix timestamp in milliseconds
export type UpdateReplyData = { repliedAt: number; prospectUsername: string }
