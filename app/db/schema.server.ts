import type { InferSelectModel } from 'drizzle-orm'
import {
  timestamp,
  pgTable,
  integer,
  uuid,
  jsonb,
  char,
  unique,
} from 'drizzle-orm/pg-core'

import type { Puzzle } from '~/types'

export const room = pgTable('room', {
  id: uuid('id').primaryKey().defaultRandom(),
  puzzle: jsonb('puzzle').notNull().$type<Puzzle>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cell = pgTable(
  'cell',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    row: integer('row').notNull(),
    col: integer('col').notNull(),
    roomId: uuid('room_id')
      .references(() => room.id)
      .notNull(),
    value: char('value', { length: 1 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  t => ({
    unq: unique().on(t.row, t.col, t.roomId),
  })
)
export type Cell = InferSelectModel<typeof cell>
