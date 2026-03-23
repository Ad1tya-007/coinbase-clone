"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AllocationItem {
  name: string
  symbol: string
  value: number
  color: string
}

interface AllocationChartProps {
  items: AllocationItem[]
  totalValue: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

const renderActiveShape = (props: Record<string, number & string>) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  )
}

export function AllocationChart({ items, totalValue }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeItem = activeIndex !== null ? items[activeIndex] : null
  const displayValue = activeItem ? activeItem.value : totalValue
  const displayLabel = activeItem ? activeItem.symbol : "Total"
  const displayPct = activeItem
    ? ((activeItem.value / totalValue) * 100).toFixed(1)
    : "100"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Portfolio breakdown by asset</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-52 h-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activeIndex ?? undefined}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={renderActiveShape as any}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  strokeWidth={0}
                >
                  {items.map((item, index) => (
                    <Cell key={item.symbol} fill={item.color} opacity={activeIndex === null || activeIndex === index ? 1 : 0.4} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(value: number, _name, entry) => [
                    formatCurrency(value),
                    entry.payload.symbol,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-muted-foreground font-medium">{displayLabel}</p>
              <p className="text-lg font-bold leading-tight">{formatCurrency(displayValue)}</p>
              <p className="text-xs text-muted-foreground">{displayPct}%</p>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2.5">
            {items.map((item, index) => {
              const pct = (item.value / totalValue) * 100
              return (
                <div
                  key={item.symbol}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-default transition-colors ${
                    activeIndex === index ? "bg-muted/60" : "hover:bg-muted/40"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-sm font-semibold tabular-nums ml-2">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground">{item.symbol}</p>
                      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
