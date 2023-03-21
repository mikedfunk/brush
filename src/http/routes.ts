import { getArtwork } from './controller/artworkController.js'
import { getAllClientData } from './controller/userController.js'
import { Application, RequestHandler } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

function proxyTo(pathRewrite: (path: string) => string): RequestHandler
{
  return createProxyMiddleware({
    target: 'http://paint.nginx',
    changeOrigin: true,
    pathRewrite: (path: string): string => pathRewrite(path),
  })
}

function routes(app: Application): void {
  app.get('/all-client-data', getAllClientData)
  app.get('/artwork/:artworkId', proxyTo((path: string) => path.replace('/artwork', '/browsing/artwork')))
}

export default routes
