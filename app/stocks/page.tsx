"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { StockCard } from "@/components/stock-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POPULAR_STOCKS, STOCK_SECTORS, fetchStockData, type StockData } from "@/lib/market-data"
import { analyzeStock } from "@/lib/analysis-engine"
import { Loader2, Search, TrendingUp, Filter } from "lucide-react"

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState("All")
  const [stocksData, setStocksData] = useState<
    (StockData & { score?: number; trend?: "bullish" | "neutral" | "bearish"; sector?: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true)
      const stockPromises = POPULAR_STOCKS.map((stock) => 
        fetchStockData(stock.symbol).then(data => ({ data, sector: stock.sector }))
      )
      const results = await Promise.all(stockPromises)

      const validStocks = results
        .filter((r): r is { data: StockData; sector: string } => r.data !== null)
        .map(({ data, sector }) => {
          const analysis = analyzeStock(data, "medium")
          return { ...data, score: analysis.totalScore, trend: analysis.trend, sector }
        })

      setStocksData(validStocks)
      setLoading(false)
    }

    loadStocks()
  }, [])

  const filteredStocks = useMemo(() => {
    if (selectedSector === "All") return stocksData
    return stocksData.filter(stock => stock.sector === selectedSector)
  }, [stocksData, selectedSector])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    const symbol = searchQuery.toUpperCase().includes(".NS")
      ? searchQuery.toUpperCase()
      : `${searchQuery.toUpperCase()}.NS`

    const result = await fetchStockData(symbol)

    if (result) {
      const analysis = analyzeStock(result, "medium")
      const stockWithAnalysis = { ...result, score: analysis.totalScore, trend: analysis.trend, sector: "Other" }

      setStocksData((prev) => {
        const exists = prev.some((s) => s.symbol === result.symbol)
        if (exists) return prev
        return [stockWithAnalysis, ...prev]
      })
    }

    setSearching(false)
    setSearchQuery("")
  }

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = { All: stocksData.length }
    stocksData.forEach(stock => {
      if (stock.sector) {
        counts[stock.sector] = (counts[stock.sector] || 0) + 1
      }
    })
    return counts
  }, [stocksData])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Indian Stocks</h1>
          </div>
          <p className="text-muted-foreground">Explore and analyze {loading ? "40+" : stocksData.length} NSE listed stocks with real-time data</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[180px] h-11">
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector} {sectorCounts[sector] ? `(${sectorCounts[sector]})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSector !== "All" && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing {filteredStocks.length} stocks in</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{selectedSector}</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSector("All")} className="text-muted-foreground hover:text-foreground">
              Clear filter
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStocks.map((stock) => (
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
