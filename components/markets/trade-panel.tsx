"use client"

import { useState, useTransition } from "react"
import { Loader2, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { StripeBuyModal, type BuyOrderDetails } from "@/components/markets/stripe-buy-modal"
import { executeSellAction } from "@/actions/trade"
import { useRefreshPortfolio } from "@/hooks/use-portfolio"
import { useRefreshTransactions } from "@/hooks/use-transactions"

interface TradePanelProps {
  coinId: string
  coinName: string
  coinSymbol: string
  price: number
  /** USD cash balance from portfolio */
  cashBalance: number | undefined
  /** Coin units currently held */
  holding: number | undefined
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const QUICK_PCTS = [25, 50, 75, 100] as const

export function TradePanel({
  coinId,
  coinName,
  coinSymbol,
  price,
  cashBalance,
  holding,
  isLoading,
}: TradePanelProps) {
  const [amount, setAmount] = useState("")
  const [activeTab, setActiveTab] = useState("buy")

  // Stripe modal state
  const [buyOrder, setBuyOrder] = useState<BuyOrderDetails | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingPI, setIsCreatingPI] = useState(false)

  // Sell state
  const [isSelling, startSell] = useTransition()

  // Inline feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const refreshPortfolio = useRefreshPortfolio()
  const refreshTransactions = useRefreshTransactions()

  const numericAmount = parseFloat(amount) || 0
  const coinAmount = numericAmount / price
  const holdingAmount = holding ?? 0
  const holdingValue = holdingAmount * price
  const balance = cashBalance ?? 0

  function applyQuickPct(pct: number) {
    const base = activeTab === "buy" ? balance : holdingValue
    setAmount(((base * pct) / 100).toFixed(2))
  }

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ── Buy: create PaymentIntent then open Stripe modal ──────────────────────
  async function handleBuyClick(e: React.FormEvent) {
    e.preventDefault()
    if (numericAmount <= 0) return
    if (numericAmount > balance) {
      showFeedback("error", "Insufficient cash balance.")
      return
    }

    setIsCreatingPI(true)
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUsd: numericAmount, coinName, coinId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create payment")

      setClientSecret(data.clientSecret)
      setBuyOrder({
        coinId,
        coinName,
        coinSymbol,
        usdAmount: numericAmount,
        pricePerCoin: price,
        coinAmount,
      })
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Could not initiate payment.")
    } finally {
      setIsCreatingPI(false)
    }
  }

  function handleBuySuccess(newCashBalance: number) {
    setAmount("")
    setBuyOrder(null)
    setClientSecret(null)
    refreshPortfolio()
    refreshTransactions()
    showFeedback("success", `Successfully bought ${coinAmount.toFixed(8)} ${coinSymbol}!`)
    // Suppress the unused variable warning — newCashBalance is used by the callback contract
    void newCashBalance
  }

  // ── Sell: call server action directly (no payment needed) ─────────────────
  function handleSell(e: React.FormEvent) {
    e.preventDefault()
    if (numericAmount <= 0) return

    const coinAmountToSell = numericAmount / price
    if (coinAmountToSell > holdingAmount) {
      showFeedback("error", "Insufficient holdings.")
      return
    }

    startSell(async () => {
      const result = await executeSellAction({
        coinId,
        coinName,
        coinSymbol,
        coinAmount: coinAmountToSell,
        pricePerCoin: price,
      })

      if (result.success) {
        setAmount("")
        refreshPortfolio()
        refreshTransactions()
        showFeedback("success", `Sold ${coinAmountToSell.toFixed(8)} ${coinSymbol} for ${formatCurrency(numericAmount)}.`)
      } else {
        showFeedback("error", result.error ?? "Sell failed.")
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trade {coinName}</CardTitle>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>
              Price:{" "}
              <strong className="text-foreground">{formatCurrency(price)}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback && (
            <Alert
              variant={feedback.type === "error" ? "destructive" : "default"}
              className={feedback.type === "success" ? "border-green-500/40 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300" : ""}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setAmount("") }}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="buy" className="gap-1.5">
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Sell
              </TabsTrigger>
            </TabsList>

            {/* ── Buy Tab ──────────────────────────────────────────────── */}
            <TabsContent value="buy">
              <form onSubmit={handleBuyClick} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="buy-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {QUICK_PCTS.map((pct) => (
                    <Button key={pct} type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyQuickPct(pct)}>
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
                    {isLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span className="font-medium text-foreground">{formatCurrency(balance)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee</span>
                    <Badge variant="secondary" className="text-xs h-5">Free</Badge>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isCreatingPI || !amount || numericAmount <= 0 || isLoading}>
                  {isCreatingPI ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing…</>
                  ) : (
                    `Buy ${coinSymbol}`
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sell Tab ─────────────────────────────────────────────── */}
            <TabsContent value="sell">
              <form onSubmit={handleSell} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-amount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
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
                  {QUICK_PCTS.map((pct) => (
                    <Button key={pct} type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyQuickPct(pct)}>
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
                    <span>Your holding</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      <span className="font-medium text-foreground">
                        {holdingAmount.toFixed(8)} {coinSymbol}
                        <span className="text-muted-foreground ml-1">({formatCurrency(holdingValue)})</span>
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>You receive</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {numericAmount > 0 ? formatCurrency(numericAmount) : "—"}
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
                  disabled={isSelling || !amount || numericAmount <= 0 || holdingAmount === 0 || isLoading}
                >
                  {isSelling ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                  ) : (
                    `Sell ${coinSymbol}`
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stripe buy modal — only mounts when there's an active order */}
      {buyOrder && clientSecret && (
        <StripeBuyModal
          open={!!buyOrder}
          onClose={() => { setBuyOrder(null); setClientSecret(null) }}
          order={buyOrder}
          clientSecret={clientSecret}
          onSuccess={handleBuySuccess}
        />
      )}
    </>
  )
}
