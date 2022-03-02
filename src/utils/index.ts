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
