'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Holding } from '@/lib/types';

interface HoldingsTableProps {
  holdings: Holding[];
  totalValue: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const COIN_COLORS: Record<string, string> = {
  BTC: 'bg-orange-500',
  ETH: 'bg-blue-500',
  SOL: 'bg-purple-500',
  BNB: 'bg-yellow-500',
  ADA: 'bg-sky-500',
};

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const investedValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Holdings</CardTitle>
            <CardDescription>{holdings.length} assets</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/trade">Buy / Sell</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {holdings.map((holding) => {
          const allocation = (holding.value / totalValue) * 100;
          const isPositive = holding.pnl >= 0;

          return (
            <div key={holding.coinId} className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full ${COIN_COLORS[holding.coinSymbol] ?? 'bg-primary'} flex items-center justify-center shrink-0`}>
                  <span className="text-white font-bold text-xs">
                    {holding.coinSymbol.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm leading-none">
                        {holding.coinName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {holding.amount} {holding.coinSymbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(holding.value)}
                      </p>
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            isPositive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                          {isPositive ? '+' : ''}
                          {holding.pnlPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-12">
                <Progress value={allocation} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {allocation.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assets Value</span>
            <span className="font-semibold">
              {formatCurrency(investedValue)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
