import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { assetName, assetType, analysis, userRiskLevel } = await request.json()

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured")
      // Return mock insight if API key not available (for demo)
      const mockInsight =
        assetType === "stock"
          ? `Based on the analysis of ${assetName}, here are key insights for a ${userRiskLevel}-risk investor:\n\nThis stock shows a ${analysis.trend} trend with a technical score of ${analysis.technicalScore?.toFixed(1)}/100. The overall recommendation is ${analysis.recommendation}. For your ${userRiskLevel}-risk profile, consider your investment horizon and diversification strategy.\n\nNote: This is a technical analysis only. Please consult with a financial advisor before making investment decisions.`
          : `The ${assetName} mutual fund shows promising metrics with a returns score of ${analysis.returnsScore?.toFixed(1)}/100 and stability score of ${analysis.stabilityScore?.toFixed(1)}/100. For systematic investment, this fund could be suitable based on its track record.\n\nNote: This analysis is for educational purposes. Consult a financial advisor for personalized recommendations.`

      return NextResponse.json({ insight: mockInsight })
    }

    try {
      const { generateText } = await import("ai")

      const prompt =
        assetType === "stock"
          ? `You are a financial advisor for Indian retail investors. Analyze ${assetName} stock for a ${userRiskLevel}-risk investor.

Current Analysis:
- Trend: ${analysis.trend}
- RSI: ${analysis.rsi?.toFixed(1)}
- Technical Score: ${analysis.technicalScore?.toFixed(1)}/100
- Fundamental Score: ${analysis.fundamentalScore?.toFixed(1)}/100
- Overall Score: ${analysis.totalScore?.toFixed(1)}/100
- Recommendation: ${analysis.recommendation}

Provide a brief, beginner-friendly explanation (2-3 paragraphs) covering:
1. Why this stock might be suitable/unsuitable for their risk profile
2. Key factors to consider
3. Any risks they should be aware of

Keep the language simple and avoid jargon. Use Indian Rupee context.`
          : `You are a financial advisor for Indian retail investors. Analyze ${assetName} mutual fund for SIP investment.

Current Analysis:
- Returns Score: ${analysis.returnsScore?.toFixed(1)}/100
- Stability Score: ${analysis.stabilityScore?.toFixed(1)}/100
- Overall Score: ${analysis.totalScore?.toFixed(1)}/100
- Recommendation: ${analysis.recommendation}

Provide a brief, beginner-friendly explanation (2-3 paragraphs) covering:
1. Why this fund might be good for systematic investment
2. Historical performance context
3. Any risks or considerations

Keep the language simple. Use Indian Rupee and SIP context.`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
      })

      return NextResponse.json({ insight: text })
    } catch (aiError) {
      console.error("Error with AI generation:", aiError)
      throw aiError
    }
  } catch (error) {
    console.error("Error generating AI insight:", error)
    return NextResponse.json(
      { error: "Failed to generate insight. Please try again later." },
      { status: 500 },
    )
  }
}
