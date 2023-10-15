import { json, redirect } from '@remix-run/node'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { useActionData, useFetcher, useLoaderData } from '@remix-run/react'

import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'

import { Button, Select } from '~/components/ui'
import puzzles from '~/data/puzzles.server'
import { db } from '~/db/config.server'
import { room } from '~/db/schema.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Mots fléchés multijoueurs' },
    {
      name: 'description',
      content: 'Jouez aux mots fléchés avec vos ami·e·s!',
    },
  ]
}

const CreateRoomFormSchema = z.object({
  puzzleId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const submission = await parse(formData, {
    schema: CreateRoomFormSchema.transform(async (data, ctx) => {
      const puzzle = puzzles.find(puzzle => puzzle.id === data.puzzleId)

      if (!puzzle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La grille sélectionnée n'existe pas.",
        })
        return z.NEVER
      }

      return { ...data, puzzle }
    }),
    async: true,
  })

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }

  const { puzzle } = submission.value

  const insertedRooms = await db
    .insert(room)
    .values({ puzzle })
    .returning({ id: room.id })
  const insertedRoom = insertedRooms[0]!

  return redirect(`/rooms/${insertedRoom.id}`)
}

export const loader = async () => {
  return json(puzzles)
}

export default function Index() {
  const puzzles = useLoaderData<typeof loader>()

  const createRoomFetcher = useFetcher()
  const isCreatingRoom = createRoomFetcher.state === 'submitting'

  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'create-room-form',
    constraint: getFieldsetConstraint(CreateRoomFormSchema),
    defaultValue: { puzzleId: puzzles[0].id },
    lastSubmission: actionData?.submission,
    onValidate: ({ formData }) => {
      return parse(formData, { schema: CreateRoomFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <section>
      <createRoomFetcher.Form method="post" {...form.props}>
        <div className="flex gap-3 items-end">
          <label>
            Grille de mots fléchés
            <Select.Root {...conform.input(fields.puzzleId)}>
              <Select.Trigger>
                <Select.Value placeholder="Sélectionner la grille de mots fléchés à résoudre" />
              </Select.Trigger>
              <Select.Content>
                {puzzles.map(puzzle => (
                  <Select.Item key={puzzle.id} value={puzzle.id}>
                    {puzzle.info}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>
          <ul id={fields.puzzleId.errorId}>
            {fields.puzzleId.errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>

          <ul id={form.errorId}>
            {' '}
            <li>{form.error}</li>
          </ul>

          <Button name="intent" type="submit" disabled={isCreatingRoom}>
            {isCreatingRoom
              ? "Création d'une partie en cours"
              : 'Créer une partie'}
          </Button>
        </div>
      </createRoomFetcher.Form>
    </section>
  )
}
