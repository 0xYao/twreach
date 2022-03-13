import { Prospect } from '@prisma/client'
import { readFileSync } from 'fs'
import { GluegunCommand } from 'gluegun'
import { db } from '../db/client'
import { prospectStore } from '../db/prospects'
import { twitterV2Client } from '../services/twitter/twitterClient'

const cmd: GluegunCommand = {
  name: 'upsert-prospects',
  run: async ({ print, parameters }) => {
    const jsonFile = parameters.options.jsonFile

    if (!jsonFile) {
      print.error(`Input jsonFile is not defined.`)
      return
    }

    const buffer = readFileSync(jsonFile)
    const data: Prospect[] = JSON.parse(buffer.toString('utf-8'))

    if (data.length > 900) {
      throw new Error(
        'Too many prospects, must have no more than 900 prospects.'
      )
    }

    const finalProspects: Prospect[] = []

    print.info('Massaging the prospects data...')

    // Fetch Twitter Id for each prospect, not using usersByUsernames
    // because the whole  request will fail if there is one invalid account
    const promises = data.map(async (prospect) => {
      try {
        const [user, engagement, engagementError] = await Promise.all([
          twitterV2Client.userByUsername(prospect.username),
          db.engagementRecord.findUnique({
            where: {
              prospectUsername: prospect.username,
            },
          }),
          db.engagementErrorRecord.findUnique({
            where: {
              prospectUsername: prospect.username,
            },
          }),
        ])

        finalProspects.push({
          ...prospect,
          userId: user.data.id,
          engagementId: engagement?.id ?? null,
          engagementErrorId: engagementError?.id ?? null,
        })
      } catch (err) {
        if (err instanceof Error) {
          print.error(
            `Failed to fetch data for ${prospect.username}, they might not have a Twitter account.`
          )
        }
      }
    })

    await Promise.all(promises)
    await prospectStore.upsertProspects(finalProspects)
    print.success(
      `Successfully updated/added ${finalProspects.length} prospects!`
    )
  },
}

module.exports = cmd
