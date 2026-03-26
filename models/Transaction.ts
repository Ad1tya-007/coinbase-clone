import mongoose, { type Document, type Model } from "mongoose"

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId
  coinId: string
  coinName: string
  coinSymbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  stripePaymentIntentId?: string
  createdAt: Date
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coinId: { type: String, required: true },
  coinName: { type: String, required: true },
  coinSymbol: { type: String, required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
})

TransactionSchema.index({ userId: 1, createdAt: -1 })

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", TransactionSchema)
