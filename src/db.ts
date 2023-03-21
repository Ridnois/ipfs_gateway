import mongoose from 'mongoose'
import { config  } from 'dotenv'

config()

mongoose.connect(process.env.MONGODB_URI as string)

const db = mongoose.connection

db.on('error', (error: Error) => console.log(error))

db.once('connected', () => console.log(` Database running on ${process.env.MONGODB_URI}`))
