import mongoose, { type Document, type Model } from "mongoose"

export interface IHolding extends Document {
  userId: mongoose.Types.ObjectId
  coinId: string
  coinName: string
  coinSymbol: string
  amount: number
  avgBuyPrice: number
}

const HoldingSchema = new mongoose.Schema<IHolding>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coinId: { type: String, required: true },
  coinName: { type: String, required: true },
  coinSymbol: { type: String, required: true },
  amount: { type: Number, default: 0 },
  avgBuyPrice: { type: Number, default: 0 },
})

HoldingSchema.index({ userId: 1, coinId: 1 }, { unique: true })

export const Holding: Model<IHolding> =
  mongoose.models.Holding ?? mongoose.model<IHolding>("Holding", HoldingSchema)
