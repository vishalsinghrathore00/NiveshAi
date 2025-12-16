"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { StockCard } from "@/components/stock-card"
import { SIPChart } from "@/components/sip-chart"
import { RSIGauge } from "@/components/rsi-gauge"
import { CandlestickChart } from "@/components/candlestick-chart"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateSIPReturns, analyzeStock } from "@/lib/analysis-engine"
import { BarChart3, Calculator, Sparkles, TrendingUp, LineChart, AlertCircle, CheckCircle2 } from "lucide-react"

// Mock data for stocks
const DEMO_STOCKS = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    price: 2850,
    change: 45.5,
    changePercent: 1.62,
    trend: "bullish" as const,
    score: 78,
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    price: 3850,
    change: -22.5,
    changePercent: -0.58,
    trend: "bearish" as const,
    score: 62,
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    price: 1925,
    change: 12.3,
    changePercent: 0.64,
    trend: "neutral" as const,
    score: 71,
  },
  {
    symbol: "INFY.NS",
    name: "Infosys",
    price: 1680,
    change: 34.2,
    changePercent: 2.07,
    trend: "bullish" as const,
    score: 75,
  },
]

// Mock historical data for chart
const generateMockHistoricalData = () => {
  const data = []
  const basePrice = 3000
  const today = new Date()

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const randomChange = (Math.random() - 0.5) * 100
    const price = basePrice + randomChange * (90 - i) / 10
    data.push({
      date: date.toISOString().split("T")[0],
      open: price - Math.random() * 20,
      high: price + Math.random() * 30,
      low: price - Math.random() * 30,
      close: price,
      volume: Math.floor(Math.random() * 50000000),
    })
  }
  return data
}

