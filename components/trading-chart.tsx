"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, CrosshairMode, LineStyle, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Activity, Settings2, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface OHLCData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface TradingChartProps {
  data: OHLCData[]
  height?: number
}

type ChartType = "candlestick" | "line" | "area"
type TimeFrame = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"

interface IndicatorState {
  ema9: boolean
  ema21: boolean
  ema50: boolean
  ema200: boolean
  sma20: boolean
  volume: boolean
}

function calculateEMA(data: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = []
  const multiplier = 2 / (period + 1)

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null)
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0)
      ema.push(sum / period)
    } else {
      const prevEma = ema[i - 1]
      if (prevEma !== null) {
        ema.push((data[i] - prevEma) * multiplier + prevEma)
      } else {
        ema.push(null)
      }
    }
  }

  return ema
}

function calculateSMA(data: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
  }

  return sma
}

export function TradingChart({ data, height = 500 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map())

  const [chartType, setChartType] = useState<ChartType>("candlestick")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1Y")
  const [indicators, setIndicators] = useState<IndicatorState>({
    ema9: false,
    ema21: true,
    ema50: true,
    ema200: true,
    sma20: false,
    volume: true,
  })

  const [currentPrice, setCurrentPrice] = useState<{
    open: number
    high: number
    low: number
    close: number
    change: number
    changePercent: number
  } | null>(null)

  const timeFrames: TimeFrame[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"]

  const filterDataByTimeFrame = (sourceData: OHLCData[], tf: TimeFrame): OHLCData[] => {
    if (tf === "ALL") return sourceData

    const now = new Date()
    let startDate: Date

    switch (tf) {
      case "1D":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "1W":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1M":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "3M":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "6M":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case "1Y":
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    return sourceData.filter((d) => new Date(d.date) >= startDate)
  }

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    const filteredData = filterDataByTimeFrame(data, timeFrame)
    if (filteredData.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(255, 255, 255, 0.3)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#10b981",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.3)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#10b981",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: indicators.volume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    })

    chartRef.current = chart

    const formattedData = filteredData.map((d) => {
      const date = new Date(d.date)
      return {
        time: Math.floor(date.getTime() / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }
    })

    if (chartType === "candlestick") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      })
      candleSeries.setData(formattedData)
      mainSeriesRef.current = candleSeries as any
    } else if (chartType === "line") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#10b981",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      })
      lineSeries.setData(
        formattedData.map((d) => ({
          time: d.time,
          value: d.close,
        }))
      )
      mainSeriesRef.current = lineSeries as any
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(16, 185, 129, 0.4)",
        bottomColor: "rgba(16, 185, 129, 0.0)",
        lineColor: "#10b981",
        lineWidth: 2,
      })
      areaSeries.setData(
        formattedData.map((d) => ({
          time: d.time,
          value: d.close,
        }))
      )
      mainSeriesRef.current = areaSeries as any
    }

    if (indicators.volume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: "#3b82f6",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      })

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
      })

      const volumeData = filteredData.map((d, i) => {
        const date = new Date(d.date)
        return {
          time: Math.floor(date.getTime() / 1000) as UTCTimestamp,
          value: d.volume || Math.random() * 1000000,
          color: d.close >= d.open ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)",
        }
      })

      volumeSeries.setData(volumeData)
      volumeSeriesRef.current = volumeSeries
    }

    const closes = filteredData.map((d) => d.close)
    indicatorSeriesRef.current.clear()

    const indicatorConfig = [
      { key: "ema9", enabled: indicators.ema9, calc: () => calculateEMA(closes, 9), color: "#f472b6", name: "EMA 9" },
      { key: "ema21", enabled: indicators.ema21, calc: () => calculateEMA(closes, 21), color: "#06b6d4", name: "EMA 21" },
      { key: "ema50", enabled: indicators.ema50, calc: () => calculateEMA(closes, 50), color: "#f59e0b", name: "EMA 50" },
      { key: "ema200", enabled: indicators.ema200, calc: () => calculateEMA(closes, 200), color: "#8b5cf6", name: "EMA 200" },
      { key: "sma20", enabled: indicators.sma20, calc: () => calculateSMA(closes, 20), color: "#ec4899", name: "SMA 20" },
    ]

    indicatorConfig.forEach(({ key, enabled, calc, color }) => {
      if (enabled) {
        const values = calc()
        const lineData = filteredData
          .map((d, i) => {
            const date = new Date(d.date)
            return {
              time: Math.floor(date.getTime() / 1000) as UTCTimestamp,
              value: values[i],
            }
          })
          .filter((d) => d.value !== null) as { time: UTCTimestamp; value: number }[]

        if (lineData.length > 0) {
          const lineSeries = chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            crosshairMarkerVisible: false,
            priceLineVisible: false,
            lastValueVisible: false,
          })
          lineSeries.setData(lineData)
          indicatorSeriesRef.current.set(key, lineSeries as any)
        }
      }
    })

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData) {
        const mainData = param.seriesData.get(mainSeriesRef.current!)
        if (mainData) {
          const ohlc = mainData as { open?: number; high?: number; low?: number; close?: number; value?: number }
          const firstData = filteredData[0]
          const closePrice = ohlc.close || ohlc.value || 0
          const change = closePrice - firstData.close
          const changePercent = (change / firstData.close) * 100

          setCurrentPrice({
            open: ohlc.open || closePrice,
            high: ohlc.high || closePrice,
            low: ohlc.low || closePrice,
            close: closePrice,
            change,
            changePercent,
          })
        }
      } else {
        const lastData = filteredData[filteredData.length - 1]
        const firstData = filteredData[0]
        const change = lastData.close - firstData.close
        const changePercent = (change / firstData.close) * 100

        setCurrentPrice({
          open: lastData.open,
          high: lastData.high,
          low: lastData.low,
          close: lastData.close,
          change,
          changePercent,
        })
      }
    })

    const lastData = filteredData[filteredData.length - 1]
    const firstData = filteredData[0]
    const change = lastData.close - firstData.close
    const changePercent = (change / firstData.close) * 100
    setCurrentPrice({
      open: lastData.open,
      high: lastData.high,
      low: lastData.low,
      close: lastData.close,
      change,
      changePercent,
    })

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data, chartType, timeFrame, indicators, height])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const toggleIndicator = (key: keyof IndicatorState) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentPrice && (
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold">{formatPrice(currentPrice.close)}</p>
                <p className={`text-sm font-medium ${currentPrice.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {currentPrice.change >= 0 ? "+" : ""}
                  {formatPrice(currentPrice.change)} ({currentPrice.changePercent >= 0 ? "+" : ""}
                  {currentPrice.changePercent.toFixed(2)}%)
                </p>
              </div>
              <div className="hidden md:flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">O</span>
                  <span className="ml-1 font-medium">{formatPrice(currentPrice.open)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">H</span>
                  <span className="ml-1 font-medium text-green-500">{formatPrice(currentPrice.high)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">L</span>
                  <span className="ml-1 font-medium text-red-500">{formatPrice(currentPrice.low)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">C</span>
                  <span className="ml-1 font-medium">{formatPrice(currentPrice.close)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {timeFrames.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeFrame === tf ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            <button
              onClick={() => setChartType("candlestick")}
              className={`p-2 rounded-md transition-colors ${
                chartType === "candlestick" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Candlestick"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-md transition-colors ${
                chartType === "line" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Line"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-2 rounded-md transition-colors ${
                chartType === "area" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Area"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Indicators
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem checked={indicators.ema9} onCheckedChange={() => toggleIndicator("ema9")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-pink-400" />
                  EMA 9
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={indicators.ema21} onCheckedChange={() => toggleIndicator("ema21")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-cyan-500" />
                  EMA 21
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={indicators.ema50} onCheckedChange={() => toggleIndicator("ema50")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-amber-500" />
                  EMA 50
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={indicators.ema200} onCheckedChange={() => toggleIndicator("ema200")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-purple-500" />
                  EMA 200
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={indicators.sma20} onCheckedChange={() => toggleIndicator("sma20")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-pink-500" />
                  SMA 20
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={indicators.volume} onCheckedChange={() => toggleIndicator("volume")}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded bg-blue-500" />
                  Volume
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {indicators.ema9 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-pink-400" />
            <span className="text-muted-foreground">EMA 9</span>
          </div>
        )}
        {indicators.ema21 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-cyan-500" />
            <span className="text-muted-foreground">EMA 21</span>
          </div>
        )}
        {indicators.ema50 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-amber-500" />
            <span className="text-muted-foreground">EMA 50</span>
          </div>
        )}
        {indicators.ema200 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-purple-500" />
            <span className="text-muted-foreground">EMA 200</span>
          </div>
        )}
        {indicators.sma20 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-pink-500" />
            <span className="text-muted-foreground">SMA 20</span>
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="rounded-xl overflow-hidden" />
    </div>
  )
}
