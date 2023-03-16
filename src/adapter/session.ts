import Memcached from 'memcached'
import { unserializeSession } from 'php-unserialize'
import { promisify } from 'util'
import { z } from 'zod'
import {
  UserNotLoggedInException,
  MemcachedUserDataNotFoundException,
  MemcachedUserDataUnserializationFailedException,
} from '../exception/index.js'
import { rawSessionDataParser, sessionDataParser } from '../parser/index.js'

const SESSION_COOKIE_NAME = 'saatchisclocal'

const memcached: Memcached = new Memcached('legacy.session.memcached:11211', {
  // factor: 3, // Connection pool retry exponential backoff factor
  failures: 3, // the number of failed-attempts to a server before it is regarded as 'dead'.
  // maxTimeout: 5000, // 5 seconds, Connection pool retry max delay before retrying
  // minTimeout: 1000, // 1 seconds, Connection pool retry min delay before retrying
  // randomize: false, // Connection pool retry timeout randomization
  reconnect: 10000, // 10 seconds, default is ( 18000000 ms => 18000 seconds => 300 minutes )
  retries: 1, // Connection pool retries to pull connection from pool
  timeout: 5000, // 5 seconds, time after which Memcached sends a connection timeout
})
const memcachedGet: (key: string) => Promise<any> = promisify(memcached.get).bind(memcached)
// const memcachedSet = promisify(memcached.set).bind(memcached)
// const memcachedDelete = promisify(memcached.del).bind(memcached)

type SessionDataInterface = z.infer<typeof sessionDataParser>
type RawSessionDataInterface = z.infer<typeof rawSessionDataParser>

/**
 * @throws MemcachedUserDataNotFoundException
 * @throws MemcachedUserDataUnserializationFailedException
 * @throws UserNotLoggedInException
 */
async function getMemcachedUserData(sessionCookie: string | null): Promise<SessionDataInterface> {
  if (!sessionCookie) {
    throw new UserNotLoggedInException('User is not logged in')
  }

  const serializedSessionData = await memcachedGet(`memc.sess.saatchi_legacy.${sessionCookie}`)

  if (!serializedSessionData) {
    throw new MemcachedUserDataNotFoundException('Memcached user data not found in session')
  }

  const rawSessionData: RawSessionDataInterface = rawSessionDataParser.parse(
    unserializeSession(serializedSessionData)
  )

  if (!rawSessionData.Zend_Auth?.storage?.body) {
    throw new MemcachedUserDataUnserializationFailedException(
      `Failed to unserialize session data: ${serializedSessionData}`
    )
  }

  const measurementSystem = rawSessionData?.Saatchi?.measurementSystem ?? 'INCH'
  const zendUserFavorites = rawSessionData?.Saatchi?.userFavorites ?? {}

  return {
    ...rawSessionData.Zend_Auth.storage.body,
    measurementSystem,
    userFavorites: Object.values(zendUserFavorites),
  }
}

export { getMemcachedUserData, SESSION_COOKIE_NAME }
