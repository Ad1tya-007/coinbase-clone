"use client"

import { TrendingUp, TrendingDown, Wallet, DollarSign, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Portfolio } from "@/lib/types"

interface PortfolioStatsProps {
  portfolio: Portfolio
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function PortfolioStats({ portfolio }: PortfolioStatsProps) {
  const isPositive = portfolio.pnl >= 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-xs font-medium ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}{portfolio.pnlPercent.toFixed(2)}% all time
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash Balance
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.cashBalance)}</div>
          <p className="text-xs text-muted-foreground mt-1">Available to trade</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Invested
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalInvested)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            In {portfolio.holdings.length} assets
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total P&amp;L
          </CardTitle>
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              isPositive ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}{formatCurrency(portfolio.pnl)}
          </div>
          <div className="mt-1">
            <Badge
              variant="secondary"
              className={
                isPositive
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
              }
            >
              {isPositive ? "+" : ""}{portfolio.pnlPercent.toFixed(2)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
