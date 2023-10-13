import { useEffect } from 'react'

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
} from '@remix-run/react'

import { eq } from 'drizzle-orm'
import { useEventSource } from 'remix-utils/sse/react'

import { Question } from '~/components/question'
import { Cell, FieldIndex, Row } from '~/components/ui'
import { db } from '~/db/config.server'
import { cell, room } from '~/db/schema.server'
import { cn } from '~/lib/utils'
import { emitter } from '~/services/emitter.server'
import type { Coordinates } from '~/types'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.puzzle?.info} · Mots fléchés multijoueurs` },
    {
      name: 'description',
      content: `Jouez aux mots fléchés du ${data?.puzzle?.info} avec vos ami·e·s!`,
    },
  ]
}

export async function action({ params, request }: ActionFunctionArgs) {
  const roomId = params.roomId
  if (!roomId) return json(null, { status: 400 })

  const formData = await request.formData()
  const row = Number.parseInt(formData.get('row') as string)
  const col = Number.parseInt(formData.get('col') as string)
  const char = formData.get('char') as string

  try {
    const [upsertedCell] = await db
      .insert(cell)
      .values({ row, col, roomId, value: char })
      .onConflictDoUpdate({
        target: [cell.row, cell.col, cell.roomId],
        set: { value: char },
      })
      .returning({ id: cell.id })

    emitter.emit('upserted-cell', upsertedCell.id)

    return json(null, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 })
    }
    throw error
  }
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const [selectedRooms, selectedCells] = await Promise.all([
    db
      .select({ puzzle: room.puzzle })
      .from(room)
      .where(eq(room.id, params.roomId as string)),
    db
      .select({ row: cell.row, col: cell.col, value: cell.value })
      .from(cell)
      .where(eq(cell.roomId, params.roomId as string)),
  ])
  const selectedRoom = selectedRooms[0]

  if (!selectedRoom) throw new Response('', { status: 404 })
  return json({ puzzle: selectedRoom.puzzle, filledCells: selectedCells })
}

const findField = (row: number, col: number) => (field: Coordinates) =>
  field.row === row && field.col === col

export default () => {
  const params = useParams<{ roomId: string }>()
  const { puzzle, filledCells } = useLoaderData<typeof loader>()
  const { description } = puzzle
  const updateFetcher = useFetcher()

  const prizeWordFields = Array.from(
    { length: description.prizeWord.position.length },
    (_, index) => ({
      row: description.prizeWord.row,
      col: description.prizeWord.col + index,
    })
  )
  const rows = Array.from({ length: description.rows })
  const cols = Array.from({ length: description.cols })

  const { revalidate } = useRevalidator()
  const lastCellId = useEventSource(`/rooms/${params.roomId}/subscribe`, {
    event: 'refresh-cell',
  })

  useEffect(() => {
    if (lastCellId) revalidate()
  }, [revalidate, lastCellId])

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

              const defaultValue = filledCells.find(findField(row, col))?.value

              return (
                <Cell
                  key={col}
                  className={cn({ 'bg-slate-300': shouldDisplayPrizeIndex })}
                >
                  {shouldDisplayPrizeIndex && (
                    <FieldIndex>{index + 1}</FieldIndex>
                  )}
                  <updateFetcher.Form
                    action={`/rooms/${params.roomId}`}
                    method="POST"
                    className="h-full"
                  >
                    <input type="hidden" name="row" value={row} />
                    <input type="hidden" name="col" value={col} />
                    <input
                      name="char"
                      type="text"
                      maxLength={1}
                      pattern="[a-zA-Z]"
                      defaultValue={defaultValue}
                      onKeyUp={e => {
                        if (e.currentTarget.value === defaultValue) return
                        updateFetcher.submit(e.currentTarget.form)
                      }}
                      className={cn(
                        'w-full h-full text-3xl font-light text-center uppercase bg-transparent',
                        'outline-none focus:bg-blue-200 focus:border focus:border-blue-400'
                      )}
                    />
                  </updateFetcher.Form>
                </Cell>
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}
