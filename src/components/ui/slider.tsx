import * as React from 'react'

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)
Slider.displayName = 'Slider'