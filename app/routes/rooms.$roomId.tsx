import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { eq } from 'drizzle-orm'

import { Question } from '~/components/question'
import { Cell, FieldIndex, Row } from '~/components/ui'
import { db } from '~/db/config.server'
import { room } from '~/db/schema.server'
import { cn } from '~/lib/utils'
import type { Coordinates } from '~/types'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.info} · Mots fléchés multijoueurs` },
    {
      name: 'description',
      content: `Jouez aux mots fléchés du ${data?.info} avec vos ami·e·s!`,
    },
  ]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const selectedRooms = await db
    .select({ puzzle: room.puzzle })
    .from(room)
    .where(eq(room.id, params.roomId as string))
  const selectedRoom = selectedRooms[0]

  if (!selectedRoom) throw new Response('', { status: 404 })
  return json(selectedRoom.puzzle)
}

const findField = (row: number, col: number) => (field: Coordinates) =>
  field.row === row && field.col === col

export default () => {
  const { description } = useLoaderData<typeof loader>()

  const prizeWordFields = Array.from(
    { length: description.prizeWord.position.length },
    (_, index) => ({
      row: description.prizeWord.row,
      col: description.prizeWord.col + index,
    })
  )
  const rows = Array.from({ length: description.rows })
  const cols = Array.from({ length: description.cols })

  return (
    <div className="flex flex-col justify-center items-center gap-2 h-[100svh]">
      <div className="flex flex-col gap-px bg-black max-w-min p-px shadow-md">
        {rows.map((_, row) => (
          <Row key={row}>
            {cols.map((_, col) => {
              const questionField = description.questionFields.find(
                findField(row, col)
              )

              if (questionField)
                return <Question key={col} questionField={questionField} />

              const prizeWordFieldIndex = prizeWordFields.findIndex(
                findField(row, col)
              )
              const isPrizeWordField = prizeWordFieldIndex > -1

              const prizeFieldIndex = description.prizeFields.findIndex(
                findField(row, col)
              )
              const isPrizeField = prizeFieldIndex > -1

              const shouldDisplayPrizeIndex = isPrizeField || isPrizeWordField
              const index = isPrizeWordField
                ? prizeWordFieldIndex
                : prizeFieldIndex

              return (
                <Cell
                  key={col}
                  className={cn({ 'bg-slate-300': shouldDisplayPrizeIndex })}
                >
                  {shouldDisplayPrizeIndex && (
                    <FieldIndex>{index + 1}</FieldIndex>
                  )}
                  <input
                    type="text"
                    maxLength={1}
                    pattern="[a-zA-Z]"
                    className={cn(
                      'w-full h-full text-3xl font-light text-center uppercase bg-transparent',
                      'outline-none focus:bg-blue-200 focus:border focus:border-blue-400'
                    )}
                  />
                </Cell>
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}
