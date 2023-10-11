import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData, useNavigate, useNavigation } from '@remix-run/react'

import { arrowWords as puzzles } from 'data/arrowwords'
import type { Coordinates } from 'data/types'
import { Question } from '~/components/question'
import { Cell, FieldIndex, Row, Select } from '~/components/ui'
import { cn } from '~/lib/utils'

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
  const puzzle = puzzles.find(puzzle => puzzle.id === params.puzzleId)

  if (!puzzle) throw new Response('', { status: 404 })
  return json(puzzle)
}

const findField = (row: number, col: number) => (field: Coordinates) =>
  field.row === row && field.col === col

export default () => {
  const { id, description } = useLoaderData<typeof loader>()

  const navigate = useNavigate()
  const navigation = useNavigation()
  const isPageLoading = navigation.state === 'loading'

  const prizeWordFields = Array.from(
    { length: description.prizeWord.position.length },
    (_, index) => ({
      row: description.prizeWord.row,
      col: description.prizeWord.col + index,
    })
  )
  const rows = Array.from({ length: description.rows })
  const cols = Array.from({ length: description.cols })

  const handleChange = (nextId: string) => {
    navigate(`/puzzles/${nextId}`)
  }

  return (
    <form method="post">
      <div className="flex flex-col justify-center items-center gap-2 h-[100svh]">
        <div className="flex items-end gap-4">
          <label>
            Grille de mots fléchés
            <Select.Root onValueChange={handleChange} value={id}>
              <Select.Trigger className="w-[180px]" disabled={isPageLoading}>
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
        </div>

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
    </form>
  )
}
