import { TradeForm } from "@/components/trade/trade-form"

export default function TradePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Buy and sell crypto at current market prices
        </p>
      </div>

      <TradeForm />
    </div>
  )
}
