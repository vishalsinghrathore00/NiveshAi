import { Header } from "@/components/header"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            {/* Content Card */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
              <p className="text-muted-foreground mb-6">
                {params?.error || "An unexpected error occurred during authentication. Please try again."}
              </p>
              <Button variant="outline" asChild className="w-full h-11 bg-transparent">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
