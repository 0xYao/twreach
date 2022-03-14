import { FollowUp } from '@prisma/client'
import { customImplStore } from '../tmp/custom-impl'
import { DMVariation, Prospect } from '../types'

/**
 * @param time in ms
 * @returns wait for x ms
 */
export const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const random = (min: number, max: number): number => {
  const _min = Math.ceil(min)
  const _max = Math.floor(max)

  return Math.floor(Math.random() * (_max - _min + 1)) + _min
}

export const getRandomFromArray = <T>(
  dataArray: T[]
): {
  index: number
  data: T
} => {
  const index = random(0, dataArray.length - 1)

  return {
    index,
    data: dataArray[index],
  }
}

export const getNextFollowUp = ({
  prospect,
  sentFollowUps,
}: {
  sentFollowUps: FollowUp[]
  prospect: Prospect
}): { index: number; data: DMVariation } | null => {
  const followUps = customImplStore.getFollowUpVariations({
    name: prospect.greetingName,
    projectName: prospect.projectName,
  })

  if (sentFollowUps.length === 0) {
    return {
      index: 0,
      data: followUps[0],
    }
  }

  const lastFollowUp = sentFollowUps[sentFollowUps.length - 1]

  if (lastFollowUp.variationIndex >= followUps.length - 1) {
    return null
  }

  return {
    index: lastFollowUp.variationIndex + 1,
    data: followUps[lastFollowUp.variationIndex + 1],
  }
}
