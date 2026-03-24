"use client"

import Link from "next/link"
import { ChevronLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CoinChart } from "@/components/markets/coin-chart"
import { TradePanel } from "@/components/markets/trade-panel"
import { useCoinDetail } from "@/hooks/use-coin-detail"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

function formatLarge(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            {i < 4 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface CoinDetailViewProps {
  coinId: string
}

export function CoinDetailView({ coinId }: CoinDetailViewProps) {
  const { data: coin, isPending, isError, error, refetch } = useCoinDetail(coinId)

  const isPositive = (coin?.change24h ?? 0) >= 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/markets">
          <ChevronLeft className="h-4 w-4" />
          Markets
        </Link>
      </Button>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load coin data</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Coin header */}
      {isPending ? (
        <HeaderSkeleton />
      ) : coin ? (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">{coin.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
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
                {isPositive ? "+" : ""}
                {coin.change24h.toFixed(2)}%
              </span>
            </p>
          </div>
        </div>
      ) : null}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: chart + about */}
        <div className="lg:col-span-2 space-y-6">
          {isPending ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-[280px] w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ) : coin ? (
            <CoinChart
              coinId={coinId}
              name={coin.name}
              symbol={coin.symbol}
              price={coin.price}
              change24h={coin.change24h}
            />
          ) : null}

          {/* About */}
          {isPending ? (
            <Card>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ) : coin?.description ? (
            <Card>
              <CardHeader>
                <CardTitle>About {coin.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {coin.description}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right: trade panel + stats */}
        <div className="space-y-4">
          {isPending ? (
            <Card>
              <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : coin ? (
            <TradePanel
              coinName={coin.name}
              coinSymbol={coin.symbol}
              price={coin.price}
              cashBalance={10000}
              holding={0}
            />
          ) : null}

          {isPending ? (
            <StatsSkeleton />
          ) : coin ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{formatLarge(coin.marketCap)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume (24h)</span>
                  <span className="font-medium">{formatLarge(coin.volume24h)}</span>
                </div>
                {coin.allTimeHigh != null && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All Time High</span>
                      <span className="font-medium">{formatCurrency(coin.allTimeHigh)}</span>
                    </div>
                  </>
                )}
                {coin.allTimeLow != null && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All Time Low</span>
                      <span className="font-medium">{formatCurrency(coin.allTimeLow)}</span>
                    </div>
                  </>
                )}
                {coin.circulatingSupply != null && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Circulating Supply</span>
                      <span className="font-medium text-right">
                        {coin.circulatingSupply.toLocaleString()} {coin.symbol}
                      </span>
                    </div>
                  </>
                )}
                {coin.totalSupply != null && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Supply</span>
                      <span className="font-medium text-right">
                        {coin.totalSupply.toLocaleString()} {coin.symbol}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
