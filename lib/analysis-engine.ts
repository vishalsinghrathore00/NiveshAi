import { type StockData, type MutualFundData, calculateRSI, getTrendClassification } from "./market-data"

export interface StockAnalysis {
  symbol: string
  technicalScore: number
  fundamentalScore: number
  riskMatchScore: number
  totalScore: number
  trend: "bullish" | "neutral" | "bearish"
  rsi: number
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"
}

export interface FundAnalysis {
  schemeCode: string
  returnsScore: number
  stabilityScore: number
  totalScore: number
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"
}

export function analyzeStock(stock: StockData, userRiskLevel: "low" | "medium" | "high"): StockAnalysis {
  const prices = stock.historicalData.map((d) => d.close)
  const rsi = calculateRSI(prices)
  const trend = getTrendClassification(stock.price, stock.fiftyDayMA, stock.twoHundredDayMA)

  // Technical Score (0-100)
  let technicalScore = 50

  // Trend contribution
  if (trend === "bullish") technicalScore += 20
  else if (trend === "bearish") technicalScore -= 20

  // RSI contribution
  if (rsi < 30)
    technicalScore += 15 // Oversold
  else if (rsi > 70)
    technicalScore -= 15 // Overbought
  else if (rsi >= 40 && rsi <= 60) technicalScore += 5 // Neutral zone

  // Price vs MAs
  if (stock.price > stock.fiftyDayMA) technicalScore += 10
  if (stock.price > stock.twoHundredDayMA) technicalScore += 5

  technicalScore = Math.max(0, Math.min(100, technicalScore))

  // Fundamental Score (0-100)
  let fundamentalScore = 50

  // P/E contribution
  if (stock.pe > 0 && stock.pe < 15) fundamentalScore += 20
  else if (stock.pe >= 15 && stock.pe < 25) fundamentalScore += 10
  else if (stock.pe >= 25 && stock.pe < 40) fundamentalScore -= 5
  else if (stock.pe >= 40) fundamentalScore -= 15

  // EPS contribution
  if (stock.eps > 0) fundamentalScore += 15
  else fundamentalScore -= 10

  // Market cap contribution (large cap = more stable)
  if (stock.marketCap > 1000000000000)
    fundamentalScore += 10 // > 1 Lakh Cr
  else if (stock.marketCap > 100000000000) fundamentalScore += 5 // > 10K Cr

  fundamentalScore = Math.max(0, Math.min(100, fundamentalScore))

  // Risk Match Score (0-100)
  let riskMatchScore = 50
  const volatility = calculateVolatility(prices)

  if (userRiskLevel === "low") {
    if (volatility < 2) riskMatchScore = 90
    else if (volatility < 4) riskMatchScore = 60
    else riskMatchScore = 30
  } else if (userRiskLevel === "medium") {
    if (volatility >= 2 && volatility <= 5) riskMatchScore = 90
    else riskMatchScore = 60
  } else {
    if (volatility > 4) riskMatchScore = 80
    else riskMatchScore = 60
  }

  // Calculate total score: Technical(40%) + Fundamental(40%) + RiskMatch(20%)
  const totalScore = technicalScore * 0.4 + fundamentalScore * 0.4 + riskMatchScore * 0.2

  // Determine recommendation
  let recommendation: StockAnalysis["recommendation"]
  if (totalScore >= 80) recommendation = "strong_buy"
  else if (totalScore >= 65) recommendation = "buy"
  else if (totalScore >= 45) recommendation = "hold"
  else if (totalScore >= 30) recommendation = "sell"
  else recommendation = "strong_sell"

  return {
    symbol: stock.symbol,
    technicalScore,
    fundamentalScore,
    riskMatchScore,
    totalScore,
    trend,
    rsi,
    recommendation,
  }
}

export function analyzeFund(fund: MutualFundData): FundAnalysis {
  // Returns Score (0-100)
  let returnsScore = 50

  if (fund.cagr1Y) {
    if (fund.cagr1Y > 20) returnsScore += 20
    else if (fund.cagr1Y > 10) returnsScore += 10
    else if (fund.cagr1Y < 0) returnsScore -= 15
  }

  if (fund.cagr3Y) {
    if (fund.cagr3Y > 15) returnsScore += 15
    else if (fund.cagr3Y > 10) returnsScore += 8
  }

  if (fund.cagr5Y) {
    if (fund.cagr5Y > 12) returnsScore += 15
    else if (fund.cagr5Y > 8) returnsScore += 8
  }

  returnsScore = Math.max(0, Math.min(100, returnsScore))

  // Stability Score (0-100)
  let stabilityScore = 50
  const navs = fund.navHistory.map((h) => h.nav)
  const volatility = calculateVolatility(navs)

  if (volatility < 1) stabilityScore = 90
  else if (volatility < 2) stabilityScore = 75
  else if (volatility < 3) stabilityScore = 60
  else stabilityScore = 40

  // Total Score: Returns(50%) + Stability(50%)
  const totalScore = returnsScore * 0.5 + stabilityScore * 0.5

  let recommendation: FundAnalysis["recommendation"]
  if (totalScore >= 80) recommendation = "strong_buy"
  else if (totalScore >= 65) recommendation = "buy"
  else if (totalScore >= 45) recommendation = "hold"
  else if (totalScore >= 30) recommendation = "sell"
  else recommendation = "strong_sell"

  return {
    schemeCode: fund.schemeCode,
    returnsScore,
    stabilityScore,
    totalScore,
    recommendation,
  }
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns = []
  for (let i = 1; i < Math.min(prices.length, 30); i++) {
    returns.push(((prices[i - 1] - prices[i]) / prices[i]) * 100)
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length

  return Math.sqrt(variance)
}

// SIP Calculator
export function calculateSIPReturns(
  monthlyAmount: number,
  expectedRate: number, // Annual rate in %
  years: number,
): { futureValue: number; totalInvested: number; totalReturns: number } {
  const monthlyRate = expectedRate / 12 / 100
  const months = years * 12

  // FV = P × [((1 + r)^n − 1) / r] × (1 + r)
  const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)

  const totalInvested = monthlyAmount * months
  const totalReturns = futureValue - totalInvested

  return {
    futureValue: Math.round(futureValue),
    totalInvested,
    totalReturns: Math.round(totalReturns),
  }
}
