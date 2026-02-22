import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
          <Label
            htmlFor={inputId}
            className="text-xs uppercase tracking-widest text-foreground/60 font-mono"
          >
            {label}
          </Label>
        )}
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            'font-mono px-4 py-3 h-auto bg-background/50',
            'placeholder:text-foreground/30',
            error && 'border-destructive/50 aria-invalid:border-destructive',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-mono">{error}</span>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'

export { AuthInput }
