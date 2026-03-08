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
import { Plus, Pencil, Trash2, Search, Star } from 'lucide-react'
import TeamMemberDrawer from './TeamMemberDrawer'
import DeleteTeamMemberDialog from './DeleteTeamMemberDialog'
import type { TeamMember } from '@/lib/types'

interface TeamManagerProps {
  members: TeamMember[]
}

export default function TeamManager({ members }: TeamManagerProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)

  const filtered = members.filter((m) =>
    search.trim() === ''
      ? true
      : m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.role.toLowerCase().includes(search.toLowerCase()) ||
        (m.department ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditMember(null)
    setDrawerOpen(true)
  }

  const openEdit = (member: TeamMember) => {
    setEditMember(member)
    setDrawerOpen(true)
  }

  const openDelete = (member: TeamMember) => {
    setDeleteTarget(member)
    setDeleteDialogOpen(true)
  }

  const handleSaved = () => router.refresh()
  const handleDeleted = () => router.refresh()

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="border-zinc-700 bg-zinc-800 pl-9 text-white placeholder:text-zinc-500"
          />
        </div>

        <Button onClick={openCreate} className="bg-[--color-accent] text-white hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900 hover:bg-zinc-900">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Batch</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="w-24 text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                  {search
                    ? 'No team members match your search.'
                    : 'No team members yet. Add one above.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
                <TableRow key={member.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{member.full_name}</p>
                        {member.is_founding_member && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            Founder
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-zinc-200">{member.role}</p>
                      {member.department && (
                        <p className="text-xs text-zinc-500">{member.department}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-zinc-400">
                    {member.batch ?? '—'}
                  </TableCell>
                  <TableCell>
                    {member.is_active ? (
                      <Badge className="bg-emerald-900/40 text-emerald-400">Active</Badge>
                    ) : (
                      <Badge className="bg-zinc-800 text-zinc-400">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(member)}
                        className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                        aria-label={`Edit ${member.full_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDelete(member)}
                        className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-900/40 hover:text-red-400"
                        aria-label={`Remove ${member.full_name}`}
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

      <TeamMemberDrawer
        open={drawerOpen}
        member={editMember}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />

      <DeleteTeamMemberDialog
        open={deleteDialogOpen}
        member={deleteTarget}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
