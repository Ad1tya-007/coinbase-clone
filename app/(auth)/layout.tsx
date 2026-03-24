import Link from "next/link"
import { TrendingUp, ShieldCheck, BarChart3, Zap } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Live Market Data",
    description: "Real-time prices for 100+ cryptocurrencies",
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Monitor performance and asset allocation",
  },
  {
    icon: Zap,
    title: "Instant Trades",
    description: "Simulate market buys and sells instantly",
  },
  {
    icon: ShieldCheck,
    title: "Risk Free",
    description: "Practice with a $10,000 demo balance",
  },
]

const stats = [
  { label: "Demo Users", value: "50K+" },
  { label: "Trades Executed", value: "2M+" },
  { label: "Coins Tracked", value: "100+" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-[hsl(var(--primary))] text-primary-foreground flex-col overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Coinbase</span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6 max-w-sm">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  Demo Trading Platform
                </div>
                <h1 className="text-4xl font-bold leading-tight tracking-tight">
                  Trade crypto.
                  <br />
                  Zero risk.
                </h1>
                <p className="text-base text-primary-foreground/75 leading-relaxed">
                  Practice cryptocurrency trading with a fully featured simulator. Build your strategy before going live.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                {stats.map((s) => (
                  <div key={s.label} className="space-y-1">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-primary-foreground/60">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                      <f.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{f.title}</p>
                      <p className="text-xs text-primary-foreground/60 mt-0.5">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <p className="relative text-xs text-primary-foreground/40">
            This is a simulation platform. No real funds or transactions involved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-background">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Coinbase</span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
