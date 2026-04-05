
import Link from "next/link";
import { HardHat, GanttChartSquare, Bot, Lightbulb, Users, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <GanttChartSquare className="h-10 w-10 text-primary" />,
    title: "Site Progress Tracking",
    description: "Monitor real-time progress of all your construction sites from a centralized dashboard.",
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: "Predictive Delay Engine",
    description: "Our AI-powered engine analyzes project data to predict potential delays before they happen.",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: "Material Forecasting",
    description: "Optimize your inventory with our material forecasting tools to avoid shortages and overstocking.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Workforce Allocation",
    description: "Efficiently manage and allocate your workforce to the right tasks at the right time.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground scroll-smooth">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center group cursor-pointer hover:opacity-80 transition-opacity">
            <HardHat className="h-6 w-6 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span className="font-bold relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">SiteOps</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="group transition-all duration-300 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5">
              <Link href="/auth/login">
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        <section className="w-full py-20 md:py-28 lg:py-32 overflow-hidden relative">
          {/* Background decorative elements */}
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -z-10 animate-[pulse_4s_ease-in-out_infinite_reverse]" />
          
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-6 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" style={{ fontFamily: 'serif' }}>
                  ACCESS ENGINEERING (PVT) LTD
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
                  The future of construction site management. SiteOps provides a comprehensive suite of tools to streamline your operations end-to-end.
                </p>
                <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                  <Button size="lg" className="rounded-full px-8 gap-2 group transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1" asChild>
                    <Link href="#features">
                      Explore Features
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-90" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-muted/50 py-16 md:py-24 lg:py-32 flex justify-center border-t border-border/50">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-all hover:bg-primary/20 cursor-default">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything you need to manage your site
              </h2>
              <p className="mx-auto max-w-[800px] text-muted-foreground md:text-lg">
                From tracking progress to predicting delays, SiteOps is the all-in-one solution for modern construction management.
              </p>
            </div>
            
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 lg:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className="group relative overflow-hidden rounded-2xl border bg-background p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                  
                  <div className="relative flex flex-col gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background">
        <div className="container mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row py-8 px-4 md:px-8 items-center justify-between">
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

