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

export {
  MemcachedUserDataNotFoundException,
  ArtworkNotFoundException,
  HttpException,
  MemcachedUserDataUnserializationFailedException,
  UserNotLoggedInException,
}
