"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Bitcoin, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle
} from "lucide-react"

const FUTURES_DATA = [
  { symbol: "NIFTY", name: "Nifty 50 Futures", expiry: "Dec 2024", price: 24850, change: 125, changePercent: 0.51, oi: "12.5L", lot: 50 },
  { symbol: "BANKNIFTY", name: "Bank Nifty Futures", expiry: "Dec 2024", price: 52750, change: -180, changePercent: -0.34, oi: "8.2L", lot: 15 },
  { symbol: "FINNIFTY", name: "Fin Nifty Futures", expiry: "Dec 2024", price: 23150, change: 85, changePercent: 0.37, oi: "3.1L", lot: 40 },
  { symbol: "MIDCPNIFTY", name: "MidCap Nifty Futures", expiry: "Dec 2024", price: 12350, change: 45, changePercent: 0.37, oi: "1.8L", lot: 50 },
]

const OPTIONS_DATA = [
  { symbol: "NIFTY", strike: 24900, type: "CE", expiry: "Dec 26", premium: 185, change: 22, iv: 14.5, oi: "52L" },
  { symbol: "NIFTY", strike: 24800, type: "PE", expiry: "Dec 26", premium: 145, change: -15, iv: 15.2, oi: "48L" },
  { symbol: "BANKNIFTY", strike: 53000, type: "CE", expiry: "Dec 26", premium: 320, change: 45, iv: 16.8, oi: "25L" },
  { symbol: "BANKNIFTY", strike: 52500, type: "PE", expiry: "Dec 26", premium: 275, change: -30, iv: 17.5, oi: "22L" },
  { symbol: "NIFTY", strike: 25000, type: "CE", expiry: "Dec 26", premium: 95, change: 12, iv: 13.8, oi: "65L" },
  { symbol: "NIFTY", strike: 24700, type: "PE", expiry: "Dec 26", premium: 210, change: -25, iv: 16.1, oi: "38L" },
]

const CRYPTO_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 105250, change: 2850, changePercent: 2.78, marketCap: "$2.08T", volume24h: "$42.5B", supply: "19.6M" },
  { symbol: "ETH", name: "Ethereum", price: 3920, change: 125, changePercent: 3.29, marketCap: "$471B", volume24h: "$18.2B", supply: "120.4M" },
  { symbol: "SOL", name: "Solana", price: 218, change: 12.5, changePercent: 6.08, marketCap: "$103B", volume24h: "$5.8B", supply: "471M" },
  { symbol: "XRP", name: "Ripple", price: 2.45, change: 0.18, changePercent: 7.93, marketCap: "$140B", volume24h: "$12.1B", supply: "57.1B" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.405, change: 0.025, changePercent: 6.58, marketCap: "$59.5B", volume24h: "$4.2B", supply: "147B" },
  { symbol: "ADA", name: "Cardano", price: 1.12, change: 0.08, changePercent: 7.69, marketCap: "$39.2B", volume24h: "$2.1B", supply: "35B" },
]

export default function FOCryptoPage() {
  const [activeTab, setActiveTab] = useState("futures")

  const formatCurrency = (value: number, type: "inr" | "usd" = "inr") => {
    if (type === "usd") {
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
              <Zap className="h-5 w-5 text-chart-3" />
            </div>
            <h1 className="text-3xl font-bold">F&O & Crypto Markets</h1>
          </div>
          <p className="text-muted-foreground">Track Futures, Options, and Cryptocurrency markets</p>
        </div>

        <div className="mb-6 rounded-2xl border border-warning/50 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Demo Data</p>
              <p className="text-sm text-muted-foreground">
                The data shown below is for demonstration purposes only. Real-time F&O and crypto data will be integrated soon.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="futures" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Futures
            </TabsTrigger>
            <TabsTrigger value="options" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Options
            </TabsTrigger>
            <TabsTrigger value="crypto" className="gap-2">
              <Bitcoin className="h-4 w-4" />
              Crypto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="futures" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {FUTURES_DATA.map((future) => (
                <Card key={future.symbol} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{future.symbol}</CardTitle>
                        <p className="text-sm text-muted-foreground">{future.name}</p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {future.expiry}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold">{formatCurrency(future.price)}</p>
                        <div className={`flex items-center gap-1 mt-1 ${future.change >= 0 ? "text-success" : "text-destructive"}`}>
                          {future.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          <span className="font-medium">{future.change >= 0 ? "+" : ""}{future.change.toFixed(2)} ({future.changePercent >= 0 ? "+" : ""}{future.changePercent.toFixed(2)}%)</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Open Interest</p>
                        <p className="font-semibold">{future.oi}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lot Size</p>
                        <p className="font-semibold">{future.lot}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-6">
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Symbol</th>
                      <th className="text-left p-4 font-semibold">Strike</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Expiry</th>
                      <th className="text-right p-4 font-semibold">Premium</th>
                      <th className="text-right p-4 font-semibold">Change</th>
                      <th className="text-right p-4 font-semibold">IV</th>
                      <th className="text-right p-4 font-semibold">OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {OPTIONS_DATA.map((option, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{option.symbol}</td>
                        <td className="p-4">{option.strike.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge variant={option.type === "CE" ? "default" : "secondary"}>
                            {option.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{option.expiry}</td>
                        <td className="p-4 text-right font-semibold">₹{option.premium}</td>
                        <td className={`p-4 text-right ${option.change >= 0 ? "text-success" : "text-destructive"}`}>
                          {option.change >= 0 ? "+" : ""}{option.change}
                        </td>
                        <td className="p-4 text-right">{option.iv}%</td>
                        <td className="p-4 text-right">{option.oi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Nifty Put-Call Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1.15</p>
                  <p className="text-sm text-muted-foreground mt-1">Slightly Bullish</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Max Pain (Nifty)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">24,800</p>
                  <p className="text-sm text-muted-foreground mt-1">Dec Expiry</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">India VIX</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success">12.85</p>
                  <p className="text-sm text-muted-foreground mt-1">Low Volatility</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {CRYPTO_DATA.map((crypto) => (
                <Card key={crypto.symbol} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {crypto.symbol === "BTC" ? (
                          <Bitcoin className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="font-bold text-primary">{crypto.symbol.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{crypto.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-3xl font-bold">{formatCurrency(crypto.price, "usd")}</p>
                      <div className={`flex items-center gap-1 mt-1 ${crypto.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {crypto.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium">{crypto.changePercent >= 0 ? "+" : ""}{crypto.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
                      <div>
                        <p className="text-muted-foreground">Market Cap</p>
                        <p className="font-semibold">{crypto.marketCap}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-semibold">{crypto.volume24h}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-chart-3/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Crypto Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Market Cap</p>
                    <p className="text-2xl font-bold">$3.52T</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-2xl font-bold">$185B</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">BTC Dominance</p>
                    <p className="text-2xl font-bold">58.2%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fear & Greed Index</p>
                    <p className="text-2xl font-bold text-success">78 (Greed)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
