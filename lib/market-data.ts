// Market data service for Indian stocks and mutual funds

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  marketCap: number
  pe: number
  eps: number
  fiftyDayMA: number
  twoHundredDayMA: number
  historicalData: { date: string; open: number; high: number; low: number; close: number; volume: number }[]
}

export interface MutualFundData {
  schemeCode: string
  schemeName: string
  nav: number
  date: string
  navHistory: { date: string; nav: number }[]
  cagr1Y?: number
  cagr3Y?: number
  cagr5Y?: number
}

// Popular Indian stocks for display
export const POPULAR_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
  { symbol: "ITC.NS", name: "ITC Limited" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" },
]

// Popular mutual funds
export const POPULAR_FUNDS = [
  { code: "119551", name: "Axis Bluechip Fund" },
  { code: "118989", name: "Mirae Asset Large Cap Fund" },
  { code: "120503", name: "SBI Small Cap Fund" },
  { code: "120505", name: "HDFC Mid-Cap Opportunities Fund" },
  { code: "119597", name: "Parag Parikh Flexi Cap Fund" },
]

export async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`/api/stocks/${encodeURIComponent(symbol)}`)
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return null
  }
}

export async function fetchMutualFundData(schemeCode: string): Promise<MutualFundData | null> {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`)
    if (!response.ok) return null

    const data = await response.json()
    const navHistory = data.data.slice(0, 365).map((item: { date: string; nav: string }) => ({
      date: item.date,
      nav: Number.parseFloat(item.nav),
    }))

    // Calculate CAGR
    const currentNav = Number.parseFloat(data.data[0]?.nav || "0")
    const nav1YearAgo = navHistory.find((_: { date: string; nav: number }, i: number) => i >= 250)?.nav
    const nav3YearAgo = data.data[750]?.nav ? Number.parseFloat(data.data[750].nav) : undefined
    const nav5YearAgo = data.data[1250]?.nav ? Number.parseFloat(data.data[1250].nav) : undefined

    return {
      schemeCode,
      schemeName: data.meta.scheme_name,
      nav: currentNav,
      date: data.data[0]?.date || "",
      navHistory,
      cagr1Y: nav1YearAgo ? (currentNav / nav1YearAgo - 1) * 100 : undefined,
      cagr3Y: nav3YearAgo ? (Math.pow(currentNav / nav3YearAgo, 1 / 3) - 1) * 100 : undefined,
      cagr5Y: nav5YearAgo ? (Math.pow(currentNav / nav5YearAgo, 1 / 5) - 1) * 100 : undefined,
    }
  } catch (error) {
    console.error("Error fetching mutual fund data:", error)
    return null
  }
}

// Calculate technical indicators
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[i - 1] - prices[i]
    if (change > 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[0] || 0
  return prices.slice(0, period).reduce((a, b) => a + b, 0) / period
}

export function getTrendClassification(price: number, ma50: number, ma200: number): "bullish" | "neutral" | "bearish" {
  if (price > ma50 && ma50 > ma200) return "bullish"
  if (price < ma50 && ma50 < ma200) return "bearish"
  return "neutral"
}
