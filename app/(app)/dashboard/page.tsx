import { MOCK_PORTFOLIO, MOCK_TRANSACTIONS, MOCK_PORTFOLIO_HISTORY } from "@/lib/mock-data"
import { PortfolioStats } from "@/components/dashboard/portfolio-stats"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { HoldingsTable } from "@/components/dashboard/holdings-table"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default function DashboardPage() {
  const portfolio = MOCK_PORTFOLIO
  const transactions = MOCK_TRANSACTIONS
  const portfolioHistory = MOCK_PORTFOLIO_HISTORY

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, John. Here&apos;s your portfolio overview.
        </p>
      </div>

      <PortfolioStats portfolio={portfolio} />

      <div className="grid gap-6 lg:grid-cols-3">
        <PortfolioChart
          data={portfolioHistory}
          totalValue={portfolio.totalValue}
          pnl={portfolio.pnl}
          pnlPercent={portfolio.pnlPercent}
        />
        <HoldingsTable
          holdings={portfolio.holdings}
          totalValue={portfolio.totalValue}
        />
      </div>

      <RecentTransactions transactions={transactions} />
    </div>
  )
}
