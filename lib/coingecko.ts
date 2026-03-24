import type { Coin, CoinDetail, PricePoint } from "@/lib/types"

const BASE = "https://api.coingecko.com/api/v3"

function apiKey() {
  return process.env.NEXT_PUBLIC_COINGECKO_API ?? ""
}

async function cgFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: { "x-cg-demo-api-key": apiKey() },
    next: { revalidate: 0 }, // always fresh on server; React Query handles client caching
  })

  if (res.status === 429) throw new Error("Rate limit reached — try again shortly.")
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`)
  return res.json()
}

// ─── Raw response types ──────────────────────────────────────────────────────

export interface CGMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number | null
  sparkline_in_7d: { price: number[] } | null
}

export interface CGCoin {
  id: string
  symbol: string
  name: string
  description: { en: string }
  image: { large: string }
  market_cap_rank: number
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    total_volume: { usd: number }
    price_change_percentage_24h: number
    ath: { usd: number }
    atl: { usd: number }
    circulating_supply: number
    total_supply: number | null
    max_supply: number | null
  }
}

export interface CGMarketChart {
  prices: [number, number][]
}

// ─── Fetch functions ─────────────────────────────────────────────────────────

export async function fetchMarkets(perPage = 100): Promise<CGMarket[]> {
  return cgFetch("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h",
  })
}

export async function fetchCoinDetail(coinId: string): Promise<CGCoin> {
  return cgFetch(`/coins/${coinId}`, {
    localization: "false",
    tickers: "false",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "false",
  })
}

export async function fetchCoinChart(
  coinId: string,
  days: 7 | 30
): Promise<CGMarketChart> {
  return cgFetch(`/coins/${coinId}/market_chart`, {
    vs_currency: "usd",
    days: String(days),
    interval: "daily",
  })
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapCGMarketToCoin(m: CGMarket): Coin {
  const raw = m.sparkline_in_7d?.price ?? []
  const step = Math.max(1, Math.floor(raw.length / 8))
  const sparkline = raw
    .filter((_, i) => i % step === 0)
    .slice(0, 8)

  return {
    id: m.id,
    name: m.name,
    symbol: m.symbol.toUpperCase(),
    price: m.current_price ?? 0,
    change24h: m.price_change_percentage_24h ?? 0,
    marketCap: m.market_cap ?? 0,
    volume24h: m.total_volume ?? 0,
    rank: m.market_cap_rank ?? 0,
    sparkline,
  }
}

export function mapCGCoinToDetail(c: CGCoin): CoinDetail {
  return {
    id: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    price: c.market_data.current_price.usd,
    change24h: c.market_data.price_change_percentage_24h,
    marketCap: c.market_data.market_cap.usd,
    volume24h: c.market_data.total_volume.usd,
    rank: c.market_cap_rank,
    sparkline: [],
    description: c.description.en
      ? c.description.en.replace(/<[^>]*>/g, "").split(".").slice(0, 3).join(".") + "."
      : "",
    allTimeHigh: c.market_data.ath.usd,
    allTimeLow: c.market_data.atl.usd,
    circulatingSupply: c.market_data.circulating_supply,
    totalSupply: c.market_data.max_supply ?? c.market_data.total_supply,
    priceHistory: [],
  }
}

export function mapCGChartToPricePoints(chart: CGMarketChart): PricePoint[] {
  return chart.prices.map(([ts, price]) => ({
    date: new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: parseFloat(price.toFixed(4)),
  }))
}
