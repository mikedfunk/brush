// vim: set fdm=marker:

// setup {{{
import express from 'express'
import * as http from 'http'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import debug from 'debug'
import { promisify } from 'util'
import Memcached from 'memcached'
import * as dotenv from 'dotenv'
import { unserializeSession } from 'php-unserialize'
import cookieParser from 'cookie-parser'
import { z } from 'zod'

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

if (!process.env.DEBUG) {
  loggerOptions.meta = false // when not debugging, log requests as one-liners
}

app.use(expressWinston.logger(loggerOptions))
const debugLog: debug.IDebugger = debug('index')

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

const measurementSystemParser = z.enum(['INCH', 'CENTIMETER']).optional()
// const favoriteArtworkIdsParser = z.union([ // either or
//   z.object({}),
//   z.array(z.number())
// ])
const favoriteArtworkIdsParser = z.array(z.number()).catch([]) // if it's empty, it will come in as {}. Change that to [].

const zendSessionDataParser = z.object({
  admin_full_name: z.string().optional(),
  adminId: z.number().optional(),
  check_in_timer_started_at: z.string().optional(),
  email: z.string(),
  first_name: z.string(),
  isEaselAdmin: z.boolean(),
  is_limited_artist: z.coerce.boolean(), // comes in as 0|1
  is_verified_to_sell: z.boolean().optional(),
  last_name: z.string(),
  id: z.number(),
  username: z.string().nullable(),
  user_type_id: z.number().gte(1).lte(2),
})

const sessionDataParser = zendSessionDataParser.extend({
  userFavorites: favoriteArtworkIdsParser,
  measurementSystem: measurementSystemParser,
})

type SessionDataInterface = z.infer<typeof sessionDataParser>

const rawSessionDataParser = z.object({
  Zend_Auth: z.object({
    storage: z.object({
      body: zendSessionDataParser,
    })
  }).optional(),
  Saatchi: z.object({
    userFavorites: favoriteArtworkIdsParser,
    measurementSystem: measurementSystemParser,
  }).optional(),
})

type RawSessionDataInterface = z.infer<typeof rawSessionDataParser>

class MemcachedUserDataNotFoundException extends Error {}

class ArtworkNotFoundException extends Error {
  readonly artworkId: string
  constructor(artworkId: string) {
    super(`Artwork ${artworkId} not found`)
    this.artworkId = artworkId
  }
}

class HttpException extends Error {
  readonly response: Response
  constructor(response: Response) {
    super('HTTP Exception')
    this.response = response
  }
}

class MemcachedUserDataUnserializationFailedException extends Error {}
class UserNotLoggedInException extends Error {}

/**
 * @throws MemcachedUserDataNotFoundException
 * @throws MemcachedUserDataUnserializationFailedException
 * @throws UserNotLoggedInException
 */
const getMemcachedUserData = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<SessionDataInterface>> => {
  // debugLog(req)
  const sessionCookieName = req.cookies[SESSION_COOKIE_NAME] ?? null

  if (!sessionCookieName) {
    throw new UserNotLoggedInException("User is not logged in")
  }

  const serializedSessionData = await memcachedGet(`memc.sess.saatchi_legacy.${sessionCookieName}`)

  if (!serializedSessionData) {
    throw new MemcachedUserDataNotFoundException('Memcached user data not found in session')
  }

  debugLog(JSON.stringify((unserializeSession(serializedSessionData))))
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

const artworkDataParser = z.object({
  artwork_id: z.string(),
  is_legacy_artwork: z.boolean(),
  legacy_user_art_id: z.number(),
  user_id: z.number(),
  created_at: z.number(),
  uploaded_at: z.number(),
  modified_at: z.number(),
  year_produced: z.number(),
  is_deleted: z.boolean(),
  artwork_image: z.object({
    main_url: z.string(),
    thumbnail_url: z.string(),
    polaroid_url: z.string(),
    fullscreen_url: z.string(),
    original_width: z.number(),
    original_height: z.number(),
    crops: z.object({
      studio: z.object({
        square: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
        print: z.object({
          x: z.number().nullable(),
          y: z.number().nullable(),
          width: z.number().nullable(),
          height: z.number().nullable(),
        }),
      }),
    }),
  }),
  additional_images: z.array(z.object({})),
  youtube_video_id: z.string().nullable(),
  title: z.string(),
  width: z.string(),
  height: z.string(),
  depth: z.string(),
  description: z.string(),
  total_likes: z.number(),
  total_views: z.number(),
  total_curation_votes: z.number(),
  category: z.string(),
  subject: z.string(),
  styles: z.array(z.string()),
  mediums: z.array(z.string()),
  keywords: z.array(z.string()),
  materials: z.array(z.string()),
  has_original: z.boolean(),
  is_multipanel: z.boolean(),
  panels: z.number(),
  is_safe: z.boolean(),
  visibility: z.enum(['published', 'draft']),
  has_open_editions: z.boolean(),
  has_limited_editions: z.boolean(),
  cheapest_print_price: z.number().nullable(),
  slug: z.string(),
  url: z.string(),
  products: z.array(z.object({})),
})

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

  return json
}
// }}}

// routes {{{

// all-client-data {{{
app.get('/all-client-data', async (req: express.Request, res: express.Response) => {
  try {
    const memcachedUserData = await getMemcachedUserData(req, res)

    res.json(memcachedUserData)
  } catch (error) {
    debugLog(error)

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
      debugLog(err)
      res.status(500).json({ status: `Error ${err.response.status} fetching artwork ${artworkId}`})

      return
    }

    debugLog(err)
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
