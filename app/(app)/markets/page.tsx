import { MOCK_COINS } from "@/lib/mock-data"
import { MarketTable } from "@/components/markets/market-table"

export default function MarketsPage() {
  const coins = MOCK_COINS

  const totalMarketCap = coins.reduce((sum, c) => sum + c.marketCap, 0)
  const gainers = coins.filter((c) => c.change24h > 0).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live cryptocurrency market data
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total Market Cap</p>
            <p className="font-semibold">
              ${(totalMarketCap / 1e12).toFixed(2)}T
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Gainers / Losers</p>
            <p className="font-semibold">
              <span className="text-green-600 dark:text-green-400">{gainers}</span>
              {" / "}
              <span className="text-red-600 dark:text-red-400">{coins.length - gainers}</span>
            </p>
          </div>
        </div>
      </div>

      <MarketTable coins={coins} />
    </div>
  )
}
