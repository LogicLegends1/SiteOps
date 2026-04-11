"use client"

import { useEffect, useState } from "react"
import { SiteMap } from "@/components/site-progress/site-map"
import { ZoneDetails } from "@/components/site-progress/zone-details"
import { ProgressUpdateForm } from "@/components/site-progress/progress-update-form"
import { IssuesList } from "@/components/site-progress/issues-list"
import { type Zone } from "@/lib/site-data"

export default function SiteProgressPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)

  const projectId = 1

  async function fetchZones() {
    try {
      setLoading(true)

      const res = await fetch(`/api/project/${projectId}/zones`, {
        cache: "no-store",
      })

      const data = await res.json()

      console.log("zones response raw:", data)
      console.log("zones array:", data.zones)
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch zones")
      }

      setZones(data.zones || [])

      if (selectedZone) {
        const updatedSelectedZone = (data.zones || []).find(
          (zone: Zone) => zone.zoneID === selectedZone.zoneID
        )
        setSelectedZone(updatedSelectedZone || null)
      }
    } catch (error) {
      console.error("Error fetching zones:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SiteMap
            zones={zones}
            loading={loading}
            onZoneSelect={setSelectedZone}
            selectedZoneId={selectedZone?.zoneID}
            onUploadComplete={fetchZones}
          />
        </div>

        <div className="lg:col-span-1">
          <ZoneDetails zone={selectedZone} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressUpdateForm selectedZone={selectedZone} />
        <IssuesList selectedZone={selectedZone} />
      </div>
    </div>
  )
}