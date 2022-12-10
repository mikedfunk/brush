import express from 'express'
import * as http from 'http'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import debug from 'debug'

const app: express.Application = express()

app.use(express.json())
app.use(cors())

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
}

if (!process.env.DEBUG) {
    loggerOptions.meta = false // when not debugging, log requests as one-liners
}

app.use(expressWinston.logger(loggerOptions))
const debugLog: debug.IDebugger = debug('index')

app.get('/', (req: express.Request, res: express.Response) => {
    debugLog('/ called')
    res.status(200).json({'success': 1})
})

const port = 8010
const server: http.Server = http.createServer(app)

server.listen(port, () => {
    console.info(`Server running on port ${port}`)
})
