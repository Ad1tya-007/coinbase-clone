import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { MOCK_COIN_DETAILS, MOCK_COINS, MOCK_PORTFOLIO } from "@/lib/mock-data"
import { CoinChart } from "@/components/markets/coin-chart"
import { TradePanel } from "@/components/markets/trade-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

function formatLarge(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `${value.toLocaleString()}`
}

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ coinId: string }>
}) {
  const { coinId } = await params

  const coin =
    MOCK_COIN_DETAILS[coinId] ??
    MOCK_COINS.find((c) => c.id === coinId)

  if (!coin) notFound()

  const portfolio = MOCK_PORTFOLIO
  const holding = portfolio.holdings.find((h) => h.coinId === coinId)
  const holdingAmount = holding?.amount ?? 0
  const isPositive = coin.change24h >= 0

  const detail = MOCK_COIN_DETAILS[coinId]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/markets">
            <ChevronLeft className="h-4 w-4" />
            Markets
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="font-bold text-primary">{coin.symbol.slice(0, 2)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{coin.name}</h1>
            <Badge variant="secondary" className="text-muted-foreground">
              {coin.symbol}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              #{coin.rank}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(coin.price)}{" "}
            <span
              className={`font-medium ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {detail ? (
            <CoinChart
              name={coin.name}
              symbol={coin.symbol}
              price={coin.price}
              change24h={coin.change24h}
              priceHistory={detail.priceHistory}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                Chart data not available
              </CardContent>
            </Card>
          )}

          {detail && (
            <Card>
              <CardHeader>
                <CardTitle>About {coin.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {detail.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <TradePanel
            coinName={coin.name}
            coinSymbol={coin.symbol}
            price={coin.price}
            cashBalance={portfolio.cashBalance}
            holding={holdingAmount}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Cap</span>
                <span className="font-medium">{formatLarge(coin.marketCap)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Volume (24h)</span>
                <span className="font-medium">{formatLarge(coin.volume24h)}</span>
              </div>
              {detail && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">All Time High</span>
                    <span className="font-medium">{formatCurrency(detail.allTimeHigh)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">All Time Low</span>
                    <span className="font-medium">{formatCurrency(detail.allTimeLow)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Circulating Supply</span>
                    <span className="font-medium">
                      {detail.circulatingSupply.toLocaleString()} {coin.symbol}
                    </span>
                  </div>
                  {detail.totalSupply && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Max Supply</span>
                        <span className="font-medium">
                          {detail.totalSupply.toLocaleString()} {coin.symbol}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {holdingAmount > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {holdingAmount} {coin.symbol}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-medium">
                    {formatCurrency(holdingAmount * coin.price)}
                  </span>
                </div>
                {holding && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Buy Price</span>
                      <span className="font-medium">{formatCurrency(holding.avgBuyPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">P&amp;L</span>
                      <span
                        className={`font-medium ${
                          holding.pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {holding.pnl >= 0 ? "+" : ""}
                        {formatCurrency(holding.pnl)} ({holding.pnl >= 0 ? "+" : ""}
                        {holding.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
