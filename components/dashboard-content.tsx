"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { POPULAR_STOCKS, fetchStockData, type StockData } from "@/lib/market-data"
import { StockCard } from "@/components/stock-card"
import { analyzeStock } from "@/lib/analysis-engine"
import { Loader2, TrendingUp, Settings, Eye, Plus, X } from "lucide-react"

interface AuthUser {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
}

interface UserPreferences {
  id: number
  userId: number
  riskTolerance: string | null
  investmentGoals: string[] | null
  preferredSectors: string[] | null
  monthlyInvestment: string | null
}

interface WatchlistItem {
  id: number
  userId: number
  symbol: string
  name: string | null
}

interface DashboardContentProps {
  user: AuthUser
  initialPreferences: UserPreferences | null
  initialWatchlist: WatchlistItem[]
}

export function DashboardContent({ user, initialPreferences, initialWatchlist }: DashboardContentProps) {
  const [preferences, setPreferences] = useState({
    riskTolerance: initialPreferences?.riskTolerance || "moderate",
    investmentHorizon: "long",
    monthlyInvestment: initialPreferences?.monthlyInvestment || "5000",
  })
  const [saving, setSaving] = useState(false)
  const [stocksData, setStocksData] = useState<
    (StockData & { score?: number; trend?: "bullish" | "neutral" | "bearish" })[]
  >([])
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [newSymbol, setNewSymbol] = useState("")
  const [addingToWatchlist, setAddingToWatchlist] = useState(false)
  const [watchlist, setWatchlist] = useState(initialWatchlist)

  useEffect(() => {
    const loadStocks = async () => {
      setLoadingStocks(true)
      const stockPromises = POPULAR_STOCKS.slice(0, 6).map((stock) => fetchStockData(stock.symbol))
      const results = await Promise.all(stockPromises)

      const riskLevel = preferences.riskTolerance === "conservative" ? "low" : 
                        preferences.riskTolerance === "aggressive" ? "high" : "medium"

      const validStocks = results
        .filter((s): s is StockData => s !== null)
        .map((stock) => {
          const analysis = analyzeStock(stock, riskLevel as "low" | "medium" | "high")
          return { ...stock, score: analysis.totalScore, trend: analysis.trend }
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))

      setStocksData(validStocks)
      setLoadingStocks(false)
    }

    loadStocks()
  }, [preferences.riskTolerance])

  const savePreferences = async () => {
    setSaving(true)
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskTolerance: preferences.riskTolerance,
          monthlyInvestment: preferences.monthlyInvestment,
        }),
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setSaving(false)
    }
  }

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return

    setAddingToWatchlist(true)
    try {
      const symbol = newSymbol.toUpperCase().includes(".NS") ? newSymbol.toUpperCase() : `${newSymbol.toUpperCase()}.NS`

      const response = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlist([...watchlist, data.item])
        setNewSymbol("")
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    } finally {
      setAddingToWatchlist(false)
    }
  }

  const removeFromWatchlist = async (id: number) => {
    try {
      await fetch(`/api/user/watchlist?id=${id}`, { method: "DELETE" })
      setWatchlist(watchlist.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  const displayName = user.firstName || user.email.split("@")[0]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10">
              <Settings className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <h2 className="font-semibold">Your Profile</h2>
              <p className="text-sm text-muted-foreground">Investment preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="risk" className="text-muted-foreground">
                Risk Tolerance
              </Label>
              <Select
                value={preferences.riskTolerance}
                onValueChange={(value) => setPreferences({ ...preferences, riskTolerance: value })}
              >
                <SelectTrigger id="risk" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon" className="text-muted-foreground">
                Investment Horizon
              </Label>
              <Select
                value={preferences.investmentHorizon}
                onValueChange={(value) => setPreferences({ ...preferences, investmentHorizon: value })}
              >
                <SelectTrigger id="horizon" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short Term (1-3 years)</SelectItem>
                  <SelectItem value="long">Long Term (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sip" className="text-muted-foreground">
                Monthly SIP Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="sip"
                  type="number"
                  value={preferences.monthlyInvestment}
                  onChange={(e) => setPreferences({ ...preferences, monthlyInvestment: e.target.value })}
                  className="h-11 pl-8"
                />
              </div>
            </div>

            <Button onClick={savePreferences} disabled={saving} className="w-full h-11 mt-2">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10">
              <Eye className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold">Watchlist</h2>
              <p className="text-sm text-muted-foreground">Track your favorite stocks</p>
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Enter stock symbol (e.g., RELIANCE)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
              className="h-11"
            />
            <Button onClick={addToWatchlist} disabled={addingToWatchlist} className="h-11 px-4">
              {addingToWatchlist ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {watchlist.length === 0 ? (
            <div className="rounded-xl bg-muted/50 p-8 text-center">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Your watchlist is empty. Add stocks to track them here.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium"
                >
                  <span>{item.symbol.replace(".NS", "")}</span>
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Top Stocks for You</h2>
            <p className="text-sm text-muted-foreground">Based on your {preferences.riskTolerance} risk profile</p>
          </div>
        </div>

        {loadingStocks ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing stocks...</p>
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
