import type { Coin, CoinDetail, Portfolio, Transaction, PortfolioPoint } from "./types"

export const MOCK_COINS: Coin[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 67234.5,
    change24h: 2.34,
    marketCap: 1_320_000_000_000,
    volume24h: 28_400_000_000,
    rank: 1,
    sparkline: [62000, 63400, 61800, 64200, 65100, 64800, 66300, 67234],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 3521.2,
    change24h: -1.12,
    marketCap: 423_000_000_000,
    volume24h: 15_200_000_000,
    rank: 2,
    sparkline: [3700, 3620, 3580, 3650, 3490, 3510, 3560, 3521],
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    price: 412.3,
    change24h: 0.87,
    marketCap: 63_000_000_000,
    volume24h: 1_200_000_000,
    rank: 3,
    sparkline: [395, 402, 398, 405, 408, 410, 411, 412],
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 178.45,
    change24h: 5.23,
    marketCap: 82_000_000_000,
    volume24h: 4_100_000_000,
    rank: 4,
    sparkline: [155, 158, 162, 165, 161, 168, 172, 178],
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    price: 0.6142,
    change24h: -0.45,
    marketCap: 34_800_000_000,
    volume24h: 1_450_000_000,
    rank: 5,
    sparkline: [0.62, 0.618, 0.615, 0.622, 0.610, 0.617, 0.612, 0.614],
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.5218,
    change24h: 1.23,
    marketCap: 18_300_000_000,
    volume24h: 620_000_000,
    rank: 6,
    sparkline: [0.505, 0.510, 0.508, 0.515, 0.518, 0.520, 0.521, 0.522],
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    price: 38.9,
    change24h: -2.11,
    marketCap: 16_100_000_000,
    volume24h: 780_000_000,
    rank: 7,
    sparkline: [42, 41, 40.5, 40.8, 39.5, 39.2, 39.0, 38.9],
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    price: 0.8934,
    change24h: 3.45,
    marketCap: 8_200_000_000,
    volume24h: 480_000_000,
    rank: 8,
    sparkline: [0.820, 0.835, 0.845, 0.840, 0.855, 0.870, 0.885, 0.893],
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    price: 14.82,
    change24h: 1.67,
    marketCap: 9_100_000_000,
    volume24h: 520_000_000,
    rank: 9,
    sparkline: [13.8, 14.0, 14.2, 14.1, 14.4, 14.6, 14.7, 14.82],
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    price: 9.41,
    change24h: -0.82,
    marketCap: 7_100_000_000,
    volume24h: 320_000_000,
    rank: 10,
    sparkline: [9.6, 9.55, 9.5, 9.48, 9.45, 9.43, 9.42, 9.41],
  },
]

function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility: number
): Array<{ date: string; price: number }> {
  const history = []
  let price = basePrice * (1 - volatility * days * 0.015)
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const change = (Math.sin(i * 1.3) * volatility + Math.cos(i * 0.7) * volatility * 0.5) * price * 0.03
    price = Math.max(price + change, basePrice * 0.5)
    history.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    })
  }
  // Ensure last data point matches current price
  if (history.length > 0) {
    history[history.length - 1].price = basePrice
  }
  return history
}

export const MOCK_COIN_DETAILS: Record<string, CoinDetail> = {
  bitcoin: {
    ...MOCK_COINS[0],
    description:
      "Bitcoin is the first decentralized cryptocurrency, created in 2009 by an anonymous entity known as Satoshi Nakamoto. It operates on a peer-to-peer network using blockchain technology.",
    allTimeHigh: 73_750,
    allTimeLow: 0.06,
    circulatingSupply: 19_650_000,
    totalSupply: 21_000_000,
    priceHistory: generatePriceHistory(67234.5, 30, 1.2),
  },
  ethereum: {
    ...MOCK_COINS[1],
    description:
      "Ethereum is a decentralized, open-source blockchain with smart contract functionality. ETH is the native cryptocurrency that powers the Ethereum ecosystem.",
    allTimeHigh: 4_891.7,
    allTimeLow: 0.43,
    circulatingSupply: 120_250_000,
    totalSupply: null,
    priceHistory: generatePriceHistory(3521.2, 30, 1.4),
  },
  solana: {
    ...MOCK_COINS[3],
    description:
      "Solana is a high-performance blockchain supporting builders around the world creating crypto apps. It's known for its fast transaction speeds and low fees.",
    allTimeHigh: 259.96,
    allTimeLow: 0.5,
    circulatingSupply: 459_500_000,
    totalSupply: null,
    priceHistory: generatePriceHistory(178.45, 30, 1.8),
  },
}

