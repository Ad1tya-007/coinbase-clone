'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { useTransactions } from '@/hooks/use-transactions';

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="rounded-lg border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-5 w-16" />
            <div className="flex-1 flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsView() {
  const {
    data: transactions,
    isPending,
    isError,
    error,
    refetch,
  } = useTransactions();

  if (isPending) return <TableSkeleton />;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load transactions</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error.message}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionsTable transactions={transactions ?? []} />
    </div>
  );
}
