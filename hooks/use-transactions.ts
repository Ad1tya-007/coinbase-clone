"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Transaction } from "@/lib/types"

export const TRANSACTIONS_QUERY_KEY = ["transactions"] as const

export function useTransactions() {
  return useQuery<Transaction[], Error>({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/transactions")
      if (!res.ok) throw new Error("Failed to load transactions")
      return res.json()
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useRefreshTransactions() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
}
