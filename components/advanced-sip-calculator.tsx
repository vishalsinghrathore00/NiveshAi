"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SIPChart } from "@/components/sip-chart"
import {
  Calculator,
  TrendingUp,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Percent,
  Calendar,
  Target,
  IndianRupee,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"

interface AdvancedSIPResult {
  futureValue: number
  totalInvested: number
  totalReturns: number
  inflationAdjustedValue: number
  taxableGains: number
  postTaxValue: number
  yearlyBreakdown: YearlyData[]
}

interface YearlyData {
  year: number
  invested: number
  value: number
  returns: number
  sipAmount: number
  inflationAdjusted: number
}

function calculateAdvancedSIP(
  monthlyAmount: number,
  expectedRate: number,
  years: number,
  stepUpPercent: number,
  inflationRate: number,
  includeTax: boolean
): AdvancedSIPResult {
  const yearlyBreakdown: YearlyData[] = []
  let totalInvested = 0
  let currentValue = 0
  let currentSIP = monthlyAmount
  const monthlyRate = expectedRate / 12 / 100

  for (let year = 1; year <= years; year++) {
    let yearlyInvested = 0

    for (let month = 1; month <= 12; month++) {
      currentValue = (currentValue + currentSIP) * (1 + monthlyRate)
      yearlyInvested += currentSIP
      totalInvested += currentSIP
    }

    const inflationFactor = Math.pow(1 + inflationRate / 100, year)
    const inflationAdjusted = currentValue / inflationFactor

    yearlyBreakdown.push({
      year,
      invested: Math.round(totalInvested),
      value: Math.round(currentValue),
      returns: Math.round(currentValue - totalInvested),
      sipAmount: Math.round(currentSIP),
      inflationAdjusted: Math.round(inflationAdjusted),
    })

    currentSIP = currentSIP * (1 + stepUpPercent / 100)
  }

  const futureValue = Math.round(currentValue)
  const totalReturns = futureValue - totalInvested
  const inflationFactor = Math.pow(1 + inflationRate / 100, years)
  const inflationAdjustedValue = Math.round(futureValue / inflationFactor)

  let taxableGains = 0
  let postTaxValue = futureValue

  if (includeTax && totalReturns > 125000) {
    taxableGains = totalReturns - 125000
    const tax = taxableGains * 0.125
    postTaxValue = Math.round(futureValue - tax)
  }

  return {
    futureValue,
    totalInvested,
    totalReturns,
    inflationAdjustedValue,
    taxableGains: Math.round(taxableGains),
    postTaxValue,
    yearlyBreakdown,
  }
}

function calculateGoalSIP(
  targetAmount: number,
  expectedRate: number,
  years: number,
  stepUpPercent: number
): number {
  let low = 100
  let high = targetAmount / (years * 12)
  let result = low

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2
    const sipResult = calculateAdvancedSIP(mid, expectedRate, years, stepUpPercent, 0, false)

    if (sipResult.futureValue >= targetAmount) {
      result = mid
      high = mid
    } else {
      low = mid
    }
  }

  return Math.ceil(result / 100) * 100
}

