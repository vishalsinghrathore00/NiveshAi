"use client"

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface StockChartProps {
  data: { date: string; open: number; high: number; low: number; close: number }[]
  ma50?: number
  ma200?: number
}

export function StockChart({ data, ma50, ma200 }: StockChartProps) {
  // Calculate MA values for each data point
  const chartData = data.map((item, index) => {
    const ma50Value =
      index >= 49 ? data.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50 : undefined
    const ma200Value =
      index >= 199 ? data.slice(index - 199, index + 1).reduce((sum, d) => sum + d.close, 0) / 200 : undefined

    return {
      ...item,
      // For candlestick effect
      range: [item.low, item.high],
      body: item.close >= item.open ? [item.open, item.close] : [item.close, item.open],
      fill: item.close >= item.open ? "#22c55e" : "#ef4444",
      ma50: ma50Value,
      ma200: ma200Value,
    }
  })

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  }

  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  }

  // Get price range for better axis scaling
  const prices = data.flatMap((d) => [d.high, d.low])
  const minPrice = Math.min(...prices) * 0.98
  const maxPrice = Math.max(...prices) * 1.02

  return (
    <ResponsiveContainer width="100%" height={400}>
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
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              close: "Close",
              open: "Open",
              high: "High",
              low: "Low",
              ma50: "MA 50",
              ma200: "MA 200",
            }
            return [formatPrice(value), labels[name] || name]
          }}
        />

        {/* Price line */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: "var(--color-primary)" }}
        />

        {/* MA 50 line */}
        <Line
          type="monotone"
          dataKey="ma50"
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          connectNulls
        />

        {/* MA 200 line */}
        <Line
          type="monotone"
          dataKey="ma200"
          stroke="#8b5cf6"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          connectNulls
        />

        {/* Reference lines for current MAs */}
        {ma50 && <ReferenceLine y={ma50} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} />}
        {ma200 && <ReferenceLine y={ma200} stroke="#8b5cf6" strokeDasharray="4 2" strokeOpacity={0.5} />}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
