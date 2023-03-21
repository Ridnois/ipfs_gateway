import app from './app'
import { config } from 'dotenv'

import "./db"

config()

app.listen(process.env.PORT, () => {
  console.log(`🚀 App running on ${process.env.PORT}`)
})

