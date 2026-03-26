'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMarketData } from '@/hooks/use-market-data';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
}

function formatCompact(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-6 mx-auto" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-5 w-16 ml-auto" />
          </TableCell>
          <TableCell className="text-right hidden md:table-cell">
            <Skeleton className="h-4 w-16 ml-auto" />
          </TableCell>
          <TableCell className="text-right hidden lg:table-cell">
            <Skeleton className="h-4 w-16 ml-auto" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-8 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-7 w-14 mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

type SortKey = 'rank' | 'price' | 'change24h' | 'marketCap' | 'volume24h';
type SortDir = 'asc' | 'desc';

export function MarketTable() {
  const {
    data: coins,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useMarketData();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    if (!coins) return [];
    let result = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()),
    );
    result = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      return (Number(a[sortKey]) - Number(b[sortKey])) * dir;
    });
    return result;
  }, [coins, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  }

  const totalMarketCap = coins?.reduce((s, c) => s + c.marketCap, 0) ?? 0;
  const gainers = coins?.filter((c) => c.change24h > 0).length ?? 0;
  const losers = (coins?.length ?? 0) - gainers;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Market Cap </span>
          <span className="font-semibold">
            {isPending ? (
              <Skeleton className="inline-block h-4 w-20 align-middle" />
            ) : (
              `$${(totalMarketCap / 1e12).toFixed(2)}T`
            )}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Gainers / Losers </span>
          {isPending ? (
            <Skeleton className="inline-block h-4 w-14 align-middle" />
          ) : (
            <span className="font-semibold">
              <span className="text-green-600 dark:text-green-400">
                {gainers}
              </span>
              {' / '}
              <span className="text-red-600 dark:text-red-400">{losers}</span>
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isFetching && !isPending && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> Updating…
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => refetch()}
            disabled={isFetching}>
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load market data</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
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
            const [key, dir] = v.split('-') as [SortKey, SortDir];
            setSortKey(key);
            setSortDir(dir);
          }}>
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

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort('price')}>
                Price
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort('change24h')}>
                24h
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground hidden md:table-cell"
                onClick={() => toggleSort('marketCap')}>
                Market Cap
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-foreground hidden lg:table-cell"
                onClick={() => toggleSort('volume24h')}>
                Volume (24h)
              </TableHead>
              <TableHead className="w-20 text-center">Trade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-16 text-muted-foreground">
                  No coins found for &quot;{search}&quot;
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coin) => {
                const isPositive = coin.change24h >= 0;
                return (
                  <TableRow key={coin.id} className="group cursor-pointer">
                    <TableCell className="text-center">
                      <div className="text-muted-foreground text-sm">
                        {coin.rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/markets/${coin.id}`}
                        className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-xs text-primary">
                            {coin.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{coin.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {coin.symbol}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatPrice(coin.price)}
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
                          className={`text-xs h-5 ${isPositive ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'}`}>
                          {isPositive ? '+' : ''}
                          {coin.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm hidden md:table-cell">
                      {formatCompact(coin.marketCap)}
                    </TableCell>
                    <TableCell className="text-right text-sm hidden lg:table-cell">
                      {formatCompact(coin.volume24h)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        asChild>
                        <Link href={`/markets/${coin.id}`}>Trade</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isPending && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {coins?.length ?? 0} assets · Data cached
          for 2 min
        </p>
      )}
    </div>
  );
}
