// vim: set fdm=marker:

// setup {{{
import express from 'express'
import * as http from 'http'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import { promisify } from 'util'
import Memcached from 'memcached'
import * as dotenv from 'dotenv'
import { unserializeSession } from 'php-unserialize'
import cookieParser from 'cookie-parser'
import { z } from 'zod'
import { artworkDataParser, rawSessionDataParser, sessionDataParser } from './parsers/index.js'
import { ArtworkNotFoundException, HttpException, MemcachedUserDataNotFoundException, MemcachedUserDataUnserializationFailedException, UserNotLoggedInException } from './exceptions/index.js'

dotenv.config()

const app: express.Application = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

// here we are preparing the expressWinston logging middleware configuration,
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

const PALETTE_URL = 'http://palette.nginx'
// }}}

// session {{{
const MEMCACHED_URL = 'legacy.session.memcached:11211'
const MEMCACHED_OPTIONS = {
  factor: 3, // Connection pool retry exponential backoff factor
  failures: 3, // the number of failed-attempts to a server before it is regarded as 'dead'.
  maxTimeout: 5000, // 5 seconds, Connection pool retry max delay before retrying
  minTimeout: 1000, // 1 seconds, Connection pool retry min delay before retrying
  randomize: false, // Connection pool retry timeout randomization
  reconnect: 10000, // 10 seconds, default is ( 18000000 ms => 18000 seconds => 300 minutes )
  retries: 1, // Connection pool retries to pull connection from pool
  timeout: 5000, // 5 seconds, time after which Memcached sends a connection timeout
}
const memcached = new Memcached(MEMCACHED_URL, MEMCACHED_OPTIONS)
const memcachedGet = promisify(memcached.get).bind(memcached)
// const memcachedSet = promisify(memcached.set).bind(memcached)
// const memcachedDelete = promisify(memcached.del).bind(memcached)

const SESSION_COOKIE_NAME = 'saatchisclocal'

type SessionDataInterface = z.infer<typeof sessionDataParser>

type RawSessionDataInterface = z.infer<typeof rawSessionDataParser>

/**
 * @throws MemcachedUserDataNotFoundException
 * @throws MemcachedUserDataUnserializationFailedException
 * @throws UserNotLoggedInException
 */
const getMemcachedUserData = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<SessionDataInterface>> => {
  const sessionCookieName = req.cookies[SESSION_COOKIE_NAME] ?? null

  if (!sessionCookieName) {
    throw new UserNotLoggedInException("User is not logged in")
  }

  const serializedSessionData = await memcachedGet(`memc.sess.saatchi_legacy.${sessionCookieName}`)

  if (!serializedSessionData) {
    throw new MemcachedUserDataNotFoundException('Memcached user data not found in session')
  }

  const rawSessionData: RawSessionDataInterface = rawSessionDataParser.parse(unserializeSession(serializedSessionData))

  if (!rawSessionData.Zend_Auth?.storage?.body) {
    throw new MemcachedUserDataUnserializationFailedException(
      `Failed to unserialize session data: ${serializedSessionData}`
    )
  }

  const measurementSystem = rawSessionData?.Saatchi?.measurementSystem ?? 'INCH'
  const zendUserFavorites = rawSessionData?.Saatchi?.userFavorites ?? {}

  return res.json({
    ...rawSessionData.Zend_Auth.storage.body,
    measurementSystem,
    userFavorites: Object.values(zendUserFavorites),
  })
}
// }}}

// palette api {{{

type ArtworkDataInterface = z.infer<typeof artworkDataParser>

/**
 * @throws ArtworkNotFoundException
 * @throws HttpException
 */
async function getArtworkDataByArtworkId (artworkId: string): Promise<ArtworkDataInterface> {
  const response = await fetch(`${PALETTE_URL}/artwork/${artworkId}`)

  if (response.status === 404) {
    throw new ArtworkNotFoundException(artworkId)
  }

  if (response.status !== 200) {
    throw new HttpException(response)
  }

  const json = await response.json()
  const artworkData = artworkDataParser.parse(json)

  return artworkData
}
// }}}

// routes {{{

// all-client-data {{{
app.get('/all-client-data', async (req: express.Request, res: express.Response) => {
  try {
    const memcachedUserData = await getMemcachedUserData(req, res)

    res.json(memcachedUserData)
  } catch (error) {

    if (error instanceof UserNotLoggedInException) {
      res.status(401).json({ error: 'User not logged in' })

      return
    }

    if (error instanceof MemcachedUserDataNotFoundException) {
      res.status(404)

      return
    }

    if (error instanceof MemcachedUserDataUnserializationFailedException) {
      res.status(500).json({ error: "Failed to deserialize user session data" })

      return
    }

    if (error instanceof Error) {
      res.status(500).json({ error: error.message })

      return
    }

    res.status(500).json({ error: 'Unknown error' })
  }
})
// }}}

// artworks {{{
app.get('/artworks/:artworkId', async (req: express.Request, res: express.Response) => {
  const { params: { artworkId } } = req
  try {
    const artworkData = await getArtworkDataByArtworkId(artworkId)
    res.json(artworkData)
  } catch (err: any) {
    if (err instanceof ArtworkNotFoundException) {
      res.status(404).json({ status: `Artwork ${artworkId} not found` })

      return
    }

    if (err instanceof HttpException) {
      console.error(err)
      res.status(500).json({ status: `Error ${err.response.status} fetching artwork ${artworkId}`})

      return
    }

    console.error(err)
    res.status(500).json({ status: `Error fetching artwork ${artworkId}` })
  }
})
// }}}

// }}}

// listen {{{
const port = 8010
const server: http.Server = http.createServer(app)

server.listen(port, () => {
  console.info(`Server running on port ${port}`)
})
// }}}
