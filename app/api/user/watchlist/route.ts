import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db, watchlist } from "@/lib/db"
import { eq, and } from "drizzle-orm"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await db.query.watchlist.findMany({
      where: eq(watchlist.userId, user.id),
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Get watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symbol, name } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const [item] = await db.insert(watchlist).values({
      userId: user.id,
      symbol,
      name: name || null,
    }).returning()

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Add to watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await db.delete(watchlist)
      .where(and(
        eq(watchlist.id, parseInt(id)),
        eq(watchlist.userId, user.id)
      ))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
