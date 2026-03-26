"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

export const PORTFOLIO_QUERY_KEY = ["portfolio"] as const

export interface DBHolding {
  coinId: string
  coinName: string
  coinSymbol: string
  amount: number
  avgBuyPrice: number
}

export interface PortfolioData {
  cashBalance: number
  holdings: DBHolding[]
}

export function usePortfolio() {
  return useQuery<PortfolioData, Error>({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/portfolio")
      if (!res.ok) throw new Error("Failed to load portfolio")
      return res.json()
    },
    staleTime: 30 * 1000, // treat as fresh for 30 s
    gcTime: 5 * 60 * 1000,
  })
}

/** Returns a function that forces a portfolio refetch — call after any trade */
export function useRefreshPortfolio() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY })
}
