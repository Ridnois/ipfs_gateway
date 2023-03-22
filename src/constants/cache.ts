import { config } from 'dotenv'

config()

export const TIME_TO_LIVE = process.env.CACHE_TIME
