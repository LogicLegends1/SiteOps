"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Building2, Users, TrendingUp } from "lucide-react"

// Construction sites across Sri Lanka
const constructionSites = [
  {
    id: "site-1",
    name: "Colombo Metro Tower",
    location: "Colombo",
    x: 32,
    y: 58,
    status: "in-progress",
    progress: 68,
    teams: 4,
    isCurrentSite: true, // Site engineer's assigned site
  },
  {
    id: "site-2",
    name: "Kandy Commercial Complex",
    location: "Kandy",
    x: 45,
    y: 48,
    status: "in-progress",
    progress: 45,
    teams: 3,
    isCurrentSite: false,
  },
  {
    id: "site-3",
    name: "Galle Port Expansion",
    location: "Galle",
    x: 38,
    y: 82,
    status: "in-progress",
    progress: 82,
    teams: 5,
    isCurrentSite: false,
  },
  {
    id: "site-4",
    name: "Jaffna Industrial Park",
    location: "Jaffna",
    x: 48,
    y: 8,
    status: "delayed",
    progress: 35,
    teams: 2,
    isCurrentSite: false,
  },
  {
    id: "site-5",
    name: "Trincomalee Harbor",
    location: "Trincomalee",
    x: 62,
    y: 32,
    status: "in-progress",
    progress: 55,
    teams: 3,
    isCurrentSite: false,
  },
  {
    id: "site-6",
    name: "Negombo Resort",
    location: "Negombo",
    x: 30,
    y: 52,
    status: "completed",
    progress: 100,
    teams: 2,
    isCurrentSite: false,
  },
  {
    id: "site-7",
    name: "Anuradhapura Heritage Center",
    location: "Anuradhapura",
    x: 48,
    y: 28,
    status: "not-started",
    progress: 0,
    teams: 0,
    isCurrentSite: false,
  },
]

function getStatusColor(status: string, isCurrentSite: boolean) {
  if (isCurrentSite) return "#ef4444" // Red for current site
  switch (status) {
    case "completed":
      return "#22c55e"
    case "in-progress":
      return "#3b82f6"
    case "delayed":
      return "#f59e0b"
    case "not-started":
      return "#6b7280"
    default:
      return "#6b7280"
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground"
    case "in-progress":
      return "bg-primary text-primary-foreground"
    case "delayed":
      return "bg-warning text-warning-foreground"
    case "not-started":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function SriLankaSitesMap() {
  const [hoveredSite, setHoveredSite] = useState<string | null>(null)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Access Engineering Sites - Sri Lanka
            </CardTitle>
            <CardDescription>All active construction sites across the island</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Your Site</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Delayed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Completed</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Map Container */}
          <div className="relative flex-1 min-h-[400px] rounded-lg bg-secondary/30 border border-border overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ minHeight: "400px" }}
            >
              {/* Sri Lanka Outline - Simplified Shape */}
              <defs>
                <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.7" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Ocean Background */}
              <rect x="0" y="0" width="100" height="100" fill="hsl(var(--background))" />
              
              {/* Sri Lanka Island Shape */}
              <path
                d="M 45 5 
                   Q 55 3, 58 8
                   Q 62 12, 60 18
                   Q 65 22, 68 28
                   Q 70 35, 68 42
                   Q 66 48, 62 52
                   Q 58 58, 52 62
                   Q 48 68, 45 72
                   Q 42 78, 40 82
                   Q 38 86, 35 88
                   Q 32 90, 30 85
                   Q 28 80, 28 75
                   Q 26 68, 25 62
                   Q 24 55, 26 48
                   Q 28 42, 30 38
                   Q 32 32, 35 26
                   Q 38 18, 40 12
                   Q 42 8, 45 5
                   Z"
                fill="url(#landGradient)"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              
              {/* Province dividers (subtle) */}
              <path
                d="M 30 45 Q 45 42, 60 48"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.2"
                strokeDasharray="2,2"
                opacity="0.5"
              />
              <path
                d="M 35 65 Q 45 60, 55 65"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.2"
                strokeDasharray="2,2"
                opacity="0.5"
              />
              
              {/* Site Markers */}
              <TooltipProvider>
                {constructionSites.map((site) => (
                  <Tooltip key={site.id}>
                    <TooltipTrigger asChild>
                      <g
                        onMouseEnter={() => setHoveredSite(site.id)}
                        onMouseLeave={() => setHoveredSite(null)}
                        className="cursor-pointer"
                      >
                        {/* Pulse animation for current site */}
                        {site.isCurrentSite && (
                          <>
                            <circle
                              cx={site.x}
                              cy={site.y}
                              r="4"
                              fill={getStatusColor(site.status, site.isCurrentSite)}
                              opacity="0.3"
                            >
                              <animate
                                attributeName="r"
                                from="3"
                                to="8"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                from="0.4"
                                to="0"
                                dur="1.5s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </>
                        )}
                        
                        {/* Outer ring on hover */}
                        <circle
                          cx={site.x}
                          cy={site.y}
                          r={hoveredSite === site.id ? 5 : 3.5}
                          fill={getStatusColor(site.status, site.isCurrentSite)}
                          opacity={hoveredSite === site.id ? 0.3 : 0}
                          style={{ transition: "all 0.2s" }}
                        />
                        
                        {/* Main marker */}
                        <circle
                          cx={site.x}
                          cy={site.y}
                          r={hoveredSite === site.id || site.isCurrentSite ? 3 : 2.5}
                          fill={getStatusColor(site.status, site.isCurrentSite)}
                          stroke="hsl(var(--background))"
                          strokeWidth="0.5"
                          filter={site.isCurrentSite ? "url(#glow)" : undefined}
                          style={{ transition: "all 0.2s" }}
                        />
                        
                        {/* Site label */}
                        {(hoveredSite === site.id || site.isCurrentSite) && (
                          <text
                            x={site.x}
                            y={site.y - 5}
                            textAnchor="middle"
                            fill="hsl(var(--foreground))"
                            fontSize="2.5"
                            fontWeight="500"
                          >
                            {site.location}
                          </text>
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0">
                      <div className="p-3 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-medium text-sm">{site.name}</p>
                            <p className="text-xs text-muted-foreground">{site.location}</p>
                          </div>
                          {site.isCurrentSite && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Your Site
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className={getStatusBadgeClass(site.status)}>
                            {site.status.replace("-", " ")}
                          </Badge>
                          <span className="text-muted-foreground">{site.progress}% complete</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {site.teams} teams
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </svg>
          </div>

          {/* Sites List */}
          <div className="w-72 flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground mb-1">All Sites</p>
            {constructionSites.map((site) => (
              <div
                key={site.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  site.isCurrentSite
                    ? "bg-destructive/10 border-destructive/30 hover:bg-destructive/15"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
                onMouseEnter={() => setHoveredSite(site.id)}
                onMouseLeave={() => setHoveredSite(null)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(site.status, site.isCurrentSite) }}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {site.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{site.location}</p>
                    </div>
                  </div>
                  {site.isCurrentSite && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 ml-4">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${site.progress}%`,
                        backgroundColor: getStatusColor(site.status, site.isCurrentSite),
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {site.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
