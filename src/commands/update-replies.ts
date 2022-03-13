import { readFileSync } from 'fs'
import { GluegunCommand } from 'gluegun'
import { prospectStore } from '../db/prospects'
import {
  twitterV1Client,
  twitterV2Client,
} from '../services/twitter/twitterClient'
import { UpdateReplyData } from '../types'

// TODO: update the replies time by default before following up with the prospect
const cmd: GluegunCommand = {
  alias: ['up'],
  name: 'update-replies',
  run: async ({ print, parameters }) => {
    throw new Error('update-replies not implemented')
  },
}

module.exports = cmd
