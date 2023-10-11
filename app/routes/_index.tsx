import { redirect, type MetaFunction } from '@remix-run/cloudflare'

import { arrowWords as puzzles } from 'data/arrowwords'

export const meta: MetaFunction = () => {
  return [
    { title: 'Mots fléchés multijoueurs' },
    {
      name: 'description',
      content: 'Jouez aux mots fléchés avec vos ami·e·s!',
    },
  ]
}

export const loader = async () => {
  const puzzle = puzzles[0]

  return redirect(`/puzzles/${puzzle.id}`)
}
