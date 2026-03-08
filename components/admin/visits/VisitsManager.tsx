'use client'

import { useState } from 'react'
import VisitForm from '@/components/admin/visits/VisitForm'
import VisitTable from '@/components/admin/visits/VisitTable'
import type { Orphanage, Project } from '@/lib/types'

interface VisitsManagerProps {
  orphanages: Pick<Orphanage, 'id' | 'name' | 'area'>[]
  projects: Pick<Project, 'id' | 'title'>[]
}

export default function VisitsManager({ orphanages, projects }: VisitsManagerProps) {
  // Increment to signal VisitTable to reload
  const [refreshSignal, setRefreshSignal] = useState(0)

  function handleVisitLogged() {
    setRefreshSignal((n) => n + 1)
  }

  return (
    <div className="space-y-8">
      <VisitForm orphanages={orphanages} projects={projects} onSuccess={handleVisitLogged} />
      <VisitTable orphanages={orphanages} refreshSignal={refreshSignal} />
    </div>
  )
}
