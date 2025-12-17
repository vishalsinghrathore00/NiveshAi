import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"

import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { RecommendationsContent } from "@/components/recommendations-content"
import { db, userPreferences } from "@/lib/db"
import { eq } from "drizzle-orm"

export default async function RecommendationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, user.id),
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <RecommendationsContent 
        userId={user.id.toString()} 
        preferences={preferences ? {
          risk_level: preferences.riskTolerance || "moderate",
          investment_horizon: "long",
          monthly_sip_amount: parseInt(preferences.monthlyInvestment || "5000"),
        } : null} 
      />
    </div>
  )
}
