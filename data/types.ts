export type ArrowWord = {
  id: number
  version: number
  difficulty: string
  type: string
  info: string
  description: Description
  solution: Solution
  metadata: Metadata
}

export type Description = {
  rows: number
  cols: number
  questionFields: QuestionField[]
  prizeFields: PrizeField[]
  prizeWord: PrizeWord
}

export type PrizeField = {
  row: number
  col: number
}

export type PrizeWord = {
  position: string
  row: number
  col: number
}

export type QuestionField = {
  row: number
  col: number
  arrowType: ArrowType
  question: string
  wordLength: number
}

export type ArrowType =
  | 'RIGHT_DOWN'
  | 'RIGHT'
  | 'UP_RIGHT'
  | 'DOWN'
  | 'LEFT_DOWN'

export type Metadata = {
  puzzleLanguage: string
}

export type Solution = {
  rows: number
  cols: number
  answers: Answer[]
  prizeWord: string
}

export type Answer = {
  row: number
  col: number
  direction: Direction
  answer: string
}

export type Direction = 'VERTICAL' | 'HORIZONTAL'
