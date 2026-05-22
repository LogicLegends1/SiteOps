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

export function getColorFromMap(map: Record<string, string>, key?: string, fallback = "text-zinc-400") {
  if (!key) return fallback
  return map[key] ?? fallback
}

export default {
  equipmentStatusColorMap,
  workforceRoleColorMap,
  getColorFromMap,
}
