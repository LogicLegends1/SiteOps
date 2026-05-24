
import Link from "next/link";
import { HardHat, GanttChartSquare, Bot, Lightbulb, Users, ArrowRight, MapPin, Package, Wrench } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FeatureShowcase } from "@/components/feature-showcase";

// We have 4 main features
//  {
//     title: "Site Progress Tracking",
//     icon: MapPin,
//   },

//   {
//     title: "Material Forecasting",
//     icon: Package,
//   },
//   {
//     title: "Workforce Allocation",
//     icon: Users,
//   },
//   {
//     title: "Equipment & Assets",
//     icon: Wrench,
//   },
const features = {
  "Site Progress Tracking": {
    icon: "MapPin",
    description: "Track real-time progress of construction activities with geospatial insights and visual dashboards."
  },
  "Material Forecasting": {
    icon: "Package",
    description: "Predict material requirements and track material usage to optimize procurement and reduce waste."
  },
  "Workforce Allocation": {
    icon: "Users",
    description: "Efficiently allocate workforce based on skill sets, availability, and project needs for optimal productivity."
  },
  "Equipment & Assets": {
    icon: "Wrench",
    description: "Monitor equipment usage, maintenance schedules, and asset performance to maximize uptime and efficiency."
  }
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground scroll-smooth">
      <header className="sticky top-0 z-50 w-full bg-background/95  transition-all duration-300">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center group cursor-pointer hover:opacity-80 transition-opacity">
            <HardHat className="h-6 w-6 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span className="font-bold relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">SiteOps</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild className="group transition-all duration-300 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        <section className="w-full flex-1 py-5 md:py-8 lg:py-12 overflow-hidden relative">
          {/* Background image (animated, placed behind content) */}
          <div className="absolute left-1/3 top-1/4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <img 
              src="/home_attract.png" 
              alt="Construction site monitoring dashboard with zones and equipment tracking"
              className="w-full h-full object-cover transform transition-transform duration-1000 will-change-transform"
            />
            <div className="absolute inset-0 bg-background/70" />
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-[pulse_4s_ease-in-out_infinite_reverse]" />
          
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col items-start justify-start space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Content */}
              <div className="space-y-6 max-w-3/4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50" style={{ fontFamily: 'verdana' }}>
                  FULL OPERATIONAL OBSERVABILITY INTO CONSTRUCTION EXECUTION
                </h1>
                <div className="space-y-3">
                  <p className="max-w-lg text-muted-foreground text-lg">
                    Observe the project flow, execute the core activities, and update live from the field.
                  </p>
                </div>
                <div className="pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both mt-10">
                  <Button size="lg" className="rounded-md px-10 py-3 gap-2 group transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95 text-lg font-semibold tracking-wider bg-foreground text-background" asChild>
                    <Link href="/dashboard">
                      GET STARTED
                    </Link>
                  </Button>
                  <div className="max-w-1/3">
                    <FeatureShowcase features={features} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background">
        <div className="container mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row py-5 px-2 md:px-6 items-center justify-between">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SiteOps. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4" prefetch={false}>
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
