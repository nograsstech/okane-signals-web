import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '@/integrations/better-auth/header-user'
import { useState } from 'react'
import { Home, Menu, X, TrendingUp, Activity, Settings } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Top Bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-foreground/10 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight">OKANE SIGNALS</span>
                <span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
                  Financial Terminal
                </span>
              </div>
            </Link>
          </div>

          {/* Terminal Status */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-foreground/50">MARKET: OPEN</span>
            </div>
            <div className="text-xs font-mono text-foreground/30">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border/50 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
            <span className="text-sm font-semibold">OKANE TERMINAL</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-foreground/10 rounded transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          <NavLink to="/" icon={Home} onClick={() => setIsOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/signals" icon={Activity} onClick={() => setIsOpen(false)}>
            Signals
          </NavLink>
          <NavLink to="/settings" icon={Settings} onClick={() => setIsOpen(false)}>
            Settings
          </NavLink>
        </nav>

        {/* Auth Section */}
        <div className="p-4 border-t border-border/50">
          <BetterAuthHeader />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/30">
          <p className="text-[10px] font-mono text-foreground/30 text-center">
            v1.0.0 — TERMINAL READY
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/5 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

function NavLink({
  to,
  icon: Icon,
  onClick,
  children,
}: {
  to: string
  icon: React.ComponentType<{ size?: number }>
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all"
      activeProps={{
        className: 'flex items-center gap-3 px-3 py-2 rounded text-sm font-medium bg-foreground/10 text-foreground',
      }}
    >
      <Icon size={18} />
      <span className="font-mono text-xs uppercase tracking-wider">{children}</span>
    </Link>
  )
}
