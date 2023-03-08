import { Application } from 'express'
import { getArtwork } from './controllers/artworkController.js'
import { getAllClientData } from './controllers/userController.js'

function routes(app: Application): void {
  app.get('/all-client-data', getAllClientData)
  app.get('/artwork/:artworkId', getArtwork)
}

export default routes
