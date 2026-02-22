import { authClient } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'

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
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="h-9 px-3 text-xs font-mono uppercase tracking-wider bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/50 transition-colors"
        >
          Exit
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/auth"
      className="h-9 px-4 text-xs font-mono uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center"
    >
      Access Terminal
    </Link>
  )
}
