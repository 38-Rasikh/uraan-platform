'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import DirectoryFilters from './DirectoryFilters'

interface MobileFilterSheetProps {
  search: string
  areas: string[]
  orgTypes: string[]
  isRegistered: string
  uraanVisited: string
  acceptsDonations: string
  acceptsVolunteers: string
}

export default function MobileFilterSheet(props: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex items-center gap-2 rounded-md border border-[--color-border] px-3 py-1.5 text-sm text-[--color-text-secondary] transition-colors hover:bg-[--color-surface-alt] hover:text-[--color-text-primary] lg:hidden"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 overflow-y-auto bg-[--color-bg] p-0"
        aria-label="Directory filters"
      >
        <SheetHeader className="border-b border-[--color-border] px-4 py-3">
          <SheetTitle className="text-left text-[--color-text-primary]">Filters</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <DirectoryFilters {...props} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
