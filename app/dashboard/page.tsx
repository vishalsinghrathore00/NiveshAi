import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"
import { DashboardGuestContent } from "@/components/dashboard-guest-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <DashboardGuestContent />
      </div>
    )
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()
  const { data: watchlist } = await supabase.from("watchlist").select("*").eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardContent user={user} initialPreferences={preferences} initialWatchlist={watchlist || []} />
    </div>
  )
}
