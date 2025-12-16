"use client"

import { useMemo } from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine } from "recharts"

interface CandlestickChartProps {
  data: { date: string; open: number; high: number; low: number; close: number; volume?: number }[]
  showEMA?: boolean
  height?: number
}

interface EMASignal {
  type: "bullish" | "bearish" | "neutral"
  message: string
  strength: number
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  
  if (prices.length === 0) return ema
  
  ema[0] = prices[0]
  
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
  }
  
  return ema
}

function getEMASignal(ema21: number | undefined, ema50: number | undefined, ema200: number | undefined, price: number): EMASignal {
  if (ema21 === undefined || ema50 === undefined || ema200 === undefined || isNaN(ema21) || isNaN(ema50) || isNaN(ema200)) {
    return {
      type: "neutral",
      message: "Insufficient data: Need at least 200 data points for full EMA analysis",
      strength: 0,
    }
  }

  const bullishConditions = [
    price > ema21,
    price > ema50,
    price > ema200,
    ema21 > ema50,
    ema50 > ema200,
  ]
  
  const bullishCount = bullishConditions.filter(Boolean).length
  
  if (bullishCount >= 4) {
    return {
      type: "bullish",
      message: "Strong Bullish: Price above all EMAs with bullish alignment",
      strength: bullishCount,
    }
  } else if (bullishCount >= 3) {
    return {
      type: "bullish",
      message: "Bullish: Most indicators showing upward momentum",
      strength: bullishCount,
    }
  } else if (bullishCount <= 1) {
    return {
      type: "bearish",
      message: "Strong Bearish: Price below EMAs with bearish alignment",
      strength: 5 - bullishCount,
    }
  } else if (bullishCount === 2) {
    return {
      type: "bearish",
      message: "Bearish: Most indicators showing downward pressure",
      strength: 5 - bullishCount,
    }
  }
  
  return {
    type: "neutral",
    message: "Neutral: Mixed signals, wait for confirmation",
    strength: 3,
  }
}

