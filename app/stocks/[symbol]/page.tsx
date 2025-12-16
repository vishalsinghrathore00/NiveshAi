import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { StockDetailContent } from "@/components/stock-detail-content"

interface StockDetailPageProps {
  params: Promise<{ symbol: string }>
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { symbol } = await params
  const decodedSymbol = decodeURIComponent(symbol)

  if (!decodedSymbol) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StockDetailContent symbol={decodedSymbol} />
    </div>
  )
}
