"use client"

import { useState, useMemo } from "react"
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Transaction } from "@/lib/types"

interface TransactionsTableProps {
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
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "buy" | "sell">("all")

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.coinName.toLowerCase().includes(search.toLowerCase()) ||
        tx.coinSymbol.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || tx.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [transactions, search, typeFilter])

  const totalBought = transactions
    .filter((t) => t.type === "buy")
    .reduce((s, t) => s + t.total, 0)
  const totalSold = transactions
    .filter((t) => t.type === "sell")
    .reduce((s, t) => s + t.total, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold mt-1">{transactions.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total Bought</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(totalBought)}
          </p>
        </div>
        <div className="rounded-lg border p-4 hidden sm:block">
          <p className="text-xs text-muted-foreground">Total Sold</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(totalSold)}
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by asset..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "buy", "sell"] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="h-9 capitalize"
            >
              {type === "all" ? "All" : type === "buy" ? "Buys" : "Sells"}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Type</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center ${
                          tx.type === "buy"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "buy" ? (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </div>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">
                          {tx.coinSymbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-none">{tx.coinName}</p>
                        <p className="text-xs text-muted-foreground">{tx.coinSymbol}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {tx.amount} {tx.coinSymbol}
                  </TableCell>
                  <TableCell className="text-right text-sm hidden sm:table-cell">
                    {formatCurrency(tx.price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    <span className={tx.type === "buy" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                      {tx.type === "buy" ? "-" : "+"}{formatCurrency(tx.total)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground hidden md:table-cell">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {transactions.length} transactions
      </p>
    </div>
  )
}
