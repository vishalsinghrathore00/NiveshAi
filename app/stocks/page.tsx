"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { StockCard } from "@/components/stock-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { POPULAR_STOCKS, fetchStockData, type StockData } from "@/lib/market-data"
import { analyzeStock } from "@/lib/analysis-engine"
import { Loader2, Search, TrendingUp } from "lucide-react"

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stocksData, setStocksData] = useState<
    (StockData & { score?: number; trend?: "bullish" | "neutral" | "bearish" })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true)
      const stockPromises = POPULAR_STOCKS.map((stock) => fetchStockData(stock.symbol))
      const results = await Promise.all(stockPromises)

      const validStocks = results
        .filter((s): s is StockData => s !== null)
        .map((stock) => {
          const analysis = analyzeStock(stock, "medium")
          return { ...stock, score: analysis.totalScore, trend: analysis.trend }
        })

      setStocksData(validStocks)
      setLoading(false)
    }

    loadStocks()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    const symbol = searchQuery.toUpperCase().includes(".NS")
      ? searchQuery.toUpperCase()
      : `${searchQuery.toUpperCase()}.NS`

    const result = await fetchStockData(symbol)

    if (result) {
      const analysis = analyzeStock(result, "medium")
      const stockWithAnalysis = { ...result, score: analysis.totalScore, trend: analysis.trend }

      setStocksData((prev) => {
        const exists = prev.some((s) => s.symbol === result.symbol)
        if (exists) return prev
        return [stockWithAnalysis, ...prev]
      })
    }

    setSearching(false)
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Indian Stocks</h1>
          </div>
          <p className="text-muted-foreground">Explore and analyze NSE listed stocks with real-time data</p>
        </div>

        {/* Search */}
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by symbol (e.g., RELIANCE, TCS)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-11 h-11"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching} className="h-11 px-6">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Stocks Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </main>
    </div>
  )
}
