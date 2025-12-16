"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { POPULAR_STOCKS, fetchStockData, type StockData } from "@/lib/market-data"
import { StockCard } from "@/components/stock-card"
import { analyzeStock } from "@/lib/analysis-engine"
import { Loader2, TrendingUp, Lock, Sparkles } from "lucide-react"

export function DashboardGuestContent() {
  const [stocksData, setStocksData] = useState<
    (StockData & { score?: number; trend?: "bullish" | "neutral" | "bearish" })[]
  >([])
  const [loadingStocks, setLoadingStocks] = useState(true)

  useEffect(() => {
    const loadStocks = async () => {
      setLoadingStocks(true)
      const stockPromises = POPULAR_STOCKS.slice(0, 6).map((stock) => fetchStockData(stock.symbol))
      const results = await Promise.all(stockPromises)

      const validStocks = results
        .filter((s): s is StockData => s !== null)
        .map((stock) => {
          const analysis = analyzeStock(stock, "medium")
          return { ...stock, score: analysis.totalScore, trend: analysis.trend }
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))

      setStocksData(validStocks)
      setLoadingStocks(false)
    }

    loadStocks()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      {/* CTA Banner */}
      <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Get Personalized Recommendations</h1>
              <p className="text-muted-foreground">
                Sign up to unlock AI-powered stock picks tailored to your risk profile and investment goals.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button asChild variant="outline" className="flex-1 md:flex-none bg-transparent">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild className="flex-1 md:flex-none">
              <Link href="/auth/sign-up">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Locked Features */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-border bg-card/50 p-6 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">Sign up to customize</p>
            </div>
          </div>
          <div className="opacity-50">
            <h3 className="font-semibold mb-4">Your Investment Profile</h3>
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-6 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">Sign up to track stocks</p>
            </div>
          </div>
          <div className="opacity-50">
            <h3 className="font-semibold mb-4">Your Watchlist</h3>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-24 rounded-full bg-muted" />
              <div className="h-8 w-20 rounded-full bg-muted" />
              <div className="h-8 w-28 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Stocks Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Top Stocks Today</h2>
            <p className="text-sm text-muted-foreground">Trending stocks on NSE</p>
          </div>
        </div>

        {loadingStocks ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stocksData.map((stock) => (
              <StockCard
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                price={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                trend={stock.trend}
                score={stock.score}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
