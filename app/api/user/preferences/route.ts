import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db, userPreferences } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { riskTolerance, monthlyInvestment, investmentGoals, preferredSectors } = await request.json()

    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    })

    if (existing) {
      await db.update(userPreferences)
        .set({
          riskTolerance,
          monthlyInvestment,
          investmentGoals,
          preferredSectors,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, user.id))
    } else {
      await db.insert(userPreferences).values({
        userId: user.id,
        riskTolerance,
        monthlyInvestment,
        investmentGoals,
        preferredSectors,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
