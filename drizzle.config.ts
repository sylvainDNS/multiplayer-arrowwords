import type { Config } from 'drizzle-kit'

export default {
  schema: './app/db/schema.server.ts',
  out: './app/db/migrations',
} satisfies Config
