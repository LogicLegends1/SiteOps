export type TeamMemberStatus = "online" | "away" | "offline"

export interface TeamMemberOnSite {
  id: string
  name: string
  initials: string
  role: string
  status: TeamMemberStatus
  location: string
}

/** Dummy on-site roster until workforce ↔ activity DB wiring is added. */
export const teamOnSite: TeamMemberOnSite[] = [
  {
    id: "tm-1",
    name: "John Smith",
    initials: "JS",
    role: "Site Manager",
    status: "online",
    location: "Site A - Foundation",
  },
  {
    id: "tm-2",
    name: "Maria Garcia",
    initials: "MG",
    role: "Foreman",
    status: "online",
    location: "Site B - Piling",
  },
  {
    id: "tm-3",
    name: "David Chen",
    initials: "DC",
    role: "Safety Officer",
    status: "online",
    location: "Site A - Foundation",
  },
  {
    id: "tm-4",
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Engineer",
    status: "away",
    location: "Office - Planning",
  },
]

export function getTeamStatusSummary(members: TeamMemberOnSite[]) {
  const online = members.filter((m) => m.status === "online").length
  const away = members.filter((m) => m.status === "away").length
  return { online, away, total: members.length }
}
