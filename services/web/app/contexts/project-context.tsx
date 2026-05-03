"use client"

import { createContext, useContext } from "react"

enum ProjectStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export type Project = {
  projectID: number
  name: string
  locationLongitude: number | null
  locationLatitude: number | null
  projectDiagram: string | null
  status: ProjectStatus
  description: string | null
  siteImagePath: string | null
  createdAt: string
  updatedAt: string
}

export const ProjectContext = createContext<{ 
  project: Project | null
  userName: string
} | undefined>(undefined)

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectContext.Provider")
  }
  return context
}
