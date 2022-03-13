// Template for your own custom implementations of different functions
// Only edit this when you have changed type definitions or you are adding a new method

import { CustomImplStore, DMVariation } from '../types'
import { NotImplementedError } from '../utils/errors'

export const customImplStore: CustomImplStore = {
  getDMVariations(_) {
    /***
    // Example code
    const _1: DMVariation = {
      text: 'Hello, my first message.',
    }

    const _2: DMVariation = {
      imagePath: './src/assets/some_image.png',
      text: 'Hello, my second message.',
    }

    return [_1, _2]
     */
    throw new NotImplementedError('getDMVariations is not implemented.')
  },
  getFollowUpVariations(_) {
    /**
     // Example code
     const _1: DMVariation = {
        text: 'Hello, my first follow-up message.',
      }

    const _2: DMVariation = {
      imagePath: './src/assets/some_image.png',
      text: 'Hello, my second follow-up message.',
    }

    return [_1, _2]
     */
    throw new NotImplementedError('getFollowUpVariations is not implemented.')
  },
}
