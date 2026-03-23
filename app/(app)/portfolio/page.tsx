import { MOCK_PORTFOLIO, MOCK_PORTFOLIO_HISTORY } from "@/lib/mock-data"
import { PortfolioStats } from "@/components/dashboard/portfolio-stats"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { AllocationChart } from "@/components/portfolio/allocation-chart"
import { HoldingsDetail } from "@/components/portfolio/holdings-detail"

const ALLOCATION_COLORS = [
  "#f97316", // BTC - orange
  "#3b82f6", // ETH - blue
  "#a855f7", // SOL - purple
  "#22c55e", // Cash - green
]

export default function PortfolioPage() {
  const portfolio = MOCK_PORTFOLIO
  const portfolioHistory = MOCK_PORTFOLIO_HISTORY

  const allocationItems = [
    ...portfolio.holdings.map((h, i) => ({
      name: h.coinName,
      symbol: h.coinSymbol,
      value: h.value,
      color: ALLOCATION_COLORS[i] ?? "#6366f1",
    })),
    {
      name: "Cash",
      symbol: "USD",
      value: portfolio.cashBalance,
      color: "#22c55e",
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your complete investment overview
        </p>
      </div>

      <PortfolioStats portfolio={portfolio} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AllocationChart
          items={allocationItems}
          totalValue={portfolio.totalValue}
        />
        <HoldingsDetail
          holdings={portfolio.holdings}
          cashBalance={portfolio.cashBalance}
          totalValue={portfolio.totalValue}
        />
      </div>

      <PortfolioChart
        data={portfolioHistory}
        totalValue={portfolio.totalValue}
        pnl={portfolio.pnl}
        pnlPercent={portfolio.pnlPercent}
      />
    </div>
  )
}
