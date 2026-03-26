"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StripeBuyModal, type BuyOrderDetails } from "@/components/markets/stripe-buy-modal"
import { executeSellAction } from "@/actions/trade"
import { useMarketData } from "@/hooks/use-market-data"
import { usePortfolio, useRefreshPortfolio } from "@/hooks/use-portfolio"
import { useRefreshTransactions } from "@/hooks/use-transactions"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price)
}

const QUICK_PCTS = [25, 50, 75, 100] as const

export function TradeForm() {
  const { data: coins, isPending: coinsLoading, isFetching: coinsFetching, refetch: refetchCoins } = useMarketData()
  const { data: portfolio, isPending: portfolioLoading } = usePortfolio()

  const refreshPortfolio = useRefreshPortfolio()
  const refreshTransactions = useRefreshTransactions()

  const [selectedCoinId, setSelectedCoinId] = useState("")
  const [amount, setAmount] = useState("")
  const [activeTab, setActiveTab] = useState("buy")

  // Stripe buy modal state
  const [buyOrder, setBuyOrder] = useState<BuyOrderDetails | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingPI, setIsCreatingPI] = useState(false)

  // Sell state
  const [isSelling, startSell] = useTransition()

  // Inline feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Derived values
  const selectedCoin = coins?.find((c) => c.id === selectedCoinId)
  const dbHolding = portfolio?.holdings.find((h) => h.coinId === selectedCoinId)
  const holdingAmount = dbHolding?.amount ?? 0
  const holdingValue = holdingAmount * (selectedCoin?.price ?? 0)
  const cashBalance = portfolio?.cashBalance ?? 0

  const numericAmount = parseFloat(amount) || 0
  const coinAmount = selectedCoin ? numericAmount / selectedCoin.price : 0

  // Enrich holdings with live prices from market data
  const enrichedHoldings =
    portfolio?.holdings
      .filter((h) => h.amount > 0)
      .map((h) => {
        const marketCoin = coins?.find((c) => c.id === h.coinId)
        const currentPrice = marketCoin?.price ?? 0
        const value = h.amount * currentPrice
        const cost = h.amount * h.avgBuyPrice
        const pnl = value - cost
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
        return { ...h, currentPrice, value, pnl, pnlPct }
      }) ?? []

  const totalHoldingsValue = enrichedHoldings.reduce((s, h) => s + h.value, 0)
  const totalPortfolioValue = cashBalance + totalHoldingsValue

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  function applyQuickPct(pct: number) {
    const base = activeTab === "buy" ? cashBalance : holdingValue
    setAmount(((base * pct) / 100).toFixed(2))
  }

  // ── Buy: create PaymentIntent → open Stripe modal ─────────────────────────
  async function handleBuy(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCoin || numericAmount <= 0) return
    if (numericAmount > cashBalance) {
      showFeedback("error", "Insufficient cash balance.")
      return
    }
    if (numericAmount < 1) {
      showFeedback("error", "Minimum trade amount is $1.")
      return
    }

    setIsCreatingPI(true)
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: numericAmount,
          coinName: selectedCoin.name,
          coinId: selectedCoin.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initiate payment")

      setClientSecret(data.clientSecret)
      setBuyOrder({
        coinId: selectedCoin.id,
        coinName: selectedCoin.name,
        coinSymbol: selectedCoin.symbol,
        usdAmount: numericAmount,
        pricePerCoin: selectedCoin.price,
        coinAmount,
      })
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Could not initiate payment.")
    } finally {
      setIsCreatingPI(false)
    }
  }

  function handleBuySuccess(newCashBalance: number) {
    void newCashBalance
    setAmount("")
    setBuyOrder(null)
    setClientSecret(null)
    refreshPortfolio()
    refreshTransactions()
    showFeedback(
      "success",
      `Successfully bought ${coinAmount.toFixed(8)} ${selectedCoin?.symbol}!`
    )
  }

  // ── Sell: direct server action ────────────────────────────────────────────
  function handleSell(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCoin || numericAmount <= 0) return

    const coinAmountToSell = numericAmount / selectedCoin.price
    if (coinAmountToSell > holdingAmount) {
      showFeedback("error", "You don't have enough holdings to sell.")
      return
    }

    startSell(async () => {
      const result = await executeSellAction({
        coinId: selectedCoin.id,
        coinName: selectedCoin.name,
        coinSymbol: selectedCoin.symbol,
        coinAmount: coinAmountToSell,
        pricePerCoin: selectedCoin.price,
      })

      if (result.success) {
        setAmount("")
        refreshPortfolio()
        refreshTransactions()
        showFeedback(
          "success",
          `Sold ${coinAmountToSell.toFixed(8)} ${selectedCoin.symbol} for ${formatCurrency(numericAmount)}.`
        )
      } else {
        showFeedback("error", result.error ?? "Sell failed. Please try again.")
      }
    })
  }

  const isActionPending = isCreatingPI || isSelling
  const isDataLoading = coinsLoading || portfolioLoading

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: trade form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                    Trade
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Buy and sell crypto instantly at live market prices
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground"
                  onClick={() => refetchCoins()}
                  disabled={coinsFetching}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${coinsFetching ? "animate-spin" : ""}`} />
                  Refresh prices
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {feedback && (
                <div className="mb-5">
                  <Alert
                    variant={feedback.type === "error" ? "destructive" : "default"}
                    className={
                      feedback.type === "success"
                        ? "border-green-500/40 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                        : ""
                    }
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{feedback.message}</AlertDescription>
                  </Alert>
                </div>
              )}

              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v)
                  setAmount("")
                }}
              >
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
                    <form
                      onSubmit={tab === "buy" ? handleBuy : handleSell}
                      className="space-y-5"
                    >
                      {/* Coin selector */}
                      <div className="space-y-2">
                        <Label>Select Asset</Label>
                        {coinsLoading ? (
                          <Skeleton className="h-11 w-full rounded-md" />
                        ) : (
                          <Select
                            value={selectedCoinId}
                            onValueChange={(v) => {
                              setSelectedCoinId(v)
                              setAmount("")
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Choose a cryptocurrency…" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {coins?.map((coin) => {
                                const isPositive = coin.change24h >= 0
                                return (
                                  <SelectItem key={coin.id} value={coin.id}>
                                    <div className="flex items-center gap-2">
                                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-primary">
                                          {coin.symbol.slice(0, 2)}
                                        </span>
                                      </div>
                                      <span className="font-medium">{coin.name}</span>
                                      <span className="text-muted-foreground text-xs">
                                        {formatPrice(coin.price)}
                                      </span>
                                      <span
                                        className={`text-xs font-medium ml-auto ${
                                          isPositive
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                      >
                                        {isPositive ? "+" : ""}
                                        {coin.change24h.toFixed(2)}%
                                      </span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Amount input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${tab}-amount`}>Amount (USD)</Label>
                          {portfolioLoading ? (
                            <Skeleton className="h-3.5 w-32" />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {tab === "buy"
                                ? `Available: ${formatCurrency(cashBalance)}`
                                : `Holding: ${holdingAmount.toFixed(8)} ${selectedCoin?.symbol ?? ""}`}
                            </span>
                          )}
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

                      {/* Quick percentage buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {QUICK_PCTS.map((pct) => (
                          <Button
                            key={pct}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDataLoading}
                            onClick={() => applyQuickPct(pct)}
                          >
                            {pct}%
                          </Button>
                        ))}
                      </div>

                      <Separator />

                      {/* Order summary */}
                      <div className="space-y-2.5 rounded-lg bg-muted/40 border p-4">
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
                            {selectedCoin ? formatPrice(selectedCoin.price) : "—"}
                          </span>
                        </div>
                        {tab === "buy" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">24h change</span>
                            {selectedCoin ? (
                              <span
                                className={`font-medium flex items-center gap-1 ${
                                  selectedCoin.change24h >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {selectedCoin.change24h >= 0 ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {selectedCoin.change24h >= 0 ? "+" : ""}
                                {selectedCoin.change24h.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trading fee</span>
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>{tab === "buy" ? "Total charged" : "You receive"}</span>
                          <span
                            className={
                              tab === "sell" && numericAmount > 0
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }
                          >
                            {numericAmount > 0 ? formatCurrency(numericAmount) : "—"}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        variant={tab === "sell" ? "destructive" : "default"}
                        disabled={
                          isActionPending ||
                          isDataLoading ||
                          !selectedCoinId ||
                          !amount ||
                          numericAmount <= 0 ||
                          (tab === "sell" && holdingAmount === 0)
                        }
                      >
                        {isActionPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isCreatingPI ? "Preparing payment…" : "Processing…"}
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

        {/* ── Right: account info + holdings ───────────────────────────── */}
        <div className="space-y-4">
          {/* Balance card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash Available</span>
                {portfolioLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(cashBalance)}
                  </span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assets Value</span>
                {portfolioLoading || coinsLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-semibold">{formatCurrency(totalHoldingsValue)}</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Portfolio</span>
                {portfolioLoading || coinsLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-bold">{formatCurrency(totalPortfolioValue)}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Holdings card */}
          {portfolioLoading ? (
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-10" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <Skeleton className="h-3.5 w-16 ml-auto" />
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : enrichedHoldings.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Your Holdings
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {enrichedHoldings.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enrichedHoldings.map((h) => (
                  <div key={h.coinId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-primary">
                          {h.coinSymbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium leading-none">{h.coinSymbol}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {h.amount.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(h.value)}</p>
                      <p
                        className={`text-xs flex items-center justify-end gap-0.5 ${
                          h.pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {h.pnl >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {h.pnl >= 0 ? "+" : ""}
                        {h.pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <p className="font-medium">No holdings yet</p>
                <p className="text-xs mt-1">Buy your first asset above to get started.</p>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/markets">Browse All Markets</Link>
          </Button>
        </div>
      </div>

      {/* Stripe buy modal */}
      {buyOrder && clientSecret && (
        <StripeBuyModal
          open={!!buyOrder}
          onClose={() => {
            setBuyOrder(null)
            setClientSecret(null)
          }}
          order={buyOrder}
          clientSecret={clientSecret}
          onSuccess={handleBuySuccess}
        />
      )}
    </>
  )
}
