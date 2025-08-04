import * as React from 'react'

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      ref={ref}
      className={className}
      {...props}
    />
  )
)
Switch.displayName = 'Switch'