export default function DemoPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [years, setYears] = useState(10)
  const [riskProfile, setRiskProfile] = useState<"low" | "medium" | "high">("medium")

  const sipResult = useMemo(() => {
    return calculateSIPReturns(monthlyAmount, expectedReturn, years)
  }, [monthlyAmount, expectedReturn, years])

  const chartData = useMemo(() => {
    const data = []
    for (let year = 1; year <= years; year++) {
      const result = calculateSIPReturns(monthlyAmount, expectedReturn, year)
      data.push({
        year,
        invested: monthlyAmount * year * 12,
        value: result.futureValue,
      })
    }
    return data
  }, [monthlyAmount, expectedReturn, years])

  const historicalData = useMemo(() => generateMockHistoricalData(), [])

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`
    return `₹${value.toLocaleString("en-IN")}`
  }

  const aiRecommendations = [
    {
      stock: "RELIANCE.NS",
      reason: "Strong fundamentals with bullish technical indicators",
      confidence: 85,
      action: "BUY",
    },
    {
      stock: "INFY.NS",
      reason: "Consistent growth pattern matching your risk profile",
      confidence: 78,
      action: "BUY",
    },
    {
      stock: "TCS.NS",
      reason: "Currently in consolidation phase, wait for breakout",
      confidence: 62,
      action: "HOLD",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">NiveshAI Demo</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            Explore all features of NiveshAI without signing up. Try stock analysis, SIP calculations, and AI-powered insights.
          </p>
        </div>

        <Tabs defaultValue="stocks" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
            <TabsTrigger value="ai">AI Picks</TabsTrigger>
          </TabsList>

          {/* Stocks Tab */}
          <TabsContent value="stocks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Indian Stock Market
              </h2>
              <p className="text-muted-foreground">Browse top NSE listed stocks with real-time analysis</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEMO_STOCKS.map((stock) => (
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
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <LineChart className="h-6 w-6 text-primary" />
                Technical Analysis
              </h2>
              <p className="text-muted-foreground">Deep dive into stock charts and technical indicators</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Chart */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">RELIANCE 90-Day Price Chart with EMA</h3>
                <CandlestickChart data={historicalData} showEMA={true} height={400} />
              </div>

              {/* RSI Gauge */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-6">RSI Indicator</h3>
                <RSIGauge value={35} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">Current RSI: 35</p>
                  <p className="text-xs text-muted-foreground mt-2">Technical indicators show oversold conditions</p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">52-Week High</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹3,100</p>
                  <p className="text-xs text-muted-foreground mt-1">+8.77% from current</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">52-Week Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹2,450</p>
                  <p className="text-xs text-muted-foreground mt-1">16.28% below current</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">P/E Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">22.5</p>
                  <p className="text-xs text-muted-foreground mt-1">Below market average</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">₹18.2 Lakh Cr</p>
                  <p className="text-xs text-muted-foreground mt-1">Largest by cap</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SIP Calculator Tab */}
          <TabsContent value="sip" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-chart-2" />
                SIP Calculator
              </h2>
              <p className="text-muted-foreground">Calculate your investment growth with SIP</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Calculator Inputs */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-6">Investment Details</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="monthly" className="text-muted-foreground">
                        Monthly Investment
                      </Label>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(monthlyAmount)}</span>
                    </div>
                    <Input
                      id="monthly"
                      type="number"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(Math.max(500, Number.parseInt(e.target.value) || 500))}
                      min={500}
                      step={500}
                      className="h-11"
                    />
                    <Slider
                      value={[monthlyAmount]}
                      onValueChange={([value]) => setMonthlyAmount(value)}
                      min={500}
                      max={100000}
                      step={500}
                      className="pt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="return" className="text-muted-foreground">
                        Expected Annual Return
                      </Label>
                      <span className="text-sm font-semibold text-primary">{expectedReturn}%</span>
                    </div>
                    <Input
                      id="return"
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number.parseFloat(e.target.value) || 1)))}
                      min={1}
                      max={30}
                      step={0.5}
                      className="h-11"
                    />
                    <Slider
                      value={[expectedReturn]}
                      onValueChange={([value]) => setExpectedReturn(value)}
                      min={1}
                      max={30}
                      step={0.5}
                      className="pt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="years" className="text-muted-foreground">
                        Investment Period
                      </Label>
                      <span className="text-sm font-semibold text-primary">{years} Years</span>
                    </div>
                    <Input
                      id="years"
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Math.max(1, Math.min(40, Number.parseInt(e.target.value) || 1)))}
                      min={1}
                      max={40}
                      className="h-11"
                    />
                    <Slider
                      value={[years]}
                      onValueChange={([value]) => setYears(value)}
                      min={1}
                      max={40}
                      step={1}
                      className="pt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-6 lg:col-span-2">
                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{formatCurrency(sipResult.totalInvested)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Est. Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-success">{formatCurrency(sipResult.totalReturns)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Future Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(sipResult.futureValue)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Wealth Growth Projection</h3>
                  <SIPChart data={chartData} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Picks Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-chart-3" />
                AI-Powered Recommendations
              </h2>
              <p className="text-muted-foreground">Personalized stock picks based on market analysis</p>
            </div>

            {/* Risk Profile Selector */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Your Risk Profile</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {(["low", "medium", "high"] as const).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setRiskProfile(profile)}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      riskProfile === profile
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold capitalize">{profile} Risk</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {profile === "low" && "Conservative, steady growth"}
                      {profile === "medium" && "Balanced, optimal returns"}
                      {profile === "high" && "Aggressive, maximum growth"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div key={rec.stock} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{rec.stock}</h3>
                        <Badge variant={rec.action === "BUY" ? "default" : "outline"}>{rec.action}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{rec.confidence}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all rounded-full"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    {rec.action === "BUY" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span>
                      {rec.action === "BUY"
                        ? "Good entry point for investors with your risk profile"
                        : "Monitor for better entry point"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="rounded-2xl border border-warning/50 bg-warning/5 p-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> These recommendations are for educational purposes only and are based on historical data analysis. This is not financial advice. Please consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl border border-border bg-gradient-to-r from-primary/10 to-chart-2/10 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start investing?</h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Create a free account to get personalized recommendations, maintain your watchlist, and track your portfolio.
          </p>
          <a href="/auth/sign-up" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Create Free Account
            <TrendingUp className="ml-2 h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
