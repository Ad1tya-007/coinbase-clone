"use client"

import { useState } from "react"
import { Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface TradePanelProps {
  coinName: string
  coinSymbol: string
  price: number
  cashBalance: number
  holding: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const QUICK_AMOUNTS = [25, 50, 75, 100] as const

export function TradePanel({
  coinName,
  coinSymbol,
  price,
  cashBalance,
  holding,
}: TradePanelProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("buy")

  const numericAmount = parseFloat(amount) || 0
  const coinAmount = numericAmount / price
  const holdingValue = holding * price

  function applyQuickAmount(pct: number) {
    const base = activeTab === "buy" ? cashBalance : holdingValue
    const value = (base * pct) / 100
    setAmount(value.toFixed(2))
  }

  function handleTrade(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setAmount("")
    }, 1200)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Trade {coinName}</CardTitle>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Price: <strong className="text-foreground">{formatCurrency(price)}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="gap-1.5">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <form onSubmit={handleTrade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_AMOUNTS.map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyQuickAmount(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>You receive</span>
                  <span className="font-medium text-foreground">
                    {coinAmount > 0 ? coinAmount.toFixed(8) : "—"} {coinSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Available</span>
                  <span className="font-medium text-foreground">{formatCurrency(cashBalance)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee</span>
                  <Badge variant="secondary" className="text-xs h-5">Free</Badge>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !amount || numericAmount <= 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Buy ${coinSymbol}`
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={handleTrade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_AMOUNTS.map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyQuickAmount(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>You sell</span>
                  <span className="font-medium text-foreground">
                    {coinAmount > 0 ? coinAmount.toFixed(8) : "—"} {coinSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Holding</span>
                  <span className="font-medium text-foreground">
                    {holding} {coinSymbol}
                    <span className="text-muted-foreground ml-1">
                      ({formatCurrency(holdingValue)})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee</span>
                  <Badge variant="secondary" className="text-xs h-5">Free</Badge>
                </div>
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={isLoading || !amount || numericAmount <= 0 || holding === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Sell ${coinSymbol}`
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
