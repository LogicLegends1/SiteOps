"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight } from "lucide-react"

// Mock data based on the screenshot
const activities = [
  {
    id: 1,
    name: "Excavate Zone A Foundation",
    zone: "Zone A",
    team: "Excavation Team A",
    assigned: 12,
    required: 14,
    status: "SHORTAGE",
    statusDetail: "-2 workers",
    statusColor: "text-red-500",
    progressValue: 86,
    progressColor: "bg-blue-500",
    roles: { engineers: 3, operators: 3, skilled: 2, general: 4 },
    detailedRoles: [
      { name: "Site Engineer", count: 2 },
      { name: "Surveyor", count: 1 },
      { name: "Excavator Operator", count: 2 },
      { name: "Tipper Operator", count: 1 },
      { name: "Mason", count: 2 },
      { name: "General Helpers", count: 4 },
    ]
  },
  {
    id: 2,
    name: "Concrete Piling - Pier Caps",
    zone: "Pier Line B",
    team: "Piling Team A",
    assigned: 12,
    required: 12,
    status: "BALANCED",
    statusDetail: "On target",
    statusColor: "text-emerald-500",
    progressValue: 100,
    progressColor: "bg-blue-500",
    roles: { engineers: 2, operators: 6, skilled: 2, general: 2 },
    detailedRoles: [
      { name: "Site Engineer", count: 1 },
      { name: "Surveyor", count: 1 },
      { name: "Crawler Crane Operator", count: 2 },
      { name: "Excavator Operator", count: 4 },
      { name: "Mason", count: 2 },
      { name: "General Helpers", count: 2 },
    ]
  },
  {
    id: 3,
    name: "Deck Formwork & Pour",
    zone: "Span C",
    team: "Deck Crew Charlie",
    assigned: 11,
    required: 11,
    status: "BALANCED",
    statusDetail: "On target",
    statusColor: "text-emerald-500",
    progressValue: 100,
    progressColor: "bg-blue-500",
    roles: { engineers: 1, operators: 4, skilled: 3, general: 3 },
    detailedRoles: [
      { name: "Site Engineer", count: 1 },
      { name: "Tower Crane Operator", count: 2 },
      { name: "Excavator Operator", count: 2 },
      { name: "Carpenter", count: 2 },
      { name: "Steel Fixer", count: 1 },
      { name: "General Helpers", count: 3 },
    ]
  },
  {
    id: 4,
    name: "Drainage Installation",
    zone: "Zone A",
    team: "Drainage Crew A",
    assigned: 3,
    required: 5,
    status: "SHORTAGE",
    statusDetail: "-2 workers",
    statusColor: "text-red-500",
    progressValue: 60,
    progressColor: "bg-blue-500",
    roles: { engineers: 1, operators: 1, skilled: 1, general: 0 },
    detailedRoles: [
      { name: "Site Engineer", count: 1 },
      { name: "Excavator Operator", count: 1 },
      { name: "Mason", count: 1 },
    ]
  },
  {
    id: 5,
    name: "Electrical Conduit",
    zone: "Zone B",
    team: "Electrical Team A",
    assigned: 8,
    required: 10,
    status: "SHORTAGE",
    statusDetail: "-2 workers",
    statusColor: "text-red-500",
    progressValue: 80,
    progressColor: "bg-blue-500",
    roles: { engineers: 1, operators: 0, skilled: 2, general: 5 },
    detailedRoles: [
      { name: "Site Engineer", count: 1 },
      { name: "Electrician", count: 2 },
      { name: "General Helpers", count: 5 },
    ]
  },
  {
    id: 6,
    name: "Rebar Installation",
    zone: "Pier Line B",
    team: "Rebar Team A",
    assigned: 15,
    required: 12,
    status: "OVER CAPACITY",
    statusDetail: "+3 workers",
    statusColor: "text-amber-500",
    progressValue: 125,
    progressColor: "bg-amber-500",
    roles: { engineers: 1, operators: 2, skilled: 6, general: 6 },
    detailedRoles: [
      { name: "Site Engineer", count: 1 },
      { name: "Tower Crane Operator", count: 2 },
      { name: "Steel Fixer", count: 6 },
      { name: "General Helpers", count: 6 },
    ]
  },
]

