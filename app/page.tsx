import Link from "next/link"
import {
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowRight,
  History,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSession } from "@/lib/auth"
import { MOCK_COINS } from "@/lib/mock-data"
import { LandingNav } from "@/components/landing/landing-nav"
import { CoinTicker } from "@/components/landing/coin-ticker"

const features = [
  {
    icon: TrendingUp,
    title: "Live Market Data",
    description:
      "Real-time prices, 24h changes, market caps, and volume for 100+ cryptocurrencies powered by CoinGecko.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description:
      "Monitor your holdings, total value, P&L per asset, and allocation breakdown — all in one place.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Trading",
    description:
      "Execute simulated market buy and sell orders at live prices. Positions update immediately.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: History,
    title: "Transaction History",
    description:
      "A full audit log of every trade — timestamp, asset, quantity, price, and total value.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: PieChart,
    title: "Asset Allocation",
    description:
      "Interactive donut chart showing how your portfolio is split across assets and cash.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Zero Risk Practice",
    description:
      "Every account starts with $10,000 in demo funds. Make mistakes, learn freely, lose nothing.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

const steps = [
  {
    step: "01",
    title: "Create your free account",
    description:
      "Sign up in seconds with just your email and password. No credit card or KYC required.",
  },
  {
    step: "02",
    title: "Get $10,000 in demo funds",
    description:
      "Your account is pre-loaded with $10,000 in virtual cash, ready to deploy immediately.",
  },
  {
    step: "03",
    title: "Trade and track your performance",
    description:
      "Buy and sell crypto at live market prices. Watch your portfolio grow (or shrink) in real time.",
  },
]

function formatCurrency(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  return `$${value.toFixed(2)}`
}

// Minimal inline sparkline using SVG
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 72
  const h = 28
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
    )
    .join(" ")
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#16a34a" : "#dc2626"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default async function LandingPage() {
  const session = await getSession()
  const isLoggedIn = !!session
  const topCoins = MOCK_COINS.slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav isLoggedIn={isLoggedIn} firstName={session?.firstName} />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-primary-foreground pt-32 pb-24">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <Badge className="bg-white/15 text-primary-foreground border-0 hover:bg-white/20 text-sm px-3 py-1">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
                100% Free · No real money
              </Badge>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
                  Learn crypto
                  <br />
                  trading.
                  <br />
                  <span className="text-white/70">Zero risk.</span>
                </h1>
                <p className="text-lg text-primary-foreground/75 leading-relaxed max-w-md">
                  Practice buying and selling Bitcoin, Ethereum, and 100+ coins
                  with $10,000 in virtual funds. Real prices, real experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  asChild
                >
                  <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                    {isLoggedIn ? "Go to Dashboard" : "Start for free"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!isLoggedIn && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                    asChild
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
                {["No credit card", "Instant setup", "Real market data"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-300" />
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right: dashboard preview card */}
            <div className="hidden lg:flex justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 space-y-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-primary-foreground/60">Portfolio value</p>
                    <p className="text-2xl font-bold">$20,571.44</p>
                  </div>
                  <Badge className="bg-green-400/20 text-green-300 border-0">
                    +14.29%
                  </Badge>
                </div>

                {/* Mini chart */}
                <div className="rounded-xl bg-white/10 p-3">
                  <svg width="100%" height="64" viewBox="0 0 280 64" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,52 C30,48 50,44 70,36 C90,28 110,24 130,20 C150,16 170,18 190,12 C210,6 230,8 250,4 C260,2 270,2 280,0 L280,64 L0,64 Z"
                      fill="url(#heroGrad)"
                    />
                    <path
                      d="M0,52 C30,48 50,44 70,36 C90,28 110,24 130,20 C150,16 170,18 190,12 C210,6 230,8 250,4 C260,2 270,2 280,0"
                      fill="none"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Holdings */}
                {[
                  { symbol: "BTC", name: "Bitcoin", value: "$8,068", change: "+15.9%" },
                  { symbol: "ETH", name: "Ethereum", value: "$5,282", change: "+13.6%" },
                  { symbol: "SOL", name: "Solana", value: "$1,789", change: "+17.4%" },
                ].map((h) => (
                  <div key={h.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center">
                        <span className="text-[9px] font-bold">{h.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium leading-none">{h.name}</p>
                        <p className="text-[10px] text-primary-foreground/50 mt-0.5">{h.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{h.value}</p>
                      <p className="text-[10px] text-green-300">{h.change}</p>
                    </div>
                  </div>
                ))}

                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xs">
                  <span className="text-primary-foreground/50">Cash available</span>
                  <span className="font-medium">$5,432.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────── */}
      <section className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: "50,000+", label: "Demo traders" },
              { value: "2M+", label: "Trades executed" },
              { value: "100+", label: "Coins tracked" },
              { value: "$10,000", label: "Starting balance" },
            ].map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ────────────────────────────────────────────── */}
      <CoinTicker coins={MOCK_COINS} />

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <Badge variant="secondary">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to learn trading
            </h2>
            <p className="text-muted-foreground">
              A full-featured trading platform built for practice — without the financial risk.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group hover:shadow-md transition-shadow border-border/60"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-muted/30 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <Badge variant="secondary">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and trading in minutes
            </h2>
            <p className="text-muted-foreground">
              No lengthy onboarding. No ID verification. Just sign up and start.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative space-y-4">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+1.5rem)] right-0 h-px bg-border" />
                )}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
                    {s.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {s.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MARKETS PREVIEW ───────────────────────────────────── */}
      <section id="markets" className="py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">Live Markets</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Track the market in real time
              </h2>
              <p className="text-muted-foreground">
                Live prices updated continuously from the global crypto market.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href={isLoggedIn ? "/markets" : "/register"}>
                View all markets
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] sm:grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>#</span>
              <span>Asset</span>
              <span className="text-right">Price</span>
              <span className="text-right hidden sm:block">24h</span>
              <span className="text-right hidden sm:block">Market Cap</span>
              <span className="text-right hidden sm:block">7D</span>
            </div>

            {topCoins.map((coin, i) => {
              const isPositive = coin.change24h >= 0
              return (
                <div
                  key={coin.id}
                  className={`grid grid-cols-[2rem_1fr_auto_auto_auto] sm:grid-cols-[2rem_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center transition-colors hover:bg-muted/30 ${
                    i < topCoins.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{coin.rank}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">
                        {coin.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{coin.name}</p>
                      <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-medium text-right">
                    {coin.price >= 1000
                      ? `$${coin.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : coin.price >= 1
                      ? `$${coin.price.toFixed(2)}`
                      : `$${coin.price.toFixed(4)}`}
                  </span>
                  <div className="text-right hidden sm:flex items-center justify-end gap-1">
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-sm text-right hidden sm:block">
                    {formatCurrency(coin.marketCap)}
                  </span>
                  <div className="hidden sm:flex justify-end">
                    <Sparkline data={coin.sparkline} positive={isPositive} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href={isLoggedIn ? "/markets" : "/register"}>
                View all markets
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-[hsl(var(--primary))] text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-4">
            <Badge className="bg-white/15 border-0 text-primary-foreground">
              Free forever
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Ready to start trading?
            </h2>
            <p className="text-lg text-primary-foreground/70 max-w-lg mx-auto">
              Join thousands of traders who practice on Coinbase Demo every day.
              No commitment, no risk.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
              asChild
            >
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                {isLoggedIn ? "Go to Dashboard" : "Create free account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!isLoggedIn && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-8"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="font-bold text-xs">C</span>
              </div>
              <span className="font-semibold tracking-tight">Coinbase Demo</span>
            </Link>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>

            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Simulation only · No real funds · © {new Date().getFullYear()} Coinbase Demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
