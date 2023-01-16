import { artworkDataParser } from '../parsers/index.js'
import { z } from 'zod'
import { ArtworkNotFoundException, HttpException } from '../exceptions/index.js'

const PALETTE_URL = 'http://palette.nginx'

type ArtworkDataInterface = z.infer<typeof artworkDataParser>

/**
 * @throws ArtworkNotFoundException
 * @throws HttpException
 */
async function getArtworkDataByArtworkId(artworkId: string): Promise<ArtworkDataInterface> {
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

export { getArtworkDataByArtworkId }
