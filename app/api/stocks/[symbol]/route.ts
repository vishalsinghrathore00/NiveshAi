import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params

  try {
    const [chartResponse, summaryResponse] = await Promise.all([
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`, {
        next: { revalidate: 300 },
      }),
      fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics`,
        { next: { revalidate: 300 } },
      ),
    ])

    if (!chartResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
    }

    const chartData = await chartResponse.json()
    const result = chartData.chart?.result?.[0]

    if (!result) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 })
    }

    const meta = result.meta
    const quotes = result.indicators?.quote?.[0]
    const timestamps = result.timestamp || []

    const historicalData = timestamps
      .map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split("T")[0],
        open: quotes?.open?.[i] || 0,
        high: quotes?.high?.[i] || 0,
        low: quotes?.low?.[i] || 0,
        close: quotes?.close?.[i] || 0,
        volume: quotes?.volume?.[i] || 0,
      }))
      .filter((d: { close: number }) => d.close > 0)
      .reverse()

    // Calculate MAs
    const closes = historicalData.map((d: { close: number }) => d.close)
    const ma50 =
      closes.length >= 50 ? closes.slice(0, 50).reduce((a: number, b: number) => a + b, 0) / 50 : closes[0] || 0
    const ma200 =
      closes.length >= 200 ? closes.slice(0, 200).reduce((a: number, b: number) => a + b, 0) / 200 : closes[0] || 0

    let pe = 0,
      eps = 0,
      marketCap = 0

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json()
      const priceData = summaryData.quoteSummary?.result?.[0]?.price
      const summaryDetail = summaryData.quoteSummary?.result?.[0]?.summaryDetail
      const keyStats = summaryData.quoteSummary?.result?.[0]?.defaultKeyStatistics

      if (priceData) {
        marketCap = priceData.marketCap?.raw || 0
      }
      if (summaryDetail) {
        pe = summaryDetail.trailingPE?.raw || 0
      }
      if (keyStats) {
        eps = keyStats.trailingEps?.raw || 0
      }
    }

    const currentPrice = meta.regularMarketPrice || closes[0] || 0
    const previousClose = meta.chartPreviousClose || closes[1] || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return NextResponse.json({
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      price: currentPrice,
      change,
      changePercent,
      open: historicalData[0]?.open || 0,
      high: historicalData[0]?.high || 0,
      low: historicalData[0]?.low || 0,
      volume: meta.regularMarketVolume || historicalData[0]?.volume || 0,
      marketCap,
      pe,
      eps,
      fiftyDayMA: ma50,
      twoHundredDayMA: ma200,
      historicalData: historicalData.slice(0, 365),
    })
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
