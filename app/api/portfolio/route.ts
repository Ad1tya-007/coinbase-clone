import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Portfolio } from "@/models/Portfolio"
import { Holding } from "@/models/Holding"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()

  let portfolio = await Portfolio.findOne({ userId: session.userId }).lean()
  if (!portfolio) {
    const created = await Portfolio.create({ userId: session.userId, cashBalance: 10000 })
    portfolio = created.toObject()
  }

  const holdings = await Holding.find({ userId: session.userId, amount: { $gt: 0 } }).lean()

  return NextResponse.json({
    cashBalance: portfolio.cashBalance,
    holdings: holdings.map((h) => ({
      coinId: h.coinId,
      coinName: h.coinName,
      coinSymbol: h.coinSymbol,
      amount: h.amount,
      avgBuyPrice: h.avgBuyPrice,
    })),
  })
}
