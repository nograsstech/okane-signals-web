import { authClient } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-foreground/10 animate-pulse rounded" />
        <div className="h-8 w-20 bg-foreground/10 animate-pulse rounded" />
      </div>
    )
  }

  if (session?.user) {
    const initials = session.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

    return (
      <div className="flex items-center gap-3">
        {/* User Avatar with Initials */}
        <div className="h-9 w-9 bg-foreground/10 border border-border/50 flex items-center justify-center">
          <span className="text-xs font-mono font-medium text-foreground/80">
            {initials}
          </span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {session.user.name || 'User'}
          </p>
          <p className="text-xs font-mono text-foreground/50 truncate">
            {session.user.email}
          </p>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={() => {
            void authClient.signOut()
          }}
          size="sm"
          variant="outline"
          className="h-9 text-xs font-mono uppercase tracking-wider"
        >
          Exit
        </Button>
      </div>
    )
  }

  return (
    <Button
      asChild
      size="sm"
      className="h-9 text-xs font-mono uppercase tracking-wider"
    >
      <Link to="/auth">
        Access Terminal
      </Link>
    </Button>
  )
}
