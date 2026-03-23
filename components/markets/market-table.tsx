"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react"
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
import type { Coin } from "@/lib/types"

interface MarketTableProps {
  coins: Coin[]
}

function formatCurrency(value: number, compact = false) {
  if (compact) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#16a34a" : "#dc2626"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type SortKey = "rank" | "price" | "change24h" | "marketCap" | "volume24h"
type SortDir = "asc" | "desc"

export function MarketTable({ coins }: MarketTableProps) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    result = [...result].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      const dir = sortDir === "asc" ? 1 : -1
      return typeof valA === "number" && typeof valB === "number"
        ? (valA - valB) * dir
        : 0
    })
    return result
  }, [coins, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "rank" ? "asc" : "desc")
    }
  }

  function toggleWatchlist(id: string) {
    setWatchlist((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coins..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={`${sortKey}-${sortDir}`}
          onValueChange={(v) => {
            const [key, dir] = v.split("-") as [SortKey, SortDir]
            setSortKey(key)
            setSortDir(dir)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank-asc">Rank ↑</SelectItem>
            <SelectItem value="marketCap-desc">Market Cap ↓</SelectItem>
            <SelectItem value="change24h-desc">Gainers first</SelectItem>
            <SelectItem value="change24h-asc">Losers first</SelectItem>
            <SelectItem value="volume24h-desc">Volume ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("price")}
              >
                Price
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("change24h")}
              >
                24h Change
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground hidden md:table-cell"
                onClick={() => toggleSort("marketCap")}
              >
                Market Cap
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground hidden lg:table-cell"
                onClick={() => toggleSort("volume24h")}
              >
                Volume (24h)
              </TableHead>
              <TableHead className="hidden lg:table-cell">7D</TableHead>
              <TableHead className="w-20 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((coin) => {
              const isPositive = coin.change24h >= 0
              return (
                <TableRow key={coin.id} className="group cursor-pointer">
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWatchlist(coin.id)
                        }}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            watchlist.has(coin.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <span className="text-muted-foreground text-sm">{coin.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/markets/${coin.id}`}
                      className="flex items-center gap-3 hover:no-underline"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-primary">
                          {coin.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{coin.name}</p>
                        <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(coin.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-xs h-5 ${
                          isPositive
                            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {coin.change24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm hidden md:table-cell">
                    {formatCurrency(coin.marketCap, true)}
                  </TableCell>
                  <TableCell className="text-right text-sm hidden lg:table-cell">
                    {formatCurrency(coin.volume24h, true)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <MiniSparkline data={coin.sparkline} positive={isPositive} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                      <Link href={`/markets/${coin.id}`}>Trade</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {coins.length} assets
      </p>
    </div>
  )
}
