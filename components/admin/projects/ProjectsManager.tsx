'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Search, Globe, EyeOff } from 'lucide-react'
import ProjectDrawer from './ProjectDrawer'
import DeleteProjectDialog from './DeleteProjectDialog'
import type { Project } from '@/lib/types'

interface ProjectsManagerProps {
  projects: Project[]
}

export default function ProjectsManager({ projects }: ProjectsManagerProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const filtered = projects.filter((p) =>
    search.trim() === ''
      ? true
      : p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditProject(null)
    setDrawerOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditProject(project)
    setDrawerOpen(true)
  }

  const openDelete = (project: Project) => {
    setDeleteTarget(project)
    setDeleteDialogOpen(true)
  }

  const handleSaved = () => {
    router.refresh()
  }

  const handleDeleted = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="border-zinc-700 bg-zinc-800 pl-9 text-white placeholder:text-zinc-500"
          />
        </div>

        <Button onClick={openCreate} className="bg-[--color-accent] text-white hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900 hover:bg-zinc-900">
              <TableHead className="text-zinc-400">Title</TableHead>
              <TableHead className="text-zinc-400">Start Date</TableHead>
              <TableHead className="text-zinc-400">Children Reached</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="w-24 text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                  {search ? 'No projects match your search.' : 'No projects yet. Add one above.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((project) => (
                <TableRow key={project.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{project.title}</p>
                      <p className="font-mono text-xs text-zinc-500">{project.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {project.date_start
                      ? new Date(project.date_start).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-zinc-300">{project.children_reached ?? '—'}</TableCell>
                  <TableCell>
                    {project.is_published ? (
                      <Badge className="flex w-fit items-center gap-1 bg-emerald-900/40 text-emerald-400">
                        <Globe className="h-3 w-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge className="flex w-fit items-center gap-1 bg-zinc-800 text-zinc-400">
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(project)}
                        className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDelete(project)}
                        className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-900/40 hover:text-red-400"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDrawer
        open={drawerOpen}
        project={editProject}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        project={deleteTarget}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