const roleAvailability = [
  { role: "Engineers", active: 10, idle: 0, unavailable: 2, total: 12, progress: (10/12)*100, color: "bg-blue-500" },
  { role: "Operators", active: 22, idle: 1, unavailable: 3, total: 26, progress: (22/26)*100, color: "bg-amber-500" },
  { role: "Skilled Labour", active: 24, idle: 0, unavailable: 2, total: 26, progress: (24/26)*100, color: "bg-emerald-500" },
  { role: "General Labour", active: 16, idle: 0, unavailable: 3, total: 19, progress: (16/19)*100, color: "bg-zinc-400" },
]

const teamUtilization = [
  { team: "Excavation Team A", utilization: "86%", status: "High", statusColor: "text-amber-500", progress: 86, color: "bg-blue-500" },
  { team: "Piling Team A", utilization: "100%", status: "Optimal", statusColor: "text-emerald-500", progress: 100, color: "bg-blue-500" },
  { team: "Deck Crew Charlie", utilization: "100%", status: "Optimal", statusColor: "text-emerald-500", progress: 100, color: "bg-blue-500" },
  { team: "Electrical Team A", utilization: "80%", status: "High", statusColor: "text-amber-500", progress: 80, color: "bg-blue-500" },
  { team: "Rebar Team A", utilization: "125%", status: "Over Capacity", statusColor: "text-red-500", progress: 100, color: "bg-amber-500" },
]

const upcomingCommitments = [
  { week: "May 26 - Jun 1", workers: 78, progress: 78 },
  { week: "Jun 2 - Jun 8", workers: 84, progress: 84 },
  { week: "Jun 9 - Jun 15", workers: 92, progress: 92 },
  { week: "Jun 16 - Jun 22", workers: 80, progress: 80 },
]

const gapAlerts = [
  {
    activity: "Excavate Zone A Foundation",
    zone: "Zone A",
    team: "Excavation Team A",
    missing: "Missing: 2 General Labours",
    alert: "-4 activities",
    alertSub: "-2 workers",
  },
  {
    activity: "Drainage Installation",
    zone: "Zone A",
    team: "Drainage Crew A",
    missing: "Missing: 1 Operator, 1 General Labour",
    alertSub: "-2 workers",
  },
  {
    activity: "Electrical Conduit",
    zone: "Zone B",
    team: "Electrical Team A",
    missing: "Missing: 2 General Labours",
    alertSub: "-2 workers",
  },
  {
    activity: "Concrete Piling - Pier Caps",
    zone: "Pier Line B",
    team: "Piling Team A",
    missing: "1 role near capacity",
    alertSub: "Watch",
    isWatch: true,
  },
]

const pendingRequests = [
  { title: "Drainage Installation - Zone A", reqBy: "Rohan G.", time: "2h ago", count: "3 workers" },
  { title: "Excavate Zone A Foundation", reqBy: "James R.", time: "4h ago", count: "2 workers" },
  { title: "Electrical Conduit - Zone B", reqBy: "Chamara W.", time: "6h ago", count: "1 worker" },
]

