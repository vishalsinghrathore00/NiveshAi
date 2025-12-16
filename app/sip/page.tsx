"use client"

import { Header } from "@/components/header"
import { AdvancedSIPCalculator } from "@/components/advanced-sip-calculator"
import { Calculator } from "lucide-react"

export default function SIPPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
              <Calculator className="h-5 w-5 text-chart-2" />
            </div>
            <h1 className="text-3xl font-bold">Advanced SIP Calculator</h1>
          </div>
          <p className="text-muted-foreground">Plan your wealth creation with Step-Up SIP, Goal-Based planning, and tax calculations</p>
        </div>

        <AdvancedSIPCalculator />
      </main>
    </div>
  )
}
