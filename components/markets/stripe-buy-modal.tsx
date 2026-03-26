"use client"

import { useState, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { executeBuyAction } from "@/actions/trade"

// Initialise Stripe outside of component to avoid re-creating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BuyOrderDetails {
  coinId: string
  coinName: string
  coinSymbol: string
  usdAmount: number
  pricePerCoin: number
  coinAmount: number
}

interface StripeBuyModalProps {
  open: boolean
  onClose: () => void
  order: BuyOrderDetails
  clientSecret: string
  onSuccess: (newCashBalance: number) => void
}

// ─── Inner form (has access to useStripe / useElements) ─────────────────────

function PaymentForm({
  order,
  onClose,
  onSuccess,
}: {
  order: BuyOrderDetails
  onClose: () => void
  onSuccess: (newCashBalance: number) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setError(null)

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // fallback for redirect-based methods
      },
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.")
      setIsSubmitting(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      // Execute the actual trade in our database
      const result = await executeBuyAction({
        coinId: order.coinId,
        coinName: order.coinName,
        coinSymbol: order.coinSymbol,
        usdAmount: order.usdAmount,
        pricePerCoin: order.pricePerCoin,
        stripePaymentIntentId: paymentIntent.id,
      })

      if (!result.success) {
        setError(result.error ?? "Trade execution failed.")
        setIsSubmitting(false)
        return
      }

      setSucceeded(true)
      setTimeout(() => {
        onSuccess(result.cashBalance ?? 0)
        onClose()
      }, 1800)
    } else {
      setError("Payment was not completed. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Purchase Successful!</p>
          <p className="text-sm text-muted-foreground mt-1">
            You bought {order.coinAmount.toFixed(8)} {order.coinSymbol}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <div className="rounded-lg bg-muted/40 border p-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">You&apos;re buying</span>
          <span className="font-semibold">{order.coinAmount.toFixed(8)} {order.coinSymbol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price per coin</span>
          <span>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.pricePerCoin)}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total charged</span>
          <span>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.usdAmount)}
          </span>
        </div>
      </div>

      {/* Test card notice */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs space-y-1">
          <p className="font-semibold">Test mode — no real money is charged</p>
          <p>Use test card: <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">4242 4242 4242 4242</code></p>
          <p>Expiry: any future date &nbsp;·&nbsp; CVC: any 3 digits &nbsp;·&nbsp; ZIP: any 5 digits</p>
        </AlertDescription>
      </Alert>

      {/* Stripe Elements */}
      <div>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || !stripe || !elements}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Pay &amp; Buy {order.coinSymbol}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3 w-3" />
        Secured by Stripe · Test environment
      </p>
    </form>
  )
}

// ─── Outer modal (wraps with Stripe Elements provider) ──────────────────────

export function StripeBuyModal({
  open,
  onClose,
  order,
  clientSecret,
  onSuccess,
}: StripeBuyModalProps) {
  const appearance = {
    theme: "stripe" as const,
    variables: {
      borderRadius: "8px",
      fontSizeBase: "14px",
    },
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {order.coinSymbol.slice(0, 2)}
              </span>
            </div>
            Buy {order.coinName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">Demo trading</Badge>
            Simulated purchase · Your test card won&apos;t be charged real funds
          </DialogDescription>
        </DialogHeader>

        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance }}
        >
          <PaymentForm order={order} onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}
