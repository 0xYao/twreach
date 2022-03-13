// Template for your own custom implementations of different functions
// Only edit this when you have changed type definitions or you are adding a new method

import { CustomImplStore, DMVariation } from '../types'

export const customImplStore: CustomImplStore = {
  getDMVariations(_) {
    const _1: DMVariation = {
      text: 'Hello, my first message.',
    }

    const _2: DMVariation = {
      imagePath: './src/assets/some_image.png',
      text: 'Hello, my second message.',
    }

    return [_1, _2]
  },
}
