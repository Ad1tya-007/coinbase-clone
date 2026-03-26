import { TransactionsView } from '@/components/transactions/transactions-view';

export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete history of all your trades
        </p>
      </div>
      <TransactionsView />
    </div>
  );
}
