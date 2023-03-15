import { artworkDataParser } from '../parsers/index.js'
import { z } from 'zod'
import { ArtworkNotFoundException, HttpException } from '../exceptions/index.js'

const PAINT_URL = 'http://paint.nginx'

type ArtworkDataInterface = z.infer<typeof artworkDataParser>

/**
 * @throws ArtworkNotFoundException
 * @throws HttpException
 */
async function getArtworkDataByArtworkId(artworkId: string): Promise<{ data: ArtworkDataInterface }> {
  const response = await fetch(`${PAINT_URL}/browsing/artwork/${artworkId}`)

  if (response.status === 404) {
    throw new ArtworkNotFoundException(artworkId)
  }

  if (response.status !== 200) {
    throw new HttpException(response)
  }

  const json = await response.json()
  const artworkData = artworkDataParser.parse(json.data)

  return { data: artworkData }
}

export { getArtworkDataByArtworkId }