export const MOCK_PORTFOLIO: Portfolio = {
  cashBalance: 5_432.5,
  totalValue: 20_571.44,
  totalInvested: 18_000,
  pnl: 2_571.44,
  pnlPercent: 14.29,
  holdings: [
    {
      coinId: "bitcoin",
      coinName: "Bitcoin",
      coinSymbol: "BTC",
      amount: 0.12,
      avgBuyPrice: 58_000,
      currentPrice: 67234.5,
      value: 8_068.14,
      pnl: 1_108.14,
      pnlPercent: 15.93,
    },
    {
      coinId: "ethereum",
      coinName: "Ethereum",
      coinSymbol: "ETH",
      amount: 1.5,
      avgBuyPrice: 3_100,
      currentPrice: 3521.2,
      value: 5_281.8,
      pnl: 631.8,
      pnlPercent: 13.61,
    },
    {
      coinId: "solana",
      coinName: "Solana",
      coinSymbol: "SOL",
      amount: 10,
      avgBuyPrice: 152.0,
      currentPrice: 178.45,
      value: 1_789.0,
      pnl: 264.5,
      pnlPercent: 17.40,
    },
  ],
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx1",
    coinId: "bitcoin",
    coinName: "Bitcoin",
    coinSymbol: "BTC",
    type: "buy",
    amount: 0.05,
    price: 64200,
    total: 3210,
    createdAt: "2026-03-20T14:32:00Z",
  },
  {
    id: "tx2",
    coinId: "ethereum",
    coinName: "Ethereum",
    coinSymbol: "ETH",
    type: "buy",
    amount: 0.5,
    price: 3380,
    total: 1690,
    createdAt: "2026-03-18T09:15:00Z",
  },
  {
    id: "tx3",
    coinId: "solana",
    coinName: "Solana",
    coinSymbol: "SOL",
    type: "buy",
    amount: 5,
    price: 165.2,
    total: 826,
    createdAt: "2026-03-15T11:45:00Z",
  },
  {
    id: "tx4",
    coinId: "bitcoin",
    coinName: "Bitcoin",
    coinSymbol: "BTC",
    type: "buy",
    amount: 0.07,
    price: 61800,
    total: 4326,
    createdAt: "2026-03-10T16:20:00Z",
  },
  {
    id: "tx5",
    coinId: "ethereum",
    coinName: "Ethereum",
    coinSymbol: "ETH",
    type: "sell",
    amount: 0.3,
    price: 3620,
    total: 1086,
    createdAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "tx6",
    coinId: "solana",
    coinName: "Solana",
    coinSymbol: "SOL",
    type: "buy",
    amount: 5,
    price: 138.8,
    total: 694,
    createdAt: "2026-03-05T13:30:00Z",
  },
  {
    id: "tx7",
    coinId: "ethereum",
    coinName: "Ethereum",
    coinSymbol: "ETH",
    type: "buy",
    amount: 1.3,
    price: 3050,
    total: 3965,
    createdAt: "2026-02-28T08:45:00Z",
  },
  {
    id: "tx8",
    coinId: "bitcoin",
    coinName: "Bitcoin",
    coinSymbol: "BTC",
    type: "buy",
    amount: 0.1,
    price: 59200,
    total: 5920,
    createdAt: "2026-02-20T12:00:00Z",
  },
]

export const MOCK_PORTFOLIO_HISTORY: PortfolioPoint[] = [
  { date: "Feb 21", value: 12000 },
  { date: "Feb 23", value: 12450 },
  { date: "Feb 25", value: 11980 },
  { date: "Feb 27", value: 13200 },
  { date: "Mar 01", value: 14100 },
  { date: "Mar 03", value: 13650 },
  { date: "Mar 05", value: 14820 },
  { date: "Mar 07", value: 15340 },
  { date: "Mar 09", value: 14900 },
  { date: "Mar 11", value: 16200 },
  { date: "Mar 13", value: 17100 },
  { date: "Mar 15", value: 16800 },
  { date: "Mar 17", value: 18200 },
  { date: "Mar 19", value: 19100 },
  { date: "Mar 21", value: 20571 },
]
