"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ZoneDetails } from "@/components/site-progress/zone-details"
import { ProgressUpdateForm } from "@/components/site-progress/progress-update-form"
import { IssuesList } from "@/components/site-progress/issues-list"
import { type Zone, type Project } from "@/lib/site-data"

const LeafletMap = dynamic(() => import("@/components/site-progress/leaflet-map").then(mod => ({ default: mod.LeafletMap })), {
  ssr: false,
  loading: () => <div className="bg-card border-border rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">Loading map...</div>,
})

export default function SiteProgressPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)

  const projectId = 1

  async function fetchProjectAndZones() {
    try {
      setLoading(true)

      // Fetch project details
      const projectRes = await fetch(`/api/project/${projectId}`, {
        cache: "no-store",
      })

      if (!projectRes.ok) {
        const projectData = await projectRes.json()
        console.error("Failed to fetch project:", projectData.error)
      } else {
        const projectData = await projectRes.json()
        setProject(projectData.project)
      }

      // Fetch zones
      const zonesRes = await fetch(`/api/project/${projectId}/zones`, {
        cache: "no-store",
      })

      const zonesData = await zonesRes.json()

      if (!zonesRes.ok) {
        throw new Error(zonesData.error || "Failed to fetch zones")
      }

      setZones(zonesData.zones || [])

      if (selectedZone) {
        const updatedSelectedZone = (zonesData.zones || []).find(
          (zone: Zone) => zone.zoneID === selectedZone.zoneID
        )
        setSelectedZone(updatedSelectedZone || null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectAndZones()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeafletMap
            zones={zones}
            project={project}
            loading={loading}
            onZoneSelect={setSelectedZone}
            selectedZoneId={selectedZone?.zoneID}
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