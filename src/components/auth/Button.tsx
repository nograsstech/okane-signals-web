import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  loading?: boolean
}

const variantMap: Record<'primary' | 'secondary' | 'ghost' | 'destructive', 'default' | 'outline' | 'ghost' | 'destructive'> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
}

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', loading, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        variant={variantMap[variant]}
        className={cn(
          'font-mono text-sm uppercase tracking-wider',
          loading && 'gap-5',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{children}</span>
      </Button>
    )
  }
)

AuthButton.displayName = 'AuthButton'

export { AuthButton }
