import mongoose, { type Document, type Model } from "mongoose"

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  createdAt: Date
}

const UserSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)
