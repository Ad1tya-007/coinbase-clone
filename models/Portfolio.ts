import mongoose, { type Document, type Model } from "mongoose"

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId
  cashBalance: number
}

const PortfolioSchema = new mongoose.Schema<IPortfolio>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cashBalance: { type: Number, default: 10000 },
})

export const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio ?? mongoose.model<IPortfolio>("Portfolio", PortfolioSchema)
