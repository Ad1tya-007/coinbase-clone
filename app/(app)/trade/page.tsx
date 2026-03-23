import { MOCK_COINS, MOCK_PORTFOLIO } from "@/lib/mock-data"
import { TradeForm } from "@/components/trade/trade-form"

export default function TradePage() {
  const coins = MOCK_COINS
  const portfolio = MOCK_PORTFOLIO

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Buy and sell crypto at current market prices
        </p>
      </div>

      <TradeForm coins={coins} portfolio={portfolio} />
    </div>
  )
}
