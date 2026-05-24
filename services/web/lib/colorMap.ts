export const equipmentStatusColorMap: Record<string, string> = {
  active: "text-emerald-500",
  idle: "text-amber-500",
  maintenance: "text-purple-500",
  down: "text-red-500",
  unassigned: "text-zinc-500",
}

export const workforceRoleColorMap: Record<string, string> = {
  supervisor: "text-emerald-500",
  technician: "text-amber-500",
  operator: "text-cyan-500",
  "skilled-labour": "text-purple-500",
  engineer: "text-blue-500",
  developer: "text-red-500",
  "system-admin": "text-yellow-500",
  "general-labour": "text-zinc-500",
}

// Civil
// Electrical
// Qa
// Electrical
// Mechanical
// IT
// Civil
export const workforceDisciplineColorMap: Record<string, string> = {
  Civil: "text-emerald-500",
  Electrical: "text-white-500",
  Mechanical: "text-cyan-500",
  QA: "text-purple-500",
  Safety: "text-red-500",
  General: "text-zinc-500",
  IT: "text-yellow-500",
}

export function getColorFromMap(map: Record<string, string>, key?: string, fallback = "text-zinc-400") {
  if (!key) return fallback
  return map[key] ?? fallback
}

export default {
  equipmentStatusColorMap,
  workforceRoleColorMap,
  workforceDisciplineColorMap,
  getColorFromMap,
}
