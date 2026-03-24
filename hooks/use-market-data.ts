"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarkets, mapCGMarketToCoin } from "@/lib/coingecko"
import type { Coin } from "@/lib/types"

export const MARKET_QUERY_KEY = ["markets"] as const

export function useMarketData() {
  return useQuery<Coin[], Error>({
    queryKey: MARKET_QUERY_KEY,
    queryFn: async () => {
      const data = await fetchMarkets(100)
      return data.map(mapCGMarketToCoin)
    },
  })
}
