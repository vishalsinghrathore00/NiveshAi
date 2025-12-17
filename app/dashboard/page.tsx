export const dynamic = "force-dynamic"

import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"
import { DashboardGuestContent } from "@/components/dashboard-guest-content"
import { db, userPreferences, watchlist } from "@/lib/db"
import { eq } from "drizzle-orm"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <DashboardGuestContent />
      </div>
    )
  }

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, user.id),
  })

  const userWatchlist = await db.query.watchlist.findMany({
    where: eq(watchlist.userId, user.id),
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardContent 
        user={user} 
        initialPreferences={preferences || null} 
        initialWatchlist={userWatchlist || []} 
      />
    </div>
  )
}
