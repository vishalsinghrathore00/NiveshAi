import { NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const result = await signUp(email, password, firstName, lastName)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ user: result.user, success: true })
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
