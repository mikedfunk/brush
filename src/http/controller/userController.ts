import express from 'express'
import { ZodError } from 'zod'
import {
  MemcachedUserDataNotFoundException,
  MemcachedUserDataUnserializationFailedException,
  UserNotLoggedInException,
} from '../../exception/index.js'
import { getMemcachedUserData, SESSION_COOKIE_NAME } from '../../adapter/session.js'

async function getAllClientData(
  request: express.Request,
  response: express.Response
): Promise<void> {
  try {
    const sessionCookie: string | null = request.cookies[SESSION_COOKIE_NAME] ?? null
    const memcachedUserData = await getMemcachedUserData(sessionCookie)

    response.status(200).json(memcachedUserData)
  } catch (error: any) {
    if (error instanceof UserNotLoggedInException) {
      response.status(401).json({ error: 'User not logged in' })

      return
    }

    if (error instanceof MemcachedUserDataNotFoundException) {
      response.status(404).json({ error: 'User data not found' })

      return
    }

    console.error(error)

    if (error instanceof MemcachedUserDataUnserializationFailedException) {
      response.status(500).json({ error: 'Failed to deserialize user session data' })

      return
    }

    if (error instanceof ZodError) {
      response.status(500).json({ error: error.errors })

      return
    }

    if (error instanceof Error) {
      response.status(500).json({ error: error.message })

      return
    }

    response.status(500).json({ error: 'Unknown error' })
  }
}

export { getAllClientData }
