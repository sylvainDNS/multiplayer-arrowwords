import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

if (!process.env.DATABASE_PATH) {
  throw new Error('Missing environment variable: DATABASE_PATH')
}
const queryClient = postgres(process.env.DATABASE_PATH)
export const db: PostgresJsDatabase = drizzle(queryClient)

// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: 'app/db/migrations',
})
