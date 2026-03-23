"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownRight, ShoppingCart, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Holding } from "@/lib/types"

interface HoldingsDetailProps {
  holdings: Holding[]
  cashBalance: number
  totalValue: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

const COIN_GRADIENTS: Record<string, { from: string; to: string; text: string }> = {
  BTC: { from: "#f97316", to: "#ea580c", text: "text-orange-50" },
  ETH: { from: "#3b82f6", to: "#2563eb", text: "text-blue-50" },
  SOL: { from: "#a855f7", to: "#9333ea", text: "text-purple-50" },
  BNB: { from: "#eab308", to: "#ca8a04", text: "text-yellow-950" },
  ADA: { from: "#0ea5e9", to: "#0284c7", text: "text-sky-50" },
}

export function HoldingsDetail({ holdings, cashBalance, totalValue }: HoldingsDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>{holdings.length} active positions</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href="/trade">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Trade
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {holdings.map((holding, i) => {
          const isPositive = holding.pnl >= 0
          const gradient = COIN_GRADIENTS[holding.coinSymbol]
          const allocationPct = (holding.value / totalValue) * 100

          return (
            <div key={holding.coinId}>
              <Link
                href={`/markets/${holding.coinId}`}
                className="group flex items-start gap-4 rounded-xl p-3 hover:bg-muted/50 transition-colors -mx-1"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    background: gradient
                      ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                      : "hsl(var(--primary))",
                  }}
                >
                  <span className={`font-bold text-sm ${gradient?.text ?? "text-white"}`}>
                    {holding.coinSymbol.slice(0, 2)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-none group-hover:text-primary transition-colors">
                        {holding.coinName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {holding.amount} {holding.coinSymbol} · avg {formatCurrency(holding.avgBuyPrice)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatCurrency(holding.value)}</p>
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            isPositive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}{formatCurrency(holding.pnl)} ({isPositive ? "+" : ""}{holding.pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(allocationPct, 100)}%`,
                          background: gradient
                            ? `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`
                            : "hsl(var(--primary))",
                        }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs h-5 shrink-0">
                      {allocationPct.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </Link>
              {i < holdings.length - 1 && <Separator className="mt-2" />}
            </div>
          )
        })}

        <Separator />
        <div className="flex items-center gap-4 rounded-xl p-3 bg-muted/30">
          <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm leading-none">Cash Balance</p>
            <p className="text-xs text-muted-foreground mt-1">Available to invest</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatCurrency(cashBalance)}</p>
            <p className="text-xs text-muted-foreground">
              {((cashBalance / totalValue) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
