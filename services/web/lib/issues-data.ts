export type IssuePriority = "low" | "medium" | "high" | "critical"
export type IssueStatus = "open" | "in-progress" | "resolved"

export interface Issue {
  id: string
  activityID: number
  title: string
  description: string
  type: "material-delay" | "equipment-failure" | "labour-shortage" | "safety-issue" | "other"
  priority: IssuePriority
  status: IssueStatus
  owner: string
  createdAt: string
}

export const issues: Issue[] = [
  // ── Foundation Excavation (activityID 1) ──
  {
    id: "ISS-001",
    activityID: 1,
    title: "Excavator hydraulic line failure",
    description: "Main excavator CAT 320 has a burst hydraulic hose on the boom arm. Replacement part ordered from Caterpillar dealer — ETA 2 days. Backup mini-excavator re-deployed to maintain partial progress on trenching.",
    type: "equipment-failure",
    priority: "critical",
    status: "open",
    owner: "Kasun Silva",
    createdAt: "2026-05-22",
  },
  {
    id: "ISS-002",
    activityID: 1,
    title: "Unexpected rock layer at 3.5m depth",
    description: "Hard laterite rock encountered below design formation level in grid C2–C4. Requires pneumatic breaker attachment. Geotechnical engineer reviewing if redesign of footing depth is needed.",
    type: "other",
    priority: "high",
    status: "in-progress",
    owner: "Sunil Fernando",
    createdAt: "2026-05-20",
  },
  {
    id: "ISS-003",
    activityID: 1,
    title: "Insufficient tipper trucks for spoil removal",
    description: "Only 2 of 4 contracted tippers available this week — other 2 reassigned by haulage contractor without notice. Spoil stockpile exceeding designated area. Need to source additional trucks or negotiate priority with contractor.",
    type: "equipment-failure",
    priority: "medium",
    status: "open",
    owner: "Dulanjana Perera",
    createdAt: "2026-05-21",
  },

  // ── Piling Work (activityID 2) ──
  {
    id: "ISS-004",
    activityID: 2,
    title: "Pile driving rig crane not operational",
    description: "Crawler crane (50T Kobelco) failed load test during morning inspection. Boom cable shows signs of fraying at sheave block. Crane operator has red-tagged the machine. Replacement crane mobilisation will take 3–4 days.",
    type: "equipment-failure",
    priority: "critical",
    status: "open",
    owner: "Maintenance Team",
    createdAt: "2026-05-23",
  },
  {
    id: "ISS-005",
    activityID: 2,
    title: "Not enough workers for double-shift piling",
    description: "Current crew of 8 is insufficient to run the planned double shift. Need at least 6 additional skilled pile crew members. HR has posted for temp labour but availability is low due to competing projects in the area.",
    type: "labour-shortage",
    priority: "high",
    status: "in-progress",
    owner: "HR Coordinator",
    createdAt: "2026-05-19",
  },
  {
    id: "ISS-006",
    activityID: 2,
    title: "Pile integrity test results pending",
    description: "PDA test results for piles P12–P18 still awaited from the testing lab. Cannot proceed with pile cap construction until results confirm design capacity. Lab promised results by end of week.",
    type: "other",
    priority: "medium",
    status: "open",
    owner: "QA Lead",
    createdAt: "2026-05-21",
  },

  // ── Rebar Installation (activityID 3) ──
  {
    id: "ISS-007",
    activityID: 3,
    title: "Rebar delivery delayed — supplier stock-out",
    description: "16mm and 20mm TMT bars (Grade 500) are out of stock at primary supplier. Alternative supplier quoted 40% premium. Procurement negotiating with two backup vendors. Current site stock covers only 2 more days of work.",
    type: "material-delay",
    priority: "critical",
    status: "open",
    owner: "Procurement",
    createdAt: "2026-05-24",
  },
  {
    id: "ISS-008",
    activityID: 3,
    title: "Rebar spacing non-compliance on grid B",
    description: "QC inspection found stirrup spacing at 200mm instead of specified 150mm on beams B3–B7. Structural engineer requires rectification before concrete pour. Estimated 1.5 days rework for the affected 12 beams.",
    type: "safety-issue",
    priority: "high",
    status: "in-progress",
    owner: "QA Lead",
    createdAt: "2026-05-22",
  },
  {
    id: "ISS-009",
    activityID: 3,
    title: "Rebar bending machine motor burnout",
    description: "Bar bending machine overheated and motor seized during 32mm bar bending. Electrician confirmed motor winding damage. Portable backup machine deployed but has lower capacity (max 25mm).",
    type: "equipment-failure",
    priority: "medium",
    status: "in-progress",
    owner: "Kasun Silva",
    createdAt: "2026-05-20",
  },

  // ── Concrete Pouring (activityID 4) ──
  {
    id: "ISS-010",
    activityID: 4,
    title: "Concrete batch plant calibration overdue",
    description: "Monthly calibration of the on-site batching plant was missed. QA has flagged that the last 3 pours need cube test verification before sign-off. Plant operations suspended until calibration is completed.",
    type: "safety-issue",
    priority: "high",
    status: "resolved",
    owner: "QA Lead",
    createdAt: "2026-05-10",
  },
  {
    id: "ISS-011",
    activityID: 4,
    title: "Transit mixer broke down during pour",
    description: "Concrete transit mixer #3 had drum rotation failure mid-pour on slab S2. Approximately 2m³ of concrete was wasted as it began setting in the drum. Insurance claim filed.",
    type: "equipment-failure",
    priority: "medium",
    status: "resolved",
    owner: "Sunil Fernando",
    createdAt: "2026-05-08",
  },

  // ── Electrical Conduit (activityID 5) ──
  {
    id: "ISS-012",
    activityID: 5,
    title: "Conduit route conflicts with drainage line",
    description: "Electrical conduit route at grid E4 clashes with the 225mm stormwater pipe at 1.2m depth. MEP coordinator needs to revise routing — either raise conduit to 0.8m or reroute around the drain. Design revision meeting scheduled for tomorrow.",
    type: "other",
    priority: "high",
    status: "open",
    owner: "MEP Coordinator",
    createdAt: "2026-05-23",
  },
  {
    id: "ISS-013",
    activityID: 5,
    title: "Electricians shortage — 3 workers absent",
    description: "3 of 8 licensed electricians called in sick (suspected food poisoning from site canteen). Remaining crew cannot safely handle live termination work. Work limited to conduit laying only until full team returns.",
    type: "labour-shortage",
    priority: "medium",
    status: "open",
    owner: "HR Coordinator",
    createdAt: "2026-05-24",
  },
  {
    id: "ISS-014",
    activityID: 5,
    title: "Wrong conduit diameter delivered",
    description: "Supplier delivered 20mm conduit instead of specified 32mm for main feeder routes. 200 lengths need to be returned and exchanged. Correct stock available at supplier warehouse — exchange truck dispatched.",
    type: "material-delay",
    priority: "low",
    status: "in-progress",
    owner: "Procurement",
    createdAt: "2026-05-22",
  },

  // ── Drainage Installation (activityID 6) ──
  {
    id: "ISS-015",
    activityID: 6,
    title: "Trench collapse after heavy rain",
    description: "Overnight rainfall (42mm) caused partial collapse of the 2.5m deep drainage trench along line D2. Shoring timbers displaced. Area cordoned off. Safety officer requires full re-shoring and soil stability check before workers re-enter.",
    type: "safety-issue",
    priority: "critical",
    status: "open",
    owner: "Safety Officer",
    createdAt: "2026-05-24",
  },
  {
    id: "ISS-016",
    activityID: 6,
    title: "Pipe jointing adhesive expired",
    description: "Batch of PVC solvent cement found to be past expiry date (expired March 2026). 15 joints made with this batch need pressure testing to verify integrity. Fresh stock ordered — arriving tomorrow.",
    type: "material-delay",
    priority: "high",
    status: "in-progress",
    owner: "QA Lead",
    createdAt: "2026-05-23",
  },
  {
    id: "ISS-017",
    activityID: 6,
    title: "Dewatering pump insufficient for water table",
    description: "Water table higher than survey indicated at drain line D4 (0.8m vs expected 1.5m). Current 2-inch pump cannot keep up. Need to deploy a 4-inch diesel pump. Equipment yard has one available — transport arranged for morning.",
    type: "equipment-failure",
    priority: "medium",
    status: "in-progress",
    owner: "Dulanjana Perera",
    createdAt: "2026-05-22",
  },
]

// Human-readable names for the hard-coded issue activityIDs (1-6).
// These are used when the activityID doesn't match any fetched activity zoneID.
export const issueActivityNames: Record<number, string> = {
  1: "Foundation Excavation",
  2: "Piling Work",
  3: "Rebar Installation",
  4: "Concrete Pouring",
  5: "Electrical Conduit",
  6: "Drainage Installation",
}

export function getIssuesByActivityId(activityID: number) {
  return issues.filter((issue) => issue.activityID === activityID)
}

export function getPriorityColor(priority: IssuePriority) {
  switch (priority) {
    case "critical":
      return "bg-red-600/20 text-red-400"
    case "high":
      return "bg-destructive/20 text-destructive"
    case "medium":
      return "bg-warning/20 text-warning"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getIssueStatusColor(status: IssueStatus) {
  switch (status) {
    case "resolved":
      return "bg-success/20 text-success"
    case "in-progress":
      return "bg-primary/20 text-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
}