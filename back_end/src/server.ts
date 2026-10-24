import dotenv from 'dotenv'
import express from "express";
import cors from 'cors'
import telemetryroutes from './routes/telemetryroutes';
import noderoutes from './routes/nodesroutes';
import systemroutes from './routes/systemroutes';
import http from 'http'
import { getIO, initSocket } from './services/socket';
import { seedsystem } from './seed/systemseed';

const app = express()

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}))

app.use(express.json())

seedsystem()

app.use(['/telemetry', '/telemtry'], telemetryroutes)
app.use('/nodes', noderoutes)
app.use('/system', systemroutes)

const port = process.env.PORT || 5000

const server = http.createServer(app)
initSocket(server)

server.listen(port, () => {
    console.log(`server listening on port ${port}`)
})

