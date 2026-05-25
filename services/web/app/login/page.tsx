"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HardHat, Mail, Lock } from "lucide-react"

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/home_attract.png"
          alt="Construction site monitoring dashboard with zones and equipment tracking"
          className="absolute inset-0 h-full w-full animate-in fade-in duration-1000 object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />

        <div className="absolute top-1/2 left-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6 md:p-10">
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
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                <path fill="#EA4335" d="M24 9.5c3.2 0 6.1 1.1 8.4 3.2l6.2-6.2C34.8 3.1 29.8 1 24 1 14.8 1 6.9 6.3 3 14.1l7.5 5.8C12.4 13.5 17.7 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.9h12.8c-.3 1.9-1.6 4.7-4.6 6.6l7.1 5.5c4.2-3.9 7.2-9.6 7.2-15.9z" />
                <path fill="#FBBC05" d="M10.5 28.2c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.5-5.8C1.8 16.5 1 20.2 1 23.7s.8 7.2 2 10.3l7.5-5.8z" />
                <path fill="#34A853" d="M24 47c5.8 0 10.6-1.9 14.1-5.2l-7.1-5.5c-2 1.4-4.7 2.4-7 2.4-6.3 0-11.6-4-13.5-9.5l-7.5 5.8C6.9 41.7 14.8 47 24 47z" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm mt-2">
              <Link href="/" className="text-muted-foreground hover:text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}