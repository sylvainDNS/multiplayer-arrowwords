import React from 'react'

import type { QuestionField } from 'data/types'
import { cn } from '~/lib/utils'

import { Cell } from './ui'

type QuestionProps = {
  questionField: QuestionField
}
export const Question = ({ questionField }: QuestionProps) => {
  const question = questionField.question.replaceAll('+', '\n')
  const { arrowType } = questionField

  return (
    <Cell
      className={cn(
        'text-xs leading-[100%]',
        'after:z-10 after:absolute after:bg-no-repeat after:bg-contain after:h-full after:m-auto',
        {
          'after:bg-arrow-right-down after:w-[45%] after:left-full after:top-px':
            arrowType === 'RIGHT_DOWN',
          'after:bg-arrow-right after:w-[14%] after:top-0 after:bottom-0 after:left-full after:bg-center':
            arrowType === 'RIGHT',
          'after:bg-arrow-up-right after:w-[24%] after:left-px after:bottom-full after:bg-bottom':
            arrowType === 'UP_RIGHT',
          'after:bg-arrow-down after:w-[10%] after:right-0 after:left-0  after:top-full':
            arrowType === 'DOWN',
          'after:bg-arrow-left-down after:w-[45%] after:right-full after:top-px':
            arrowType === 'LEFT_DOWN',
        }
      )}
    >
      <span className="max-w-min whitespace-pre">{question}</span>
    </Cell>
  )
}
