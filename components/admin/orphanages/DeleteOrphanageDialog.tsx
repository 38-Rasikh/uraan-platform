'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteOrphanageDialogProps {
  open: boolean
  orphanageName: string
  orphanageId: string
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteOrphanageDialog({
  open,
  orphanageName,
  orphanageId,
  onClose,
  onDeleted,
}: DeleteOrphanageDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/v1/orphanages/${orphanageId}`, { method: 'DELETE' })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to delete orphanage')
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
      <DialogContent className="border-zinc-700 bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Orphanage</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-zinc-200">{orphanageName}</span> from the directory?
            This is a soft delete — the record will be hidden but not permanently removed.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded border border-red-800 bg-red-900/40 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-700 text-white hover:bg-red-800"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
