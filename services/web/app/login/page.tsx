"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HardHat, Mail, Lock, Chrome } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type LoginResponse = {
  message?: string
  error?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isSubmitting
  }, [email, password, isSubmitting])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = (await res.json().catch(() => ({}))) as LoginResponse

      if (!res.ok) {
        setError(payload.error || "Unable to sign in. Please try again.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function onGoogleSignIn() {
    window.location.href = "/api/auth/google"
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              SiteOps for ACCESS ENGINEERING (PVT) LTD
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleSignIn}
              disabled={isSubmitting}
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </Button>

            <div className="text-center text-sm flex flex-col gap-2 mt-2">
              <div>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
              <Link href="/" className="text-muted-foreground hover:text-primary hover:underline mt-2">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
