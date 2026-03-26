import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Transaction } from "@/models/Transaction"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()

  const txs = await Transaction.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(
    txs.map((tx) => ({
      id: tx._id.toString(),
      coinId: tx.coinId,
      coinName: tx.coinName,
      coinSymbol: tx.coinSymbol,
      type: tx.type,
      amount: tx.amount,
      price: tx.price,
      total: tx.total,
      createdAt: tx.createdAt.toISOString(),
    }))
  )
}
