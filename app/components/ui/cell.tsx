import * as React from 'react'

import { cn } from '~/lib/utils'

type CellProps = React.HTMLAttributes<HTMLDivElement>

const Cell = React.forwardRef<HTMLDivElement, CellProps>(
  ({ className, ...delegated }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative w-16 h-16 bg-slate-100 flex justify-center items-center',
        className
      )}
      {...delegated}
    />
  )
)
Cell.displayName = 'Cell'

export { Cell }
export type { CellProps }
