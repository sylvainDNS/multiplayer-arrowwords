import * as React from 'react'

import { cn } from '~/lib/utils'

const FieldIndex = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...delegated }, ref) => (
  <p
    ref={ref}
    className={cn(
      'absolute text-sm font-semibold bottom-1 right-1 select-none',
      className
    )}
    {...delegated}
  />
))
FieldIndex.displayName = 'FieldIndex'

export { FieldIndex }
