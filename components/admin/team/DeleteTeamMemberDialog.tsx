'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { TeamMember } from '@/lib/types'

interface DeleteTeamMemberDialogProps {
  open: boolean
  member: TeamMember | null
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteTeamMemberDialog({
  open,
  member,
  onClose,
  onDeleted,
}: DeleteTeamMemberDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!member) return
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/team/${member.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Delete failed')
        return
      }
      onDeleted()
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Remove Team Member</DialogTitle>
          <DialogDescription className="text-zinc-400">
            This will mark <span className="font-semibold text-white">{member?.full_name}</span> as
            inactive and hide them from the public team page. They can be restored by re-activating.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
