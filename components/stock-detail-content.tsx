"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { fetchStockData, type StockData, calculateRSI, getTrendClassification } from "@/lib/market-data"
import { analyzeStock, type StockAnalysis } from "@/lib/analysis-engine"
import { StockChart } from "@/components/stock-chart"
import { RSIGauge } from "@/components/rsi-gauge"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface StockDetailContentProps {
  symbol: string
}

export function StockDetailContent({ symbol }: StockDetailContentProps) {
  const [stock, setStock] = useState<StockData | null>(null)
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [activeTab, setActiveTab] = useState<"chart" | "analysis" | "fundamentals">("chart")

  useEffect(() => {
    const loadStock = async () => {
      setLoading(true)
      const data = await fetchStockData(symbol)

      if (data) {
        setStock(data)
        const stockAnalysis = analyzeStock(data, "medium")
        setAnalysis(stockAnalysis)
      }

      setLoading(false)
    }

    loadStock()
  }, [symbol])

  const generateInsight = async () => {
    if (!stock || !analysis) return

    setLoadingInsight(true)
    try {
      const response = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: stock.name,
          assetType: "stock",
          analysis,
          userRiskLevel: "medium",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsight(data.insight)
      }
    } catch (error) {
      console.error("Error generating insight:", error)
    } finally {
      setLoadingInsight(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatLargeNumber = (value: number) => {
    if (value >= 10000000000000) return `₹${(value / 10000000000000).toFixed(2)} Lakh Cr`
    if (value >= 100000000000) return `₹${(value / 100000000000).toFixed(2)}K Cr`
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    return formatCurrency(value)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading stock data...</p>
      </div>
    )
  }

  if (!stock) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">Stock not found or data unavailable</p>
          <Button variant="outline" asChild>
            <Link href="/stocks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stocks
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const isPositive = stock.change >= 0
  const rsi = calculateRSI(stock.historicalData.map((d) => d.close))
  const trend = getTrendClassification(stock.price, stock.fiftyDayMA, stock.twoHundredDayMA)

  const tabs = [
    { id: "chart", label: "Chart" },
    { id: "analysis", label: "Analysis" },
    { id: "fundamentals", label: "Fundamentals" },
  ] as const

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/stocks"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Stocks</span>
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{symbol.replace(".NS", "")}</h1>
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                trend === "bullish"
                  ? "bg-success/10 text-success"
                  : trend === "bearish"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
              }`}
            >
              <span className="flex items-center gap-1">
                {trend === "bullish" && <TrendingUp className="h-3.5 w-3.5" />}
                {trend === "bearish" && <TrendingDown className="h-3.5 w-3.5" />}
                {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">{stock.name}</p>
        </div>
        <div className="lg:text-right">
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(stock.price)}</p>
          <div
            className={`flex items-center gap-1.5 mt-1 lg:justify-end ${isPositive ? "text-success" : "text-destructive"}`}
          >
            {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            <span className="text-lg font-medium">
              {isPositive ? "+" : ""}
              {formatCurrency(stock.change)}
            </span>
            <span className="text-lg">
              ({isPositive ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "chart" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Price Chart (1 Year)</h2>
            <p className="text-sm text-muted-foreground">Historical price with moving averages</p>
          </div>
          <StockChart data={stock.historicalData} ma50={stock.fiftyDayMA} ma200={stock.twoHundredDayMA} />
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">50-day MA: {formatCurrency(stock.fiftyDayMA)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-violet-500" />
              <span className="text-muted-foreground">200-day MA: {formatCurrency(stock.twoHundredDayMA)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Technical Indicators */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Technical Indicators</h2>
              <div className="flex justify-center mb-6">
                <RSIGauge value={rsi} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">50-day MA</p>
                  <p className="text-xl font-semibold">{formatCurrency(stock.fiftyDayMA)}</p>
                  <p className={`text-sm mt-1 ${stock.price > stock.fiftyDayMA ? "text-success" : "text-destructive"}`}>
                    {stock.price > stock.fiftyDayMA ? "Above" : "Below"} current price
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">200-day MA</p>
                  <p className="text-xl font-semibold">{formatCurrency(stock.twoHundredDayMA)}</p>
                  <p
                    className={`text-sm mt-1 ${stock.price > stock.twoHundredDayMA ? "text-success" : "text-destructive"}`}
                  >
                    {stock.price > stock.twoHundredDayMA ? "Above" : "Below"} current price
                  </p>
                </div>
              </div>
            </div>

            {/* Score Card */}
            {analysis && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-6">Investment Score</h2>
                <div className="mb-6 text-center">
                  <p
                    className={`text-6xl font-bold ${
                      analysis.totalScore >= 65
                        ? "text-success"
                        : analysis.totalScore >= 45
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                  >
                    {analysis.totalScore.toFixed(0)}
                  </p>
                  <p className="text-muted-foreground">out of 100</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Technical Score</span>
                      <span className="font-medium">{analysis.technicalScore.toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-chart-2 transition-all"
                        style={{ width: `${analysis.technicalScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Fundamental Score</span>
                      <span className="font-medium">{analysis.fundamentalScore.toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-chart-4 transition-all"
                        style={{ width: `${analysis.fundamentalScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    className={`rounded-xl py-3 text-center font-semibold ${
                      analysis.recommendation === "strong_buy"
                        ? "bg-success/10 text-success"
                        : analysis.recommendation === "buy"
                          ? "bg-success/10 text-success"
                          : analysis.recommendation === "hold"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {analysis.recommendation.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insight */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">AI Insight</h2>
              </div>
              <Button onClick={generateInsight} disabled={loadingInsight} variant="outline" size="sm">
                {loadingInsight ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Insight"
                )}
              </Button>
            </div>
            {aiInsight ? (
              <div className="prose prose-sm max-w-none">
                {aiInsight.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-4 last:mb-0 text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-muted/50 p-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Click &quot;Generate Insight&quot; for AI-powered analysis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "fundamentals" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-6">Fundamental Data</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
              <p className="text-xl font-semibold">{formatLargeNumber(stock.marketCap)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
              <p className="text-xl font-semibold">{stock.pe > 0 ? stock.pe.toFixed(2) : "N/A"}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">EPS</p>
              <p className="text-xl font-semibold">{stock.eps > 0 ? formatCurrency(stock.eps) : "N/A"}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Volume</p>
              <p className="text-xl font-semibold">{stock.volume.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">{"Day's Open"}</p>
              <p className="text-xl font-semibold">{formatCurrency(stock.open)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">{"Day's High"}</p>
              <p className="text-xl font-semibold">{formatCurrency(stock.high)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">{"Day's Low"}</p>
              <p className="text-xl font-semibold">{formatCurrency(stock.low)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">52W Range</p>
              <p className="text-sm font-semibold">
                {formatCurrency(Math.min(...stock.historicalData.map((d) => d.low)))} -{" "}
                {formatCurrency(Math.max(...stock.historicalData.map((d) => d.high)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
