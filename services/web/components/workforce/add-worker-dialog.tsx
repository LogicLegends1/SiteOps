"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, UserPlus } from "lucide-react"

interface AddWorkerDialogProps {
  projectId: string
  onWorkerAdded: () => void
}

const DISCIPLINES = [
  { value: "civil", label: "Civil" },
  { value: "electrical", label: "Electrical" },
  { value: "mechanical", label: "Mechanical" },
  { value: "qa", label: "QA/QC" },
  { value: "safety", label: "Safety" },
  { value: "general", label: "General" },
  { value: "it", label: "IT" },
]

const ROLES = [
  { value: "engineer", label: "Engineer" },
  { value: "supervisor", label: "Supervisor" },
  { value: "technician", label: "Technician" },
  { value: "operator", label: "Operator" },
  { value: "developer", label: "Developer" },
  { value: "system-admin", label: "System Admin" },
  { value: "skilled-labour", label: "Skilled Labour" },
  { value: "general-labour", label: "General Labour" },
]

export function AddWorkerDialog({ projectId, onWorkerAdded }: AddWorkerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !discipline || !role || !experience || !projectId) return

    setLoading(true)
    try {
      const numericProjectId = parseInt(projectId, 10)
      const res = await fetch(`/api/project/${projectId}/workforce/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          discipline,
          role,
          experience: parseInt(experience, 10),
          isavailable: true,
          teamid: null,
          project_id: numericProjectId,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to add worker")
      }

      setOpen(false)
      setName("")
      setDiscipline("")
      setRole("")
      setExperience("")
      onWorkerAdded()
    } catch (error) {
      console.error(error)
      // You could add toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 bg-primary text-primary-foreground">
          <UserPlus className="h-4 w-4" />
          Add Worker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
          <DialogDescription>
            Enter the details for the new worker. They will be added to this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discipline">Discipline</Label>
            <Select value={discipline} onValueChange={setDiscipline} required>
              <SelectTrigger id="discipline">
                <SelectValue placeholder="Select discipline" />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (Years)</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !discipline || !role || !experience}>
              {loading ? "Adding..." : "Save Worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
