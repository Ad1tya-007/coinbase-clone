"use client"

import Link from "next/link"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest trading activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors"
          >
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                tx.type === "buy"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {tx.type === "buy" ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm leading-none">
                  {tx.type === "buy" ? "Bought" : "Sold"} {tx.coinName}
                </p>
                <Badge
                  variant="secondary"
                  className={`text-xs h-5 ${
                    tx.type === "buy"
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                      : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                  }`}
                >
                  {tx.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tx.amount} {tx.coinSymbol} · {formatDate(tx.createdAt)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm">
                {tx.type === "buy" ? "-" : "+"}
                {formatCurrency(tx.total)}
              </p>
              <p className="text-xs text-muted-foreground">@ {formatCurrency(tx.price)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
