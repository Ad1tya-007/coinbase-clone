import { getSession } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Portfolio } from "@/models/Portfolio"
import { Holding } from "@/models/Holding"
import { Transaction } from "@/models/Transaction"
import { fetchMarkets } from "@/lib/coingecko"
import { MOCK_PORTFOLIO_HISTORY } from "@/lib/mock-data"
import { PortfolioStats } from "@/components/dashboard/portfolio-stats"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { HoldingsTable } from "@/components/dashboard/holdings-table"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import type { Portfolio as PortfolioType, Holding as HoldingType, Transaction as TransactionType } from "@/lib/types"

export default async function DashboardPage() {
  const session = await getSession()
  await connectDB()

  // ── Portfolio & holdings ──────────────────────────────────────────────────
  let dbPortfolio = await Portfolio.findOne({ userId: session!.userId }).lean()
  if (!dbPortfolio) {
    const created = await Portfolio.create({ userId: session!.userId, cashBalance: 10000 })
    dbPortfolio = created.toObject()
  }
  const cashBalance: number = dbPortfolio.cashBalance

  const dbHoldings = await Holding.find({
    userId: session!.userId,
    amount: { $gt: 0 },
  }).lean()

  // ── Current prices from CoinGecko (2-min server cache) ───────────────────
  const priceMap: Record<string, number> = {}
  if (dbHoldings.length > 0) {
    try {
      const markets = await fetchMarkets(100, 120) // 2-min cache
      for (const m of markets) priceMap[m.id] = m.current_price
    } catch {
      // Prices unavailable — values will show as 0
    }
  }

  // ── Build typed holdings ──────────────────────────────────────────────────
  const holdings: HoldingType[] = dbHoldings.map((h) => {
    const currentPrice = priceMap[h.coinId] ?? 0
    const value = h.amount * currentPrice
    const cost = h.amount * h.avgBuyPrice
    const pnl = value - cost
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
    return {
      coinId: h.coinId,
      coinName: h.coinName,
      coinSymbol: h.coinSymbol,
      amount: h.amount,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice,
      value,
      pnl,
      pnlPercent,
    }
  })

  const totalHoldingsValue = holdings.reduce((s, h) => s + h.value, 0)
  const totalValue = cashBalance + totalHoldingsValue
  const totalInvested = holdings.reduce((s, h) => s + h.amount * h.avgBuyPrice, 0)
  const pnl = totalHoldingsValue - totalInvested
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0

  const portfolio: PortfolioType = {
    cashBalance,
    totalValue,
    totalInvested,
    pnl,
    pnlPercent,
    holdings,
  }

  // ── Recent transactions ───────────────────────────────────────────────────
  const dbTxs = await Transaction.find({ userId: session!.userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const transactions: TransactionType[] = dbTxs.map((tx) => ({
    id: tx._id.toString(),
    coinId: tx.coinId,
    coinName: tx.coinName,
    coinSymbol: tx.coinSymbol,
    type: tx.type,
    amount: tx.amount,
    price: tx.price,
    total: tx.total,
    createdAt: tx.createdAt.toISOString(),
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session!.firstName}. Here&apos;s your portfolio overview.
        </p>
      </div>

      <PortfolioStats portfolio={portfolio} />

      <div className="grid gap-6 lg:grid-cols-3">
        <PortfolioChart
          data={MOCK_PORTFOLIO_HISTORY}
          totalValue={portfolio.totalValue}
          pnl={portfolio.pnl}
          pnlPercent={portfolio.pnlPercent}
        />
        <HoldingsTable holdings={holdings} totalValue={totalValue} />
      </div>

      <RecentTransactions transactions={transactions} />
    </div>
  )
}
