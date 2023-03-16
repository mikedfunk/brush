import { Application } from 'express'
import { getArtwork } from './controller/artworkController.js'
import { getAllClientData } from './controller/userController.js'

function routes(app: Application): void {
  app.get('/all-client-data', getAllClientData)
  app.get('/artwork/:artworkId', getArtwork)
}

export default routes
