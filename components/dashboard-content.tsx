"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { POPULAR_STOCKS, fetchStockData, type StockData } from "@/lib/market-data"
import { StockCard } from "@/components/stock-card"
import { analyzeStock } from "@/lib/analysis-engine"
import { Loader2, TrendingUp, Settings, Eye, Plus, X } from "lucide-react"

interface DashboardContentProps {
  user: User
  initialPreferences: {
    risk_level: string
    investment_horizon: string
    monthly_sip_amount: number
  } | null
  initialWatchlist: { asset_id: string; asset_type: string }[]
}

export function DashboardContent({ user, initialPreferences, initialWatchlist }: DashboardContentProps) {
  const [preferences, setPreferences] = useState({
    risk_level: initialPreferences?.risk_level || "medium",
    investment_horizon: initialPreferences?.investment_horizon || "long",
    monthly_sip_amount: initialPreferences?.monthly_sip_amount || 5000,
  })
  const [saving, setSaving] = useState(false)
  const [stocksData, setStocksData] = useState<
    (StockData & { score?: number; trend?: "bullish" | "neutral" | "bearish" })[]
  >([])
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [newSymbol, setNewSymbol] = useState("")
  const [addingToWatchlist, setAddingToWatchlist] = useState(false)
  const [watchlist, setWatchlist] = useState(initialWatchlist)

  const supabase = createClient()

  useEffect(() => {
    const loadStocks = async () => {
      setLoadingStocks(true)
      const stockPromises = POPULAR_STOCKS.slice(0, 6).map((stock) => fetchStockData(stock.symbol))
      const results = await Promise.all(stockPromises)

      const validStocks = results
        .filter((s): s is StockData => s !== null)
        .map((stock) => {
          const analysis = analyzeStock(stock, preferences.risk_level as "low" | "medium" | "high")
          return { ...stock, score: analysis.totalScore, trend: analysis.trend }
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0))

      setStocksData(validStocks)
      setLoadingStocks(false)
    }

    loadStocks()
  }, [preferences.risk_level])

  const savePreferences = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        risk_level: preferences.risk_level,
        investment_horizon: preferences.investment_horizon,
        monthly_sip_amount: preferences.monthly_sip_amount,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
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

      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        asset_id: symbol,
        asset_type: "stock",
      })

      if (error) throw error
      setWatchlist([...watchlist, { asset_id: symbol, asset_type: "stock" }])
      setNewSymbol("")
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    } finally {
      setAddingToWatchlist(false)
    }
  }

  const removeFromWatchlist = async (assetId: string) => {
    try {
      const { error } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("asset_id", assetId)

      if (error) throw error
      setWatchlist(watchlist.filter((item) => item.asset_id !== assetId))
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preferences Card */}
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
                value={preferences.risk_level}
                onValueChange={(value) => setPreferences({ ...preferences, risk_level: value })}
              >
                <SelectTrigger id="risk" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Conservative</SelectItem>
                  <SelectItem value="medium">Medium - Balanced</SelectItem>
                  <SelectItem value="high">High - Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon" className="text-muted-foreground">
                Investment Horizon
              </Label>
              <Select
                value={preferences.investment_horizon}
                onValueChange={(value) => setPreferences({ ...preferences, investment_horizon: value })}
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
                  value={preferences.monthly_sip_amount}
                  onChange={(e) =>
                    setPreferences({ ...preferences, monthly_sip_amount: Number.parseInt(e.target.value) || 0 })
                  }
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

        {/* Watchlist Card */}
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
                  key={item.asset_id}
                  className="group flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium"
                >
                  <span>{item.asset_id.replace(".NS", "")}</span>
                  <button
                    onClick={() => removeFromWatchlist(item.asset_id)}
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

      {/* Top Stocks Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Top Stocks for You</h2>
            <p className="text-sm text-muted-foreground">Based on your {preferences.risk_level} risk profile</p>
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
