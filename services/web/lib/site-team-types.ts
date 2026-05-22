export type OnSiteMember = {
  id: string
  name: string
  initials: string
  role: string
  status: "online" | "away" | "offline"
  location: string
}
