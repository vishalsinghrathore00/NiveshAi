"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface RSIGaugeProps {
  value: number
}

export function RSIGauge({ value }: RSIGaugeProps) {
  const getColor = () => {
    if (value < 30) return "#22c55e"
    if (value > 70) return "#ef4444"
    return "#f59e0b"
  }

  const getLabel = () => {
    if (value < 30) return "Oversold"
    if (value > 70) return "Overbought"
    return "Neutral"
  }

  const getDescription = () => {
    if (value < 30) return "Potential buying opportunity"
    if (value > 70) return "Potential selling signal"
    return "Market is balanced"
  }

  // Create gauge data
  const gaugeData = [
    { value: 30, color: "#22c55e" },
    { value: 40, color: "#f59e0b" },
    { value: 30, color: "#ef4444" },
  ]

  // Needle position (0-180 degrees)
  const needleAngle = (value / 100) * 180

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Needle */}
        <div
          className="absolute left-1/2 bottom-0 w-1 h-16 origin-bottom transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${needleAngle - 90}deg)` }}
        >
          <div className="w-full h-full rounded-full" style={{ backgroundColor: getColor() }} />
        </div>

        {/* Center dot */}
        <div
          className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-card"
          style={{ backgroundColor: getColor() }}
        />

        {/* Labels */}
        <div className="absolute bottom-0 left-4 text-xs text-muted-foreground font-medium">0</div>
        <div className="absolute bottom-0 right-4 text-xs text-muted-foreground font-medium">100</div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">50</div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-4xl font-bold" style={{ color: getColor() }}>
          {value.toFixed(1)}
        </p>
        <p className="text-sm font-medium text-foreground mt-1">{getLabel()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{getDescription()}</p>
      </div>
    </div>
  )
}