export function WorkforceOverviewNewTab() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full">
      {/* Left Column - Takes approx 70% width */}
      <div className="flex flex-col w-full lg:w-[70%] gap-4">
        {/* Activity Workforce Distribution Table */}
        <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-zinc-800/60">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Activity Workforce Distribution</CardTitle>
              <p className="text-xs text-zinc-400 mt-1">Overview of assigned vs required workers by activity</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400">6 Activities</span>
              <button className="text-xs text-white bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-colors">View all</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-visible">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] text-zinc-500 uppercase font-semibold border-b border-zinc-800/60">
                  <tr>
                    <th className="px-6 py-3 font-medium">Activity & Zone</th>
                    <th className="px-6 py-3 font-medium">Assigned Team</th>
                    <th className="px-6 py-3 font-medium">Assigned / Required</th>
                    <th className="px-6 py-3 font-medium">Capacity Status</th>
                    <th className="px-6 py-3 font-medium">Role Breakdown</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {activities.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            item.id === 1 ? 'bg-cyan-500/10 text-cyan-500' : 
                            item.id === 2 ? 'bg-purple-500/10 text-purple-500' :
                            item.id === 3 ? 'bg-yellow-500/10 text-yellow-500' :
                            item.id === 4 ? 'bg-blue-500/10 text-blue-500' :
                            item.id === 5 ? 'bg-green-500/10 text-green-500' :
                            'bg-orange-500/10 text-orange-500'
                          }`}>
                            <div className="w-4 h-4 bg-current rounded-sm" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{item.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{item.zone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 text-[10px] font-normal hover:bg-cyan-500/10 px-2 py-0.5">
                          {item.team}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                            {item.assigned} / {item.required}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 min-w-[24px]">{item.progressValue}%</span>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full ${item.progressColor}`} style={{ width: `${Math.min(item.progressValue, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold ${item.statusColor}`}>{item.status}</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">{item.statusDetail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="relative group/tooltip inline-block">
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-bold">E</div><span className="text-[11px] text-zinc-300">{item.roles.engineers}</span></div>
                            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">O</div><span className="text-[11px] text-zinc-300">{item.roles.operators}</span></div>
                            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">S</div><span className="text-[11px] text-zinc-300">{item.roles.skilled}</span></div>
                            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-zinc-600 text-white text-[9px] flex items-center justify-center font-bold">G</div><span className="text-[11px] text-zinc-300">{item.roles.general}</span></div>
                          </div>
                          
                          {/* Hover Tooltip Popup */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-72 p-5 bg-zinc-950/95 border-2 border-zinc-700/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] hidden group-hover/tooltip:block z-50 pointer-events-none animate-in fade-in slide-in-from-right-2 duration-150 backdrop-blur-md">
                            <div className="text-xs font-bold text-white/90 uppercase tracking-wider mb-3.5 border-b border-zinc-800 pb-2 flex justify-between items-center">
                              <span>Detailed Role Breakdown</span>
                              <span className="text-[10px] text-zinc-500 font-normal">On-Site Workers</span>
                            </div>
                            <div className="flex flex-col gap-2.5 text-sm text-zinc-300">
                              {item.detailedRoles?.map((role, rIdx) => {
                                let initial = "G"
                                let bg = "bg-zinc-600"
                                if (role.name.includes("Engineer")) {
                                  initial = "E"
                                  bg = "bg-blue-500"
                                } else if (role.name.includes("Operator")) {
                                  initial = "O"
                                  bg = "bg-amber-500"
                                } else if (role.name.includes("Surveyor")) {
                                  initial = "S"
                                  bg = "bg-teal-500"
                                } else if (["Mason", "Carpenter", "Steel Fixer", "Electrician"].includes(role.name)) {
                                  initial = "S"
                                  bg = "bg-emerald-500"
                                } else {
                                  initial = "H"
                                  bg = "bg-zinc-500"
                                }
                                return (
                                  <div key={rIdx} className="flex justify-between items-center py-0.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-5 h-5 rounded-full ${bg} text-white text-[10px] flex items-center justify-center font-bold shadow-sm`}>
                                        {initial}
                                      </div>
                                      <span className="font-medium">{role.name}</span>
                                    </div>
                                    <span className="font-bold text-white text-base bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/40 min-w-[24px] text-center">{role.count}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 px-6 py-4 border-t border-zinc-800/60">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 text-white text-[7px] flex items-center justify-center font-bold">E</div><span className="text-[10px] text-zinc-400">Engineers</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 text-white text-[7px] flex items-center justify-center font-bold">O</div><span className="text-[10px] text-zinc-400">Operators</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 text-white text-[7px] flex items-center justify-center font-bold">S</div><span className="text-[10px] text-zinc-400">Skilled Labour</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-600 text-white text-[7px] flex items-center justify-center font-bold">G</div><span className="text-[10px] text-zinc-400">General Labour</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workforce Availability by Role */}
          <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-zinc-800/60">
              <CardTitle className="text-[11px] font-semibold text-white">Workforce Availability by Role</CardTitle>
              <button className="text-[10px] text-zinc-400 hover:text-white">View all</button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 gap-y-2 text-[10px]">
                <div className="text-zinc-500 font-medium uppercase">Role</div>
                <div className="text-zinc-500 font-medium uppercase text-center">Active</div>
                <div className="text-zinc-500 font-medium uppercase text-center">Idle</div>
                <div className="text-zinc-500 font-medium uppercase text-center">Unavailable</div>
                <div className="text-zinc-500 font-medium uppercase text-right">Total</div>
                
                {roleAvailability.map((role, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300">{role.role}</span>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden min-w-[20px] ml-1">
                        <div className={`h-full ${role.color}`} style={{ width: `${role.progress}%` }} />
                      </div>
                    </div>
                    <div className="text-center text-white">{role.active}</div>
                    <div className="text-center text-zinc-400">{role.idle}</div>
                    <div className="text-center text-zinc-400">{role.unavailable}</div>
                    <div className="text-right text-white font-medium">{role.total}</div>
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Utilization */}
          <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-zinc-800/60">
              <CardTitle className="text-[11px] font-semibold text-white">Team Utilization</CardTitle>
              <button className="text-[10px] text-zinc-400 hover:text-white">View all</button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2.5 text-[10px]">
                <div className="text-zinc-500 font-medium uppercase">Team</div>
                <div className="text-zinc-500 font-medium uppercase text-left">Utilization</div>
                <div className="text-zinc-500 font-medium uppercase text-right">Status</div>
                
                {teamUtilization.map((team, idx) => (
                  <React.Fragment key={idx}>
                    <div className="text-zinc-300">{team.team}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white w-8">{team.utilization}</span>
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${team.color}`} style={{ width: `${team.progress}%` }} />
                      </div>
                    </div>
                    <div className={`text-right ${team.statusColor}`}>{team.status}</div>
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Workforce Commitments */}
          <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-zinc-800/60">
              <CardTitle className="text-[11px] font-semibold text-white">Upcoming Workforce Commitments</CardTitle>
              <select className="bg-transparent border-none text-[10px] text-zinc-400 outline-none pr-1">
                <option>Next 4 Weeks</option>
              </select>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-[10px]">
                <div className="text-zinc-500 font-medium uppercase">Week</div>
                <div className="text-zinc-500 font-medium uppercase">Forecasted Workers</div>
                
                {upcomingCommitments.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="text-zinc-300 whitespace-nowrap">{item.week}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white w-4">{item.workers}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Takes approx 30% width */}
      <div className="flex flex-col w-full lg:w-[30%] gap-4">
        {/* Pending Worker Requests */}
        <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between py-3.5 px-5 border-b border-zinc-800/60">
            <CardTitle className="text-xs font-semibold text-white">Pending Worker Requests</CardTitle>
            <span className="text-[10px] text-cyan-500 font-medium">6 requests</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {pendingRequests.map((req, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 py-3 px-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-medium text-white">{req.title}</div>
                    <span className="text-[10px] font-medium text-cyan-500">{req.count}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Requested by <span className="text-zinc-400">{req.reqBy}</span> • {req.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="py-2 px-5 border-t border-zinc-800/60">
            <button className="text-[11px] text-zinc-400 hover:text-white font-medium flex items-center justify-between w-full">
              View all requests
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* Allocation Gap Alerts */}
        <Card className="bg-[#11141D] border-zinc-800/60 rounded-xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-zinc-800/60">
            <CardTitle className="text-sm font-semibold text-white">Allocation Gap Alerts</CardTitle>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-medium px-2 py-0 rounded-full">
              -4 activities
            </Badge>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {gapAlerts.map((alert, idx) => (
                <div key={idx} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${alert.isWatch ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="text-xs font-semibold text-white">{alert.activity}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{alert.zone} • {alert.team}</div>
                        <div className="text-[10px] text-zinc-400 mt-1">{alert.missing}</div>
                      </div>
                    </div>
                    {alert.alertSub && (
                      <Badge variant="outline" className={`text-[9px] font-medium px-1.5 py-0 border-0 ${alert.isWatch ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                        {alert.alertSub}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="py-2.5 px-5 border-t border-zinc-800/60">
            <button className="text-[11px] text-cyan-500 hover:text-cyan-400 font-medium flex items-center justify-between w-full">
              View all alerts
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
