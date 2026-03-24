"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth"

export interface AuthState {
  error: string
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  try {
    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return { error: "Invalid email or password." }
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return { error: "Invalid email or password." }
    }

    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
    })

    await setSessionCookie(token)
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/dashboard")
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const firstName = (formData.get("firstName") as string)?.trim()
  const lastName = (formData.get("lastName") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  try {
    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return { error: "An account with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    const token = await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
    })

    await setSessionCookie(token)
  } catch {
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/dashboard")
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect("/login")
}
