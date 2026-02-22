import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs uppercase tracking-widest text-foreground/60 font-mono"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-background/50 border border-border/50',
            'font-mono text-sm px-4 py-3',
            'focus:outline-none focus:border-accent-foreground focus:bg-background/80',
            'transition-all duration-200',
            'placeholder:text-foreground/30',
            error && 'border-destructive/50',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-mono">{error}</span>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'Input'

export { AuthInput }
