"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { SIPChart } from "@/components/sip-chart"
import { calculateSIPReturns } from "@/lib/analysis-engine"
import { Calculator, TrendingUp, Wallet, PiggyBank } from "lucide-react"

export default function SIPPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [years, setYears] = useState(10)

  const sipResult = useMemo(() => {
    return calculateSIPReturns(monthlyAmount, expectedReturn, years)
  }, [monthlyAmount, expectedReturn, years])

  const chartData = useMemo(() => {
    const data = []
    for (let year = 1; year <= years; year++) {
      const result = calculateSIPReturns(monthlyAmount, expectedReturn, year)
      data.push({
        year,
        invested: monthlyAmount * year * 12,
        value: result.futureValue,
      })
    }
    return data
  }, [monthlyAmount, expectedReturn, years])

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`
    return `₹${value.toLocaleString("en-IN")}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
              <Calculator className="h-5 w-5 text-chart-2" />
            </div>
            <h1 className="text-3xl font-bold">SIP Calculator</h1>
          </div>
          <p className="text-muted-foreground">Plan your wealth creation journey with Systematic Investment Plan</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calculator Inputs */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-6">Investment Details</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly" className="text-muted-foreground">
                    Monthly Investment
                  </Label>
                  <span className="text-sm font-semibold text-primary">{formatCurrency(monthlyAmount)}</span>
                </div>
                <Input
                  id="monthly"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Math.max(500, Number.parseInt(e.target.value) || 500))}
                  min={500}
                  step={500}
                  className="h-11"
                />
                <Slider
                  value={[monthlyAmount]}
                  onValueChange={([value]) => setMonthlyAmount(value)}
                  min={500}
                  max={100000}
                  step={500}
                  className="pt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="return" className="text-muted-foreground">
                    Expected Annual Return
                  </Label>
                  <span className="text-sm font-semibold text-primary">{expectedReturn}%</span>
                </div>
                <Input
                  id="return"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number.parseFloat(e.target.value) || 1)))}
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
                  className="pt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="years" className="text-muted-foreground">
                    Investment Period
                  </Label>
                  <span className="text-sm font-semibold text-primary">{years} Years</span>
                </div>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(40, Number.parseInt(e.target.value) || 1)))}
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
                  className="pt-2"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-2">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-2/10">
                    <Wallet className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invested</p>
                    <p className="text-xl font-bold">{formatCurrency(sipResult.totalInvested)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Returns</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(sipResult.totalReturns)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Future Value</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(sipResult.futureValue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Wealth Growth Projection</h2>
                <p className="text-sm text-muted-foreground">See how your investment grows over {years} years</p>
              </div>
              <SIPChart data={chartData} />
            </div>

            {/* Formula Info */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-3">How SIP Works</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                <strong className="text-foreground">Systematic Investment Plan (SIP)</strong> allows you to invest a
                fixed amount regularly in mutual funds. The power of compounding helps your money grow exponentially
                over time.
              </p>
              <div className="rounded-xl bg-muted/50 p-4 font-mono text-sm">
                {"FV = P × [((1 + r)^n − 1) / r] × (1 + r)"}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Where P = Monthly investment, r = Monthly rate of return, n = Total number of months.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
