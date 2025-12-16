"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface SIPChartProps {
  data: { year: number; invested: number; value: number }[]
}

export function SIPChart({ data }: SIPChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
    return `₹${value}`
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">Year {label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{entry.dataKey === "invested" ? "Invested" : "Value"}</span>
              <span className={`font-semibold ${entry.dataKey === "value" ? "text-success" : "text-foreground"}`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {payload.length === 2 && (
            <div className="flex items-center justify-between gap-4 text-sm mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground">Returns</span>
              <span className="font-semibold text-success">{formatCurrency(payload[1].value - payload[0].value)}</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="year"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Yr ${value}`}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCurrency}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-sm text-muted-foreground">
              {value === "invested" ? "Total Invested" : "Portfolio Value"}
            </span>
          )}
        />
        <Area type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} fill="url(#investedGradient)" />
        <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#valueGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
