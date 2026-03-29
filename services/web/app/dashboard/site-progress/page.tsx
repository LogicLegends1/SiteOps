"use client"

import { useState } from "react"
import { SiteMap } from "@/components/site-progress/site-map"
import { ZoneDetails } from "@/components/site-progress/zone-details"
import { ProgressUpdateForm } from "@/components/site-progress/progress-update-form"
import { IssuesList } from "@/components/site-progress/issues-list"
import { type Zone } from "@/lib/site-data"

export default function SiteProgressPage() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Site Map - Takes 2 columns */}
        <div className="lg:col-span-2">
          <SiteMap onZoneSelect={setSelectedZone} selectedZoneId={selectedZone?.id} />
        </div>

        {/* Zone Details Panel */}
        <div className="lg:col-span-1">
          <ZoneDetails zone={selectedZone} />
        </div>
      </div>

      {/* Progress Update & Issues Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressUpdateForm selectedZone={selectedZone} />
        <IssuesList selectedZone={selectedZone} />
      </div>
    </div>
  )
}
