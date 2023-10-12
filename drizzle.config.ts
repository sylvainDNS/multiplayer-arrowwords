import * as dotenv from 'dotenv'
import type { Config } from 'drizzle-kit'

dotenv.config()

export default {
  schema: './app/db/schema.server.ts',
  out: './app/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_PATH as string,
  },
} satisfies Config
