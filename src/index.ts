// vim: set fdm=marker:

import express from 'express'
import * as http from 'http'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {
  ArtworkNotFoundException,
  HttpException,
  MemcachedUserDataNotFoundException,
  MemcachedUserDataUnserializationFailedException,
  UserNotLoggedInException,
} from './exceptions/index.js'
import { getArtworkDataByArtworkId } from './paletteApi/index.js'
import { getMemcachedUserData } from './session/index.js'

// express app setup {{{

dotenv.config()

const app: express.Application = express()

// use middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// prepare the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
}

app.use(expressWinston.logger(loggerOptions))

// }}}

// routes {{{

// all-client-data {{{
app.get('/all-client-data', async (request: express.Request, response: express.Response) => {
  try {
    const memcachedUserData = await getMemcachedUserData(request, response)

    response.json(memcachedUserData)
  } catch (error: any) {
    if (error instanceof UserNotLoggedInException) {
      response.status(401).json({ error: 'User not logged in' })

      return
    }

    if (error instanceof MemcachedUserDataNotFoundException) {
      response.status(404)

      return
    }

    console.error(error)

    if (error instanceof MemcachedUserDataUnserializationFailedException) {
      response.status(500).json({ error: 'Failed to deserialize user session data' })

      return
    }

    if (error instanceof Error) {
      response.status(500).json({ error: error.message })

      return
    }

    response.status(500).json({ error: 'Unknown error' })
  }
})
// }}}

// get artwork {{{
app.get(
  '/artworks/:artworkId',
  async (request: express.Request, response: express.Response): Promise<void> => {
    const {
      params: { artworkId },
    } = request
    try {
      const artworkData = await getArtworkDataByArtworkId(artworkId)
      response.json(artworkData)
    } catch (error: any) {
      if (error instanceof ArtworkNotFoundException) {
        response.status(404).json({ status: `Artwork ${artworkId} not found` })

        return
      }

      console.error(error)

      if (error instanceof HttpException) {
        response
          .status(500)
          .json({ status: `Error ${error.response.status} fetching artwork ${artworkId}` })

        return
      }

      console.error(error)
      response.status(500).json({ status: `Error fetching artwork ${artworkId}` })
    }
  }
)
// }}}

// }}}

// listen {{{
const port = 8010
const server: http.Server = http.createServer(app)

server.listen(port, () => {
  console.info(`Server running on port ${port}`)
})
// }}}
