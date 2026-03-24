import { MarketTable } from "@/components/markets/market-table"

export default function MarketsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Live cryptocurrency market data · Top 100 by market cap
        </p>
      </div>
      <MarketTable />
    </div>
  )
}
