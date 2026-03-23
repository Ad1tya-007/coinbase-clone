import { MOCK_TRANSACTIONS } from "@/lib/mock-data"
import { TransactionsTable } from "@/components/transactions/transactions-table"

export default function TransactionsPage() {
  const transactions = MOCK_TRANSACTIONS

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete history of all your trades
        </p>
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  )
}
