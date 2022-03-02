import { Prospect } from '@prisma/client'
import { readFileSync } from 'fs'
import { GluegunCommand } from 'gluegun'
import { prospectStore } from '../db/prospects'

const cmd: GluegunCommand = {
  name: 'create-prospects',
  run: async ({ print, parameters }) => {
    const jsonFile = parameters.options.jsonFile

    if (!jsonFile) {
      print.error(`Input jsonFile is not defined.`)
      return
    }

    const buffer = readFileSync(jsonFile)
    const data: Prospect[] = JSON.parse(buffer.toString('utf-8'))

    await prospectStore.addProspects(data)
    print.success(`Successfully added ${data.length} prospects!`)
  },
}

module.exports = cmd
