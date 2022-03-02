import { GluegunCommand } from 'gluegun'
import { getProspects } from '../services/api/prospects'

import { writeFileSync } from 'fs'

const cmd: GluegunCommand = {
  alias: ['g-batches'],
  name: 'generate-prospect-batches',
  run: async ({ print, parameters }) => {
    const batchSize: number = parameters.options.batchSize
    if (!batchSize) {
      print.error(`Input batchSize is not defined.`)
      return
    }

    const prospects = await getProspects(batchSize)

    for (let i = 0; i < batchSize; i++) {
      writeFileSync(
        `./src/tmp/batch-${i}.json`,
        JSON.stringify(prospects[i], null, 2)
      )
    }

    print.success(`Finish writing ${batchSize} batches of prospects`)
  },
}

module.exports = cmd
