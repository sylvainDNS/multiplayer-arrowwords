import type { LoaderFunctionArgs } from '@remix-run/node'

import { eventStream } from 'remix-utils/sse/server'

import type { Cell } from '~/db/schema.server'
import { emitter } from '~/services/emitter.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return eventStream(request.signal, function setup(send) {
    function handle(cellId: Cell['id']) {
      send({ event: 'refresh-cell', data: cellId })
    }

    emitter.on('upserted-cell', handle)

    return function clear() {
      emitter.off('upserted-cell', handle)
    }
  })
}
