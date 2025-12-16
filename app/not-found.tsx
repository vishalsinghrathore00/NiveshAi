import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-8">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p className="text-lg font-semibold mb-2">Page not found</p>
              <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
              <Button asChild className="w-full h-11">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
