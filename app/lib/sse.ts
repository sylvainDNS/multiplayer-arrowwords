import { useEventSource as useES } from 'remix-utils/sse/react'

export type Event = 'upserted-cell' | 'refresh-cell'

type UseEventSourceParams = Parameters<typeof useES>

type Options = UseEventSourceParams[1] & {
  event: Event
}

export const useEventSource = (
  url: UseEventSourceParams[0],
  options?: Options
) => {
  return useES(url, options)
}
