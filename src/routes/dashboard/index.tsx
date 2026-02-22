import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth'
import { authClient } from '@/lib/auth-client'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { data: session } = authClient.useSession()

  const stats = [
    { label: 'Portfolio Value', value: '$124,532.00', change: '+2.4%', up: true, icon: DollarSign },
    { label: 'Today\'s P&L', value: '+$1,234.56', change: '+1.2%', up: true, icon: TrendingUp },
    { label: 'Active Signals', value: '12', change: '+3', up: true, icon: Activity },
    { label: 'Win Rate', value: '68.5%', change: '-2.1%', up: false, icon: TrendingDown },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Welcome back, {session?.user?.name || 'Trader'}
        </h1>
        <p className="text-sm text-foreground/50 font-mono">
          TERMINAL ACCESS GRANTED — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative p-4 bg-background/50 border border-border/50"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-foreground/20" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-foreground/20" />

            <div className="flex items-start justify-between mb-3">
              <stat.icon size={18} className="text-foreground/50" />
              <span className={`text-xs font-mono ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight mb-1">{stat.value}</p>
            <p className="text-xs text-foreground/50 font-mono uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="relative p-6 bg-background/30 border border-border/30">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

        <h2 className="text-lg font-semibold mb-4">Recent Signals</h2>

        <div className="space-y-3">
          {[
            { symbol: 'AAPL', action: 'BUY', price: '$178.45', time: '10:32 AM', status: 'ACTIVE' },
            { symbol: 'TSLA', action: 'SELL', price: '$245.30', time: '09:15 AM', status: 'FILLED' },
            { symbol: 'NVDA', action: 'BUY', price: '$875.20', time: 'Yesterday', status: 'PENDING' },
          ].map((signal) => (
            <div
              key={signal.symbol + signal.time}
              className="flex items-center justify-between p-3 bg-background/50 border border-border/30"
            >
              <div className="flex items-center gap-4">
                <div className={`px-2 py-1 text-xs font-mono font-semibold ${
                  signal.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {signal.action}
                </div>
                <div>
                  <p className="font-mono font-semibold">{signal.symbol}</p>
                  <p className="text-xs text-foreground/50">{signal.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono">{signal.price}</p>
                <p className="text-xs text-foreground/50 font-mono">{signal.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
