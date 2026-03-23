"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { PricePoint } from "@/lib/types"

interface CoinChartProps {
  name: string
  symbol: string
  price: number
  change24h: number
  priceHistory: PricePoint[]
}

const ranges = ["7D", "30D"] as const
type Range = (typeof ranges)[number]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

export function CoinChart({ name, symbol, price, change24h, priceHistory }: CoinChartProps) {
  const [activeRange, setActiveRange] = useState<Range>("30D")
  const isPositive = change24h >= 0

  const displayedData =
    activeRange === "7D" ? priceHistory.slice(-7) : priceHistory

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{name} Price</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(price)}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <Badge
                variant="secondary"
                className={`${
                  isPositive
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                }`}
              >
                {isPositive ? "+" : ""}{change24h.toFixed(2)}% (24h)
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {ranges.map((range) => (
              <Button
                key={range}
                variant={activeRange === range ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setActiveRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={displayedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#16a34a" : "#dc2626"}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#16a34a" : "#dc2626"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000
                  ? `$${(v / 1000).toFixed(1)}k`
                  : `$${v.toFixed(0)}`
              }
              width={56}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
              formatter={(value: number) => [formatCurrency(value), `${symbol} Price`]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#16a34a" : "#dc2626"}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
