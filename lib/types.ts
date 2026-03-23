export interface Coin {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  rank: number
  sparkline: number[]
}

export interface Holding {
  coinId: string
  coinName: string
  coinSymbol: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
}

export interface Transaction {
  id: string
  coinId: string
  coinName: string
  coinSymbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  createdAt: string
}

export interface Portfolio {
  cashBalance: number
  totalValue: number
  totalInvested: number
  pnl: number
  pnlPercent: number
  holdings: Holding[]
}

export interface PricePoint {
  date: string
  price: number
}

export interface PortfolioPoint {
  date: string
  value: number
}

export interface CoinDetail extends Coin {
  description: string
  allTimeHigh: number
  allTimeLow: number
  circulatingSupply: number
  totalSupply: number | null
  priceHistory: PricePoint[]
}
