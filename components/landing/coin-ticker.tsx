"use client"

import type { Coin } from "@/lib/types"

interface CoinTickerProps {
  coins: Coin[]
}

function formatPrice(price: number) {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}

export function CoinTicker({ coins }: CoinTickerProps) {
  const doubled = [...coins, ...coins]

  return (
    <div className="relative overflow-hidden border-y bg-muted/30 py-3">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div
        className="flex gap-8 w-max"
        style={{
          animation: "ticker 40s linear infinite",
        }}
      >
        {doubled.map((coin, i) => {
          const isPositive = coin.change24h >= 0
          return (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <span className="text-[9px] font-bold text-primary">{coin.symbol.slice(0, 2)}</span>
              </div>
              <span className="text-sm font-semibold">{coin.symbol}</span>
              <span className="text-sm tabular-nums">{formatPrice(coin.price)}</span>
              <span
                className={`text-xs font-medium tabular-nums ${
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
