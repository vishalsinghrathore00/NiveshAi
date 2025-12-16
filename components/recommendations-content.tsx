"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  POPULAR_STOCKS,
  POPULAR_FUNDS,
  fetchStockData,
  fetchMutualFundData,
  type StockData,
  type MutualFundData,
} from "@/lib/market-data"
import { analyzeStock, analyzeFund, type StockAnalysis, type FundAnalysis } from "@/lib/analysis-engine"
import { Loader2, Sparkles, BarChart3, PiggyBank, AlertCircle, ArrowRight } from "lucide-react"

interface RecommendationsContentProps {
  userId: string
  preferences: {
    risk_level: string
    investment_horizon: string
    monthly_sip_amount: number
  } | null
}

interface StockRecommendation extends StockData {
  analysis: StockAnalysis
}

interface FundRecommendation extends MutualFundData {
  analysis: FundAnalysis
}

export function RecommendationsContent({ preferences }: RecommendationsContentProps) {
  const [stockRecommendations, setStockRecommendations] = useState<StockRecommendation[]>([])
  const [fundRecommendations, setFundRecommendations] = useState<FundRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({})
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null)

  const riskLevel = (preferences?.risk_level || "medium") as "low" | "medium" | "high"

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true)

      const stockPromises = POPULAR_STOCKS.map((stock) => fetchStockData(stock.symbol))
      const stockResults = await Promise.all(stockPromises)

      const stockRecs = stockResults
        .filter((s): s is StockData => s !== null)
        .map((stock) => {
          const analysis = analyzeStock(stock, riskLevel)
          return { ...stock, analysis }
        })
        .sort((a, b) => b.analysis.totalScore - a.analysis.totalScore)
        .slice(0, 5)

      setStockRecommendations(stockRecs)

      const fundPromises = POPULAR_FUNDS.map((fund) => fetchMutualFundData(fund.code))
      const fundResults = await Promise.all(fundPromises)

      const fundRecs = fundResults
        .filter((f): f is MutualFundData => f !== null)
        .map((fund) => {
          const analysis = analyzeFund(fund)
          return { ...fund, analysis }
        })
        .sort((a, b) => b.analysis.totalScore - a.analysis.totalScore)
        .slice(0, 5)

      setFundRecommendations(fundRecs)
      setLoading(false)
    }

    loadRecommendations()
  }, [riskLevel])

  const generateInsight = async (
    id: string,
    name: string,
    type: "stock" | "fund",
    analysis: StockAnalysis | FundAnalysis,
  ) => {
    setLoadingInsight(id)
    try {
      const response = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: name,
          assetType: type,
          analysis,
          userRiskLevel: riskLevel,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsights((prev) => ({ ...prev, [id]: data.insight }))
      }
    } catch (error) {
      console.error("Error generating insight:", error)
    } finally {
      setLoadingInsight(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getScoreColor = (score: number) => {
    if (score >= 65) return "text-success"
    if (score >= 45) return "text-warning"
    return "text-destructive"
  }

  const getRecommendationStyle = (rec: string) => {
    if (rec === "strong_buy" || rec === "buy") return "bg-success/10 text-success"
    if (rec === "hold") return "bg-warning/10 text-warning"
    return "bg-destructive/10 text-destructive"
  }

  if (!preferences) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-lg mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Set Your Preferences First</h2>
          <p className="text-muted-foreground mb-6">
            Please set your risk profile and investment preferences to get personalized recommendations.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
            <Sparkles className="h-5 w-5 text-chart-3" />
          </div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
        </div>
        <p className="text-muted-foreground">
          Personalized suggestions based on your <span className="text-foreground font-medium">{riskLevel}</span> risk
          profile
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing investments for you...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Stock Recommendations */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Top Stock Picks</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stockRecommendations.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="relative rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>

                  <Link href={`/stocks/${encodeURIComponent(stock.symbol)}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors">
                      {stock.symbol.replace(".NS", "")}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 truncate">{stock.name}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(stock.analysis.totalScore)}`}>
                        {stock.analysis.totalScore.toFixed(0)}
                      </p>
                      <div
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getRecommendationStyle(stock.analysis.recommendation)}`}
                      >
                        {stock.analysis.recommendation.replace("_", " ").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {aiInsights[stock.symbol] ? (
                    <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                      <p className="line-clamp-3">{aiInsights[stock.symbol]}</p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => generateInsight(stock.symbol, stock.name, "stock", stock.analysis)}
                      disabled={loadingInsight === stock.symbol}
                    >
                      {loadingInsight === stock.symbol ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get AI Insight
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Fund Recommendations */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <PiggyBank className="h-5 w-5 text-chart-2" />
              <h2 className="text-xl font-bold">Top SIP Picks</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fundRecommendations.map((fund, index) => (
                <div
                  key={fund.schemeCode}
                  className="relative rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-chart-2 text-xs font-bold text-chart-2-foreground">
                    {index + 1}
                  </div>

                  <h3 className="font-semibold line-clamp-2 mb-1">{fund.schemeName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">NAV: {formatCurrency(fund.nav)}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">1Y</p>
                      <p className={`font-semibold ${(fund.cagr1Y || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                        {fund.cagr1Y?.toFixed(1) || "N/A"}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">3Y</p>
                      <p className={`font-semibold ${(fund.cagr3Y || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                        {fund.cagr3Y?.toFixed(1) || "N/A"}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">5Y</p>
                      <p className={`font-semibold ${(fund.cagr5Y || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                        {fund.cagr5Y?.toFixed(1) || "N/A"}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(fund.analysis.totalScore)}`}>
                        {fund.analysis.totalScore.toFixed(0)}
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getRecommendationStyle(fund.analysis.recommendation)}`}
                    >
                      {fund.analysis.recommendation.replace("_", " ").toUpperCase()}
                    </div>
                  </div>

                  {aiInsights[fund.schemeCode] ? (
                    <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                      <p className="line-clamp-3">{aiInsights[fund.schemeCode]}</p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => generateInsight(fund.schemeCode, fund.schemeName, "fund", fund.analysis)}
                      disabled={loadingInsight === fund.schemeCode}
                    >
                      {loadingInsight === fund.schemeCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get AI Insight
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> These recommendations are for educational purposes
          only and should not be considered as financial advice. Please consult with a qualified financial advisor
          before making any investment decisions.
        </p>
      </div>
    </main>
  )
}
