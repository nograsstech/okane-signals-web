import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth'

export const Route = createFileRoute('/auth/login/')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Ambient Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_4px]" />

      <AuthForm mode="signin" />
    </div>
  )
}
