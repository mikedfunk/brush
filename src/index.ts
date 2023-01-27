import express from 'express'
import * as http from 'http'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import routes from './routes.js'

dotenv.config()

const app: express.Application = express()

// use middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// prepare the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
}

app.use(expressWinston.logger(loggerOptions))

routes(app)

const port = 8010
const server: http.Server = http.createServer(app)

server.listen(port, () => {
  console.info(`Server running on port ${port}`)
})
