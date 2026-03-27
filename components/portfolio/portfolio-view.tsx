'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { PortfolioChart } from '@/components/dashboard/portfolio-chart';
import { AllocationChart } from '@/components/portfolio/allocation-chart';
import { HoldingsDetail } from '@/components/portfolio/holdings-detail';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useMarketData } from '@/hooks/use-market-data';
import type { Portfolio, Holding, PortfolioPoint } from '@/lib/types';

// Consistent palette for allocation chart — cash is always last (green)
const PALETTE = [
  '#f97316',
  '#3b82f6',
  '#a855f7',
  '#eab308',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#0ea5e9',
];

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-3.5 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function AllocationSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-44 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="w-52 h-52 rounded-full shrink-0" />
          <div className="flex-1 w-full space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HoldingsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-4 p-3">
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-3 w-28 ml-auto" />
                </div>
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PortfolioView() {
  const {
    data: portfolioData,
    isPending: portfolioPending,
    isError: portfolioError,
    error: portfolioErr,
    refetch: refetchPortfolio,
  } = usePortfolio();

  const { data: coins, isPending: coinsPending } = useMarketData();

  const isLoading = portfolioPending || coinsPending;

  // ── Build enriched holdings with live prices ────────────────────────────
  const holdings: Holding[] = (portfolioData?.holdings ?? [])
    .filter((h) => h.amount > 0)
    .map((h) => {
      const marketCoin = coins?.find((c) => c.id === h.coinId);
      const currentPrice = marketCoin?.price ?? 0;
      const value = h.amount * currentPrice;
      const cost = h.amount * h.avgBuyPrice;
      const pnl = value - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      return {
        coinId: h.coinId,
        coinName: h.coinName,
        coinSymbol: h.coinSymbol,
        amount: h.amount,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        value,
        pnl,
        pnlPercent,
      };
    });

  const cashBalance = portfolioData?.cashBalance ?? 0;
  const totalHoldingsValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalValue = cashBalance + totalHoldingsValue;
  const totalInvested = holdings.reduce(
    (s, h) => s + h.amount * h.avgBuyPrice,
    0,
  );
  const pnl = totalHoldingsValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  const portfolio: Portfolio = {
    cashBalance,
    totalValue,
    totalInvested,
    pnl,
    pnlPercent,
    holdings,
  };

  // ── Allocation chart items ─────────────────────────────────────────────
  const allocationItems = [
    ...holdings.map((h, i) => ({
      name: h.coinName,
      symbol: h.coinSymbol,
      value: h.value,
      color: PALETTE[i % PALETTE.length],
    })),
    ...(cashBalance > 0
      ? [{ name: 'Cash', symbol: 'USD', value: cashBalance, color: '#22c55e' }]
      : []),
  ];

  // Minimal chart data — a flat baseline since we don't store historical snapshots yet
  const today = new Date();
  const portfolioHistory: PortfolioPoint[] = Array.from(
    { length: 30 },
    (_, i) => ({
      date: new Date(today.getTime() - (29 - i) * 86400000).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      ),
      value: i === 29 ? totalValue : totalInvested || 10000,
    }),
  );

  // ── Error state ────────────────────────────────────────────────────────
  if (portfolioError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load portfolio</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{portfolioErr.message}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPortfolio()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      {isLoading ? <StatsSkeleton /> : <PortfolioStats portfolio={portfolio} />}

      {/* Allocation + Holdings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <AllocationSkeleton />
            <HoldingsSkeleton />
          </>
        ) : (
          <>
            <AllocationChart
              items={allocationItems}
              totalValue={totalValue || 1}
            />
            <HoldingsDetail
              holdings={holdings}
              cashBalance={cashBalance}
              totalValue={totalValue || 1}
            />
          </>
        )}
      </div>

      {/* Portfolio value chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <PortfolioChart
          data={portfolioHistory}
          totalValue={totalValue}
          pnl={pnl}
          pnlPercent={pnlPercent}
        />
      )}
    </div>
  );
}
