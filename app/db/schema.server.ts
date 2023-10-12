import { timestamp, pgTable, integer, uuid, jsonb } from 'drizzle-orm/pg-core'

import type { Puzzle } from '~/types'

export const room = pgTable('room', {
  id: uuid('id').primaryKey().defaultRandom(),
  puzzle: jsonb('puzzle').notNull().$type<Puzzle>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cell = pgTable('cell', {
  id: uuid('id').primaryKey().defaultRandom(),
  row: integer('row').notNull(),
  column: integer('column').notNull(),
  roomId: uuid('puzzleId')
    .references(() => room.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
