import { Header } from "@/components/header"
import { Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
            </div>

            {/* Content Card */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                {
                  "We've sent you a confirmation link. Please check your email and click the link to activate your account."
                }
              </p>
              <Button variant="outline" asChild className="w-full h-11 bg-transparent">
                <Link href="/auth/login">
                  Back to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
