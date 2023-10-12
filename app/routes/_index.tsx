import { json, redirect } from '@remix-run/node'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'

import { Button, Select } from '~/components/ui'
import puzzles from '~/data/puzzles'
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const puzzle = puzzles.find(puzzle => puzzle.id === formData.get('puzzleId'))

  if (!puzzle) {
    return json({ status: 'error' } as const, { status: 400 })
  }

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

  const createRoom = useFetcher()
  return (
    <section>
      <createRoom.Form method="post">
        <div className="flex gap-3 items-end">
          <label>
            Grille de mots fléchés
            <Select.Root name="puzzleId" defaultValue={puzzles[0].id}>
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

          <Button type="submit">Créer une partie</Button>
        </div>
      </createRoom.Form>
    </section>
  )
}
