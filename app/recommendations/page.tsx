import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { RecommendationsContent } from "@/components/recommendations-content"

export default async function RecommendationsPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/auth/login")
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <RecommendationsContent userId={user.id} preferences={preferences} />
    </div>
  )
}
