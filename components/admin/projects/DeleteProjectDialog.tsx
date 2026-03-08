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
import type { Project } from '@/lib/types'

interface DeleteProjectDialogProps {
  open: boolean
  project: Project | null
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteProjectDialog({
  open,
  project,
  onClose,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!project) return
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/projects/${project.id}`, { method: 'DELETE' })
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
          <DialogTitle className="text-white">Delete Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-white">{project?.title}</span>? This action cannot
            be undone.
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
