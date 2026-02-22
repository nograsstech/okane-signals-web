import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  loading?: boolean
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center',
          'font-mono text-sm uppercase tracking-wider',
          'px-6 py-3 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-foreground text-background hover:bg-foreground/90':
              variant === 'primary',
            'bg-transparent border border-border text-foreground hover:bg-border/20':
              variant === 'secondary',
            'bg-transparent text-foreground/60 hover:text-foreground hover:bg-border/10':
              variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',
          },
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="absolute left-3 h-4 w-4 animate-spin" />}
        <span className={loading ? 'ml-5' : ''}>{children}</span>
      </button>
    )
  }
)

AuthButton.displayName = 'Button'

export { AuthButton }
