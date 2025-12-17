import { cookies } from "next/headers"
import { db, users, sessions } from "@/lib/db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-for-development"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface AuthUser {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  })

  const token = jwt.sign({ sessionId, userId }, JWT_SECRET, { expiresIn: "7d" })
  
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sessionId: string; userId: number }
    
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, decoded.sessionId),
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    }
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sessionId: string }
        await db.delete(sessions).where(eq(sessions.id, decoded.sessionId))
      } catch {
        // Token invalid, just clear cookie
      }
    }

    cookieStore.delete("auth-token")
  } catch {
    // Ignore errors
  }
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<{ user: AuthUser; error?: never } | { user?: never; error: string }> {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    })

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    const passwordHash = await hashPassword(password)

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      emailVerified: true, // Skip email verification for simplicity
    }).returning()

    await createSession(newUser.id)

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profileImageUrl: newUser.profileImageUrl,
      },
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Failed to create account. Please try again." }
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; error?: never } | { user?: never; error: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    })

    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return { error: "Invalid email or password" }
    }

    await createSession(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in. Please try again." }
  }
}
