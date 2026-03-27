"use server"

import bcrypt from "bcryptjs"
import { getSession, createSessionToken, setSessionCookie } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { Portfolio } from "@/models/Portfolio"
import { Holding } from "@/models/Holding"
import { Transaction } from "@/models/Transaction"

export interface ActionResult {
  success: boolean
  error?: string
}

// ─── Update Profile (name + email) ───────────────────────────────────────────

export async function updateProfileAction(data: {
  firstName: string
  lastName: string
  email: string
}): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  const firstName = data.firstName.trim()
  const lastName = data.lastName.trim()
  const email = data.email.trim().toLowerCase()

  if (!firstName || !lastName || !email)
    return { success: false, error: "All fields are required." }

  try {
    await connectDB()

    // Ensure email isn't taken by a different user
    const conflict = await User.findOne({ email, _id: { $ne: session.userId } })
    if (conflict) return { success: false, error: "This email is already in use." }

    await User.findByIdAndUpdate(session.userId, { firstName, lastName, email })

    // Refresh session cookie so header/dropdown show the new name immediately
    const newToken = await createSessionToken({ userId: session.userId, email, firstName })
    await setSessionCookie(newToken)

    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

// ─── Update Avatar ────────────────────────────────────────────────────────────

export async function updateAvatarAction(avatarDataUrl: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  if (!avatarDataUrl.startsWith("data:image/"))
    return { success: false, error: "Invalid image format." }

  // base64 characters ≈ 1.33× binary; 400 000 chars ≈ 300 KB
  if (avatarDataUrl.length > 400_000)
    return { success: false, error: "Image is too large. Please use a smaller photo." }

  try {
    await connectDB()
    await User.findByIdAndUpdate(session.userId, { avatarUrl: avatarDataUrl })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to save avatar." }
  }
}

// ─── Remove Avatar ────────────────────────────────────────────────────────────

export async function removeAvatarAction(): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  try {
    await connectDB()
    await User.findByIdAndUpdate(session.userId, { $unset: { avatarUrl: 1 } })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to remove avatar." }
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePasswordAction(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  if (!data.currentPassword || !data.newPassword || !data.confirmPassword)
    return { success: false, error: "All fields are required." }

  if (data.newPassword !== data.confirmPassword)
    return { success: false, error: "New passwords do not match." }

  if (data.newPassword.length < 8)
    return { success: false, error: "Password must be at least 8 characters." }

  try {
    await connectDB()
    const user = await User.findById(session.userId)
    if (!user) return { success: false, error: "User not found." }

    const valid = await bcrypt.compare(data.currentPassword, user.password)
    if (!valid) return { success: false, error: "Current password is incorrect." }

    user.password = await bcrypt.hash(data.newPassword, 12)
    await user.save()
    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

// ─── Reset Portfolio ──────────────────────────────────────────────────────────

export async function resetPortfolioAction(): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  try {
    await connectDB()

    await Portfolio.findOneAndUpdate(
      { userId: session.userId },
      { cashBalance: 10000 },
      { upsert: true }
    )
    await Holding.deleteMany({ userId: session.userId })
    await Transaction.deleteMany({ userId: session.userId })

    return { success: true }
  } catch {
    return { success: false, error: "Failed to reset portfolio." }
  }
}
