import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ArrowRight, BarChart3, Calculator, Sparkles, Shield, TrendingUp, LineChart, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl">
            {/* Badge */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">Powered by AI</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-center text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
              Invest Smarter in
              <span className="block text-primary">Indian Markets</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground md:text-xl text-pretty">
              Track stocks, analyze mutual funds, and get AI-powered recommendations tailored to your risk profile.
              Built for modern Indian investors.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/auth/sign-up">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
                <Link href="/stocks">Explore Stocks</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">500+</p>
                <p className="mt-1 text-sm text-muted-foreground">NSE Stocks</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">1000+</p>
                <p className="mt-1 text-sm text-muted-foreground">Mutual Funds</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">Real-time</p>
                <p className="mt-1 text-sm text-muted-foreground">Market Data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl">Everything you need to invest</h2>
            <p className="mt-4 text-muted-foreground text-lg">Powerful tools designed for the modern Indian investor</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Live Stock Analysis</h3>
              <p className="text-muted-foreground">
                Real-time prices, interactive charts, technical indicators, and trend analysis for NSE stocks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/10">
                <Calculator className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">SIP Calculator</h3>
              <p className="text-muted-foreground">
                Calculate future wealth with our advanced SIP calculator and visualize your investment growth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                <Sparkles className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized suggestions based on your risk profile with AI-powered explanations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10">
                <LineChart className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Mutual Fund Insights</h3>
              <p className="text-muted-foreground">
                Track NAV history, calculate CAGR, and compare mutual funds for your SIP investments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Risk Assessment</h3>
              <p className="text-muted-foreground">
                Set your risk preferences and get investments matched to your comfort level.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Real-Time Data</h3>
              <p className="text-muted-foreground">
                Live market data from Yahoo Finance and MFAPI for accurate, up-to-date information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 md:p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-primary mb-6" />
            <h2 className="text-3xl font-bold md:text-4xl">Ready to start investing?</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Join thousands of Indian investors making smarter decisions
            </p>
            <Button size="lg" className="mt-8 h-12 px-8" asChild>
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">NiveshAI</span>
            </div>
            <p className="text-sm text-muted-foreground">For educational purposes only. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
