import React from 'react'

import type { MetaFunction } from '@remix-run/cloudflare'

import { arrowWords } from 'data/arrowwords'
import { Question } from '~/components/question'
import { Cell, FieldIndex, Row, Select } from '~/components/ui'
import { cn } from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Multiplayer Arrow Words' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

type FieldCoordinates = { row: number; col: number }
const findField = (row: number, col: number) => (field: FieldCoordinates) =>
  field.row === row && field.col === col

const puzzles = arrowWords.sort((a, b) => b.id - a.id)
export default function Index() {
  const [puzzleId, setPuzzleId] = React.useState<string>(String(puzzles[0].id))
  const puzzle = puzzles.find(puzzle => String(puzzle.id) === puzzleId)

  if (!puzzle) return null

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

  return (
    <div className="flex flex-col justify-center items-center gap-2 h-[100svh]">
      <label>
        Grille de mots fléchés
        <Select.Root onValueChange={setPuzzleId} value={puzzleId}>
          <Select.Trigger className="w-[180px]">
            <Select.Value placeholder="Sélectionner la grille de mots fléchés à résoudre" />
          </Select.Trigger>
          <Select.Content>
            {puzzles.map(puzzle => (
              <Select.Item key={puzzle.id} value={String(puzzle.id)}>
                {puzzle.info}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </label>
      <div className="flex flex-col gap-[1px] bg-black max-w-min p-[1px] shadow-md">
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
                </Cell>
              )
            })}
          </Row>
        ))}
      </div>
    </div>
  )
}
