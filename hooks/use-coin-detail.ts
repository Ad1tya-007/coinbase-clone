"use client"

import { useQuery } from "@tanstack/react-query"
import {
  fetchCoinDetail,
  fetchCoinChart,
  mapCGCoinToDetail,
  mapCGChartToPricePoints,
} from "@/lib/coingecko"
import type { CoinDetail, PricePoint } from "@/lib/types"

export function useCoinDetail(coinId: string) {
  return useQuery<CoinDetail, Error>({
    queryKey: ["coin", coinId],
    queryFn: async () => {
      const data = await fetchCoinDetail(coinId)
      return mapCGCoinToDetail(data)
    },
    enabled: !!coinId,
  })
}

export function useCoinChart(coinId: string, days: 7 | 30) {
  return useQuery<PricePoint[], Error>({
    queryKey: ["coin-chart", coinId, days],
    queryFn: async () => {
      const data = await fetchCoinChart(coinId, days)
      return mapCGChartToPricePoints(data)
    },
    enabled: !!coinId,
  })
}