export function AdvancedSIPCalculator() {
  const [calculatorType, setCalculatorType] = useState<"regular" | "stepup" | "goal">("regular")
  const [monthlyAmount, setMonthlyAmount] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [years, setYears] = useState(10)
  const [stepUpPercent, setStepUpPercent] = useState(10)
  const [inflationRate, setInflationRate] = useState(6)
  const [showInflation, setShowInflation] = useState(true)
  const [showTax, setShowTax] = useState(false)
  const [targetAmount, setTargetAmount] = useState(10000000)

  const sipResult = useMemo(() => {
    return calculateAdvancedSIP(
      monthlyAmount,
      expectedReturn,
      years,
      calculatorType === "stepup" ? stepUpPercent : 0,
      showInflation ? inflationRate : 0,
      showTax
    )
  }, [monthlyAmount, expectedReturn, years, stepUpPercent, inflationRate, showInflation, showTax, calculatorType])

  const goalSIPAmount = useMemo(() => {
    if (calculatorType === "goal") {
      return calculateGoalSIP(targetAmount, expectedReturn, years, stepUpPercent)
    }
    return 0
  }, [targetAmount, expectedReturn, years, stepUpPercent, calculatorType])

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`
    return `₹${value.toLocaleString("en-IN")}`
  }

  const yearlyChartData = sipResult.yearlyBreakdown.map((item) => ({
    year: `Year ${item.year}`,
    invested: item.invested,
    returns: item.returns,
    value: item.value,
    inflationAdjusted: item.inflationAdjusted,
  }))

  const sipGrowthData = sipResult.yearlyBreakdown.map((item) => ({
    year: `Year ${item.year}`,
    sipAmount: item.sipAmount,
  }))

  return (
    <div className="space-y-6">
      <Tabs value={calculatorType} onValueChange={(v) => setCalculatorType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regular">Regular SIP</TabsTrigger>
          <TabsTrigger value="stepup">Step-Up SIP</TabsTrigger>
          <TabsTrigger value="goal">Goal-Based SIP</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Investment Details
            </h3>

            <div className="space-y-6">
              {calculatorType === "goal" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Target Amount
                    </Label>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(targetAmount)}</span>
                  </div>
                  <Input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Math.max(100000, Number(e.target.value) || 100000))}
                    min={100000}
                    step={100000}
                    className="h-11"
                  />
                  <Slider
                    value={[targetAmount]}
                    onValueChange={([value]) => setTargetAmount(value)}
                    min={100000}
                    max={100000000}
                    step={100000}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Monthly Investment
                    </Label>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(monthlyAmount)}</span>
                  </div>
                  <Input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Math.max(500, Number(e.target.value) || 500))}
                    min={500}
                    step={500}
                    className="h-11"
                  />
                  <Slider
                    value={[monthlyAmount]}
                    onValueChange={([value]) => setMonthlyAmount(value)}
                    min={500}
                    max={500000}
                    step={500}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Expected Return
                  </Label>
                  <span className="text-sm font-semibold text-primary">{expectedReturn}%</span>
                </div>
                <Input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  min={1}
                  max={30}
                  step={0.5}
                  className="h-11"
                />
                <Slider
                  value={[expectedReturn]}
                  onValueChange={([value]) => setExpectedReturn(value)}
                  min={1}
                  max={30}
                  step={0.5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Investment Period
                  </Label>
                  <span className="text-sm font-semibold text-primary">{years} Years</span>
                </div>
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
                  min={1}
                  max={40}
                  className="h-11"
                />
                <Slider
                  value={[years]}
                  onValueChange={([value]) => setYears(value)}
                  min={1}
                  max={40}
                  step={1}
                />
              </div>

              {(calculatorType === "stepup" || calculatorType === "goal") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Annual Step-Up
                    </Label>
                    <span className="text-sm font-semibold text-primary">{stepUpPercent}%</span>
                  </div>
                  <Input
                    type="number"
                    value={stepUpPercent}
                    onChange={(e) => setStepUpPercent(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                    min={0}
                    max={50}
                    className="h-11"
                  />
                  <Slider
                    value={[stepUpPercent]}
                    onValueChange={([value]) => setStepUpPercent(value)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Adjust for Inflation ({inflationRate}%)</Label>
                  <Switch checked={showInflation} onCheckedChange={setShowInflation} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Include LTCG Tax (12.5%)</Label>
                  <Switch checked={showTax} onCheckedChange={setShowTax} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {calculatorType === "goal" && (
              <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Required Monthly SIP</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(goalSIPAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">To achieve</p>
                    <p className="text-xl font-semibold">{formatCurrency(targetAmount)}</p>
                    <p className="text-sm text-muted-foreground">in {years} years</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Total Invested
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{formatCurrency(sipResult.totalInvested)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Est. Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-success">{formatCurrency(sipResult.totalReturns)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Future Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-primary">{formatCurrency(sipResult.futureValue)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {showTax ? "Post-Tax Value" : "Inflation Adjusted"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-chart-4">
                    {formatCurrency(showTax ? sipResult.postTaxValue : sipResult.inflationAdjustedValue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Wealth Growth Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        invested: "Invested",
                        returns: "Returns",
                        value: "Total Value",
                        inflationAdjusted: "Inflation Adjusted",
                      }
                      return [formatCurrency(value), labels[name] || name]
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Invested"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Returns"
                  />
                  {showInflation && (
                    <Area
                      type="monotone"
                      dataKey="inflationAdjusted"
                      stroke="#f59e0b"
                      fill="none"
                      strokeDasharray="5 5"
                      name="Inflation Adjusted"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {calculatorType === "stepup" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">SIP Amount Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sipGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Monthly SIP"]}
                    />
                    <Bar dataKey="sipAmount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-4">
                  Your SIP will grow from {formatCurrency(monthlyAmount)} to{" "}
                  {formatCurrency(sipResult.yearlyBreakdown[years - 1]?.sipAmount || monthlyAmount)} over {years} years.
                </p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
