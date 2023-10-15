import { useEffect, useId } from 'react'

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
} from '@remix-run/react'

import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { Question } from '~/components/question'
import { Cell, FieldIndex, Row } from '~/components/ui'
import { db } from '~/db/config.server'
import { cell, room } from '~/db/schema.server'
import { emitter } from '~/lib/emitter.server'
import { useEventSource } from '~/lib/sse'
import { cn } from '~/lib/utils'
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

const UpdateCellFormSchema = z.object({
  row: z.coerce.number().min(0).readonly(),
  col: z.coerce.number().min(0).readonly(),
  char: z
    .string()
    .min(0)
    .max(1)
    .regex(/^[A-Z]{0,1}\b/)
    .optional()
    .transform(value => value?.toUpperCase() || ''),
})

export async function action({ params, request }: ActionFunctionArgs) {
  const roomId = params.roomId
  if (!roomId) return json(null, { status: 400 })

  const formData = await request.formData()
  const submission = await parse(formData, {
    schema: UpdateCellFormSchema,
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { char, col, row } = submission.value

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

    return json({ submission }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return json({ status: 'error', submission }, { status: 400 })
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

              const hasPrizeIndex = isPrizeField || isPrizeWordField
              const prizeIndex = isPrizeWordField
                ? prizeWordFieldIndex
                : prizeFieldIndex

              const defaultValue = filledCells.find(findField(row, col))?.value

              return (
                <Answer
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  defaultValue={defaultValue}
                  prizeIndex={prizeIndex}
                  isPrizeCell={hasPrizeIndex}
                />
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}

interface AnswerProps {
  row: number
  col: number
  defaultValue?: string
  prizeIndex?: number
  isPrizeCell?: boolean
}
const Answer = ({
  row,
  col,
  defaultValue,
  prizeIndex = 0,
  isPrizeCell,
}: AnswerProps) => {
  const id = useId()

  const actionData = useActionData<typeof action>()
  const updateFetcher = useFetcher()

  const [form, fields] = useForm({
    id: `update-cell-form-${id}`,
    defaultValue: { row, col, char: defaultValue },
    constraint: getFieldsetConstraint(UpdateCellFormSchema),
    lastSubmission: actionData?.submission,
    onValidate: ({ formData }) => {
      return parse(formData, { schema: UpdateCellFormSchema })
    },
    shouldRevalidate: 'onInput',
  })

  return (
    <Cell key={col} className={cn({ 'bg-slate-300': isPrizeCell })}>
      {isPrizeCell && <FieldIndex>{prizeIndex + 1}</FieldIndex>}
      <updateFetcher.Form method="POST" className="h-full" {...form.props}>
        <input type="hidden" {...conform.input(fields.row)} />
        <input type="hidden" {...conform.input(fields.col)} />
        <input
          onInput={e => {
            const nextValue = e.currentTarget.value.replace(/[^a-zA-Z+]/g, '')
            e.currentTarget.value = nextValue

            if (nextValue === defaultValue) return

            updateFetcher.submit(e.currentTarget.form)
          }}
          className={cn(
            'w-full h-full text-3xl font-light text-center uppercase bg-transparent',
            'outline-none focus:bg-blue-200 focus:border focus:border-blue-400'
          )}
          {...conform.input(fields.char)}
        />
      </updateFetcher.Form>
    </Cell>
  )
}