export function CandlestickChart({ data, showEMA = true, height = 400 }: CandlestickChartProps) {
  const { chartData, emaSignal, currentEMAs } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], emaSignal: null, currentEMAs: null }
    }

    const closes = data.map((d) => d.close)
    const ema21 = calculateEMA(closes, 21)
    const ema50 = calculateEMA(closes, 50)
    const ema200 = calculateEMA(closes, 200)
    
    const processedData = data.map((item, index) => {
      const isGreen = item.close >= item.open
      const bodyBottom = Math.min(item.open, item.close)
      const bodyTop = Math.max(item.open, item.close)
      
      return {
        ...item,
        candleBody: [bodyBottom, bodyTop],
        wickHigh: item.high,
        wickLow: item.low,
        isGreen,
        ema21: index >= 20 ? ema21[index] : undefined,
        ema50: index >= 49 ? ema50[index] : undefined,
        ema200: index >= 199 ? ema200[index] : undefined,
      }
    })
    
    const lastIndex = data.length - 1
    const currentEMAValues = {
      ema21: ema21[lastIndex],
      ema50: ema50[lastIndex],
      ema200: ema200[lastIndex],
    }
    
    const signal = getEMASignal(
      currentEMAValues.ema21,
      currentEMAValues.ema50,
      currentEMAValues.ema200,
      data[lastIndex]?.close || 0
    )
    
    return { chartData: processedData, emaSignal: signal, currentEMAs: currentEMAValues }
  }, [data])

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  }

  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  }

  const prices = data.flatMap((d) => [d.high, d.low])
  const minPrice = Math.min(...prices) * 0.98
  const maxPrice = Math.max(...prices) * 1.02

  const CustomCandlestick = (props: any) => {
    const { x, y, width, payload } = props
    if (!payload) return null
    
    const { open, high, low, close, isGreen } = payload
    const color = isGreen ? "#22c55e" : "#ef4444"
    const candleWidth = Math.max(width * 0.6, 2)
    const wickWidth = 1
    
    const yScale = (value: number) => {
      return y + ((maxPrice - value) / (maxPrice - minPrice)) * (height - 80)
    }
    
    const bodyTop = yScale(Math.max(open, close))
    const bodyBottom = yScale(Math.min(open, close))
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1)
    
    return (
      <g>
        <line
          x1={x + width / 2}
          y1={yScale(high)}
          x2={x + width / 2}
          y2={yScale(low)}
          stroke={color}
          strokeWidth={wickWidth}
        />
        <rect
          x={x + (width - candleWidth) / 2}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
          stroke={color}
        />
      </g>
    )
  }

  return (
    <div className="space-y-4">
      {showEMA && emaSignal && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          emaSignal.type === "bullish" 
            ? "bg-success/10 border-success/30" 
            : emaSignal.type === "bearish"
            ? "bg-destructive/10 border-destructive/30"
            : "bg-warning/10 border-warning/30"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              emaSignal.type === "bullish" ? "bg-success" : 
              emaSignal.type === "bearish" ? "bg-destructive" : "bg-warning"
            }`} />
            <div>
              <p className={`font-semibold ${
                emaSignal.type === "bullish" ? "text-success" : 
                emaSignal.type === "bearish" ? "text-destructive" : "text-warning"
              }`}>
                {emaSignal.type === "bullish" ? "Bullish Signal" : 
                 emaSignal.type === "bearish" ? "Bearish Signal" : "Neutral"}
              </p>
              <p className="text-sm text-muted-foreground">{emaSignal.message}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Signal Strength</p>
            <p className="font-semibold">{emaSignal.strength}/5</p>
          </div>
        </div>
      )}
      
      {showEMA && currentEMAs && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">EMA 21</p>
            <p className="font-semibold text-cyan-500">{formatPrice(currentEMAs.ema21)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">EMA 50</p>
            <p className="font-semibold text-amber-500">{formatPrice(currentEMAs.ema50)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">EMA 200</p>
            <p className="font-semibold text-purple-500">{formatPrice(currentEMAs.ema200)}</p>
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={formatPrice}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null
              const data = payload[0]?.payload
              if (!data) return null
              return (
                <div style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>
                    {new Date(label).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ color: "var(--color-muted-foreground)" }}>Open:</span>
                      <span style={{ fontWeight: 500 }}>{formatPrice(data.open)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ color: "var(--color-muted-foreground)" }}>High:</span>
                      <span style={{ fontWeight: 500, color: "#22c55e" }}>{formatPrice(data.high)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ color: "var(--color-muted-foreground)" }}>Low:</span>
                      <span style={{ fontWeight: 500, color: "#ef4444" }}>{formatPrice(data.low)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ color: "var(--color-muted-foreground)" }}>Close:</span>
                      <span style={{ fontWeight: 500 }}>{formatPrice(data.close)}</span>
                    </div>
                    {data.ema21 && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, borderTop: "1px solid var(--color-border)", paddingTop: 4, marginTop: 4 }}>
                        <span style={{ color: "#06b6d4" }}>EMA 21:</span>
                        <span>{formatPrice(data.ema21)}</span>
                      </div>
                    )}
                    {data.ema50 && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                        <span style={{ color: "#f59e0b" }}>EMA 50:</span>
                        <span>{formatPrice(data.ema50)}</span>
                      </div>
                    )}
                    {data.ema200 && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                        <span style={{ color: "#8b5cf6" }}>EMA 200:</span>
                        <span>{formatPrice(data.ema200)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }}
          />
          
          <Bar
            dataKey="close"
            shape={<CustomCandlestick />}
            isAnimationActive={false}
          />
          
          {showEMA && (
            <>
              <Line
                type="monotone"
                dataKey="ema21"
                stroke="#06b6d4"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                name="EMA 21"
              />
              <Line
                type="monotone"
                dataKey="ema50"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                name="EMA 50"
              />
              <Line
                type="monotone"
                dataKey="ema200"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                name="EMA 200"
              />
            </>
          )}
          
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              const colors: Record<string, string> = {
                "EMA 21": "#06b6d4",
                "EMA 50": "#f59e0b", 
                "EMA 200": "#8b5cf6",
              }
              return <span style={{ color: colors[value] || "inherit" }}>{value}</span>
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export { getEMASignal, calculateEMA }
