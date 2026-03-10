'use client'

import dynamic from 'next/dynamic'

const CounterStrip = dynamic(() => import('./CounterStrip'), { ssr: false })

export default function CounterStripWrapper() {
  return <CounterStrip />
}
