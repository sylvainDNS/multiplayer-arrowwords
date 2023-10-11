export type ArrowWord = {
  id: string
  version: number
  difficulty: string
  type: string
  info: string
  description: Description
  solution: Solution
  metadata: Metadata
}

export type Coordinates = { row: number; col: number }

export type Description = {
  rows: number
  cols: number
  questionFields: QuestionField[]
  prizeFields: PrizeField[]
  prizeWord: PrizeWord
}

export type PrizeField = Coordinates

export type PrizeWord = {
  position: string
} & Coordinates

export type QuestionField = {
  arrowType: ArrowType
  question: string
  wordLength: number
} & Coordinates

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
  direction: Direction
  answer: string
} & Coordinates

export type Direction = 'VERTICAL' | 'HORIZONTAL'
