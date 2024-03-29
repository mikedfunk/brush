import express from 'express'
import { ArtworkNotFoundException, HttpException } from '../../exception/index.js'
import { getArtworkDataByArtworkId } from '../../adapter/paintApi/index.js'
import { ZodError } from 'zod'

async function getArtwork(request: express.Request, response: express.Response): Promise<void> {
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

    if (error instanceof ZodError) {
      response.status(500).json({ error: error.errors })

      return
    }

    response.status(500).json({ status: `Error fetching artwork ${artworkId}` })
  }
}

export { getArtwork }
