"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, BadgeCheck } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type SignupResponse = {
  message?: string
  error?: string
}

export default function SignupPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("site_engineer")
  const [nic, setNic] = useState("")
  const [experience, setExperience] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      username.trim() &&
      email.trim() &&
      password &&
      role &&
      nic.trim() &&
      experience &&
      !isSubmitting
    )
  }, [username, email, password, role, nic, experience, isSubmitting])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          nic,
          experience,
        }),
      })

      const payload = (await res.json().catch(() => ({}))) as SignupResponse

      if (!res.ok) {
        setError(payload.error || "Unable to sign up.")
        return
      }

      router.push("/login")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16 sm:p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <BadgeCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              SiteOps for ACCESS ENGINEERING (PVT) LTD
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Signup failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">

              {/* Username */}
              <div className="grid gap-2">
                <Label htmlFor="username">
                  <User className="h-4 w-4" /> Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="rounded-md border bg-background p-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="SITE_ENGINEER">Site Engineer</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* NIC */}
              <div className="grid gap-2">
                <Label htmlFor="nic">NIC</Label>
                <Input
                  id="nic"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Experience */}
              <div className="grid gap-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <select
                  id="experience"
                  className="rounded-md border bg-background p-2"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? "Creating account…" : "Sign up"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
