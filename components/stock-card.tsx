"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StockCardProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  trend?: "bullish" | "neutral" | "bearish"
  score?: number
}

export function StockCard({ symbol, name, price, change, changePercent, trend, score }: StockCardProps) {
  const isPositive = change >= 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getTrendBg = () => {
    if (trend === "bullish") return "bg-success/10"
    if (trend === "bearish") return "bg-destructive/10"
    return "bg-warning/10"
  }

  const getTrendText = () => {
    if (trend === "bullish") return "text-success"
    if (trend === "bearish") return "text-destructive"
    return "text-warning"
  }

  return (
    <Link href={`/stocks/${encodeURIComponent(symbol)}`}>
      <div className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{symbol.replace(".NS", "")}</h3>
            <p className="text-sm text-muted-foreground truncate">{name}</p>
          </div>
          {trend && (
            <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTrendBg()} ${getTrendText()}`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{formatPrice(price)}</p>
            <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-success" : "text-destructive"}`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {score !== undefined && (
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${
                  score >= 65 ? "text-success" : score >= 45 ? "text-warning" : "text-destructive"
                }`}
              >
                {score.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform rounded-b-xl" />
      </div>
    </Link>
  )
}
