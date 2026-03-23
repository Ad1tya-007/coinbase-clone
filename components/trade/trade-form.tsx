"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownLeft, ArrowUpRight, Loader2, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Coin, Portfolio } from "@/lib/types"

interface TradeFormProps {
  coins: Coin[]
  portfolio: Portfolio
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

const QUICK_AMOUNTS = [25, 50, 75, 100] as const

export function TradeForm({ coins, portfolio }: TradeFormProps) {
  const [selectedCoinId, setSelectedCoinId] = useState(coins[0]?.id ?? "")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("buy")

  const selectedCoin = coins.find((c) => c.id === selectedCoinId)
  const holding = portfolio.holdings.find((h) => h.coinId === selectedCoinId)
  const holdingAmount = holding?.amount ?? 0
  const holdingValue = holdingAmount * (selectedCoin?.price ?? 0)

  const numericAmount = parseFloat(amount) || 0
  const coinAmount = selectedCoin ? numericAmount / selectedCoin.price : 0

  function applyQuickAmount(pct: number) {
    const base = activeTab === "buy" ? portfolio.cashBalance : holdingValue
    setAmount(((base * pct) / 100).toFixed(2))
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
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              Trade
            </CardTitle>
            <CardDescription>
              Buy and sell crypto instantly at current market prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setAmount("") }}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="buy" className="gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Sell
                </TabsTrigger>
              </TabsList>

              {(["buy", "sell"] as const).map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <form onSubmit={handleTrade} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Select Asset</Label>
                      <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose a coin" />
                        </SelectTrigger>
                        <SelectContent>
                          {coins.map((coin) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-primary">
                                    {coin.symbol.slice(0, 2)}
                                  </span>
                                </div>
                                <span>{coin.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {formatCurrency(coin.price)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${tab}-amount`}>Amount (USD)</Label>
                        <span className="text-xs text-muted-foreground">
                          {tab === "buy"
                            ? `Available: ${formatCurrency(portfolio.cashBalance)}`
                            : `Holding: ${holdingAmount} ${selectedCoin?.symbol ?? ""}`}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id={`${tab}-amount`}
                          type="number"
                          placeholder="0.00"
                          className="pl-7 h-11 text-base"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {QUICK_AMOUNTS.map((pct) => (
                        <Button
                          key={pct}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyQuickAmount(pct)}
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2.5 rounded-lg bg-muted/40 p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {tab === "buy" ? "You receive" : "You sell"}
                        </span>
                        <span className="font-medium">
                          {coinAmount > 0
                            ? `${coinAmount.toFixed(8)} ${selectedCoin?.symbol ?? ""}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Market price</span>
                        <span className="font-medium">
                          {selectedCoin ? formatCurrency(selectedCoin.price) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trading fee</span>
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span>{numericAmount > 0 ? formatCurrency(numericAmount) : "—"}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      variant={tab === "sell" ? "destructive" : "default"}
                      disabled={
                        isLoading ||
                        !amount ||
                        numericAmount <= 0 ||
                        (tab === "sell" && holdingAmount === 0)
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `${tab === "buy" ? "Buy" : "Sell"} ${selectedCoin?.symbol ?? "Crypto"}`
                      )}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Account Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cash Available</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(portfolio.cashBalance)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assets Value</span>
              <span className="font-semibold">
                {formatCurrency(portfolio.totalValue - portfolio.cashBalance)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Portfolio</span>
              <span className="font-bold">{formatCurrency(portfolio.totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {portfolio.holdings.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.holdings.map((h) => (
                <div key={h.coinId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary">
                        {h.coinSymbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium leading-none">{h.coinSymbol}</p>
                      <p className="text-xs text-muted-foreground">{h.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(h.value)}</p>
                    <p
                      className={`text-xs ${
                        h.pnl >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link href="/markets">Browse Markets</Link>
        </Button>
      </div>
    </div>
  )
}
