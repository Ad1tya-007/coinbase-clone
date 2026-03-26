import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getSession } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { amountUsd, coinName, coinId } = body as {
    amountUsd: number
    coinName: string
    coinId: string
  }

  if (!amountUsd || amountUsd < 1) {
    return NextResponse.json({ error: "Minimum trade amount is $1" }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100), // Stripe works in cents
    currency: "usd",
    description: `Buy ${coinName} — Coinbase Demo`,
    metadata: {
      userId: session.userId,
      userEmail: session.email,
      coinId,
      coinName,
    },
    // Automatically confirm once payment method is attached (for Elements)
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
