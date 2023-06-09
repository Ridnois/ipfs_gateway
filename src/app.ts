import express from 'express'
import IPFSRouter from './routes/ipfs'
import MetadataRouter from './routes/metadata'
import morgan from 'morgan'
import cors from 'cors'

const app = express()

app.use(morgan('tiny'))
// Just a health check
app.use(express.json())

app.get('/health-check', (req, res) => res.json({ status: 'live' }))
// Ipfs routing
app.use('/ipfs', cors(), IPFSRouter)
app.use('/metadata', cors(), MetadataRouter)

export default app
