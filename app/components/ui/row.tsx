import * as React from 'react'

import { cn } from '~/lib/utils'

const Row = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...delegated }, ref) => (
  <div ref={ref} className={cn('flex gap-px', className)} {...delegated} />
))
Row.displayName = 'Row'

export { Row }
