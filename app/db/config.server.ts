import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import { config } from '~/config.server'

const queryClient = postgres(config.DATABASE_URL, {
  ssl: config.NODE_ENV === 'production' ? 'require' : false,
})
export const db: PostgresJsDatabase = drizzle(queryClient)

// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: 'app/db/migrations',
})
