"use server"

import { getSession } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Portfolio } from "@/models/Portfolio"
import { Holding } from "@/models/Holding"
import { Transaction } from "@/models/Transaction"

export interface TradeResult {
  success: boolean
  error?: string
  cashBalance?: number
}

// ─── Buy ─────────────────────────────────────────────────────────────────────

export interface BuyInput {
  coinId: string
  coinName: string
  coinSymbol: string
  /** USD amount the user is spending */
  usdAmount: number
  /** Current price per coin (from CoinGecko at time of trade) */
  pricePerCoin: number
  /** Stripe PaymentIntent ID confirming payment was collected */
  stripePaymentIntentId: string
}

export async function executeBuyAction(input: BuyInput): Promise<TradeResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  if (input.usdAmount <= 0) return { success: false, error: "Invalid amount" }
  if (input.pricePerCoin <= 0) return { success: false, error: "Invalid price" }

  const coinAmount = input.usdAmount / input.pricePerCoin

  try {
    await connectDB()

    // Get or lazily create portfolio with $10,000 starting balance
    let portfolio = await Portfolio.findOne({ userId: session.userId })
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: session.userId, cashBalance: 10000 })
    }

    if (portfolio.cashBalance < input.usdAmount) {
      return { success: false, error: "Insufficient cash balance" }
    }

    // Deduct cash
    portfolio.cashBalance = parseFloat((portfolio.cashBalance - input.usdAmount).toFixed(8))
    await portfolio.save()

    // Update or create holding with weighted-average buy price
    const existing = await Holding.findOne({ userId: session.userId, coinId: input.coinId })
    if (existing) {
      const totalCost = existing.amount * existing.avgBuyPrice + coinAmount * input.pricePerCoin
      existing.amount = parseFloat((existing.amount + coinAmount).toFixed(8))
      existing.avgBuyPrice = totalCost / existing.amount
      await existing.save()
    } else {
      await Holding.create({
        userId: session.userId,
        coinId: input.coinId,
        coinName: input.coinName,
        coinSymbol: input.coinSymbol,
        amount: coinAmount,
        avgBuyPrice: input.pricePerCoin,
      })
    }

    // Record the transaction
    await Transaction.create({
      userId: session.userId,
      coinId: input.coinId,
      coinName: input.coinName,
      coinSymbol: input.coinSymbol,
      type: "buy",
      amount: coinAmount,
      price: input.pricePerCoin,
      total: input.usdAmount,
      stripePaymentIntentId: input.stripePaymentIntentId,
    })

    return { success: true, cashBalance: portfolio.cashBalance }
  } catch (err) {
    console.error("[executeBuyAction]", err)
    return { success: false, error: "Trade failed. Please try again." }
  }
}

// ─── Sell ────────────────────────────────────────────────────────────────────

export interface SellInput {
  coinId: string
  coinName: string
  coinSymbol: string
  /** Coin units to sell */
  coinAmount: number
  /** Current price per coin (from CoinGecko at time of trade) */
  pricePerCoin: number
}

export async function executeSellAction(input: SellInput): Promise<TradeResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  if (input.coinAmount <= 0) return { success: false, error: "Invalid amount" }
  if (input.pricePerCoin <= 0) return { success: false, error: "Invalid price" }

  const usdAmount = input.coinAmount * input.pricePerCoin

  try {
    await connectDB()

    const holding = await Holding.findOne({ userId: session.userId, coinId: input.coinId })
    if (!holding || holding.amount < input.coinAmount) {
      return { success: false, error: "Insufficient holdings" }
    }

    // Reduce holding (delete if emptied)
    holding.amount = parseFloat((holding.amount - input.coinAmount).toFixed(8))
    if (holding.amount <= 0.000000001) {
      await holding.deleteOne()
    } else {
      await holding.save()
    }

    // Credit cash balance
    let portfolio = await Portfolio.findOne({ userId: session.userId })
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: session.userId, cashBalance: 10000 })
    }
    portfolio.cashBalance = parseFloat((portfolio.cashBalance + usdAmount).toFixed(8))
    await portfolio.save()

    // Record the transaction
    await Transaction.create({
      userId: session.userId,
      coinId: input.coinId,
      coinName: input.coinName,
      coinSymbol: input.coinSymbol,
      type: "sell",
      amount: input.coinAmount,
      price: input.pricePerCoin,
      total: usdAmount,
    })

    return { success: true, cashBalance: portfolio.cashBalance }
  } catch (err) {
    console.error("[executeSellAction]", err)
    return { success: false, error: "Trade failed. Please try again." }
  }
}
