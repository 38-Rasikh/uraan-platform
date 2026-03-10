'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterItem {
  label: string
  target: number
  suffix: string
  prefix?: string
}

const COUNTERS: CounterItem[] = [
  { label: 'Children Reached', target: 700, suffix: '+' },
  { label: 'Outreach Programs', target: 4, suffix: '' },
  { label: 'Skills Taught', target: 7, suffix: '' },
  { label: 'Students in 2025', target: 57, suffix: '+' },
]

function useCountUp(target: number, duration: number, triggered: boolean) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!triggered) return
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.floor(eased * target)
      setCurrent(value)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [triggered, target, duration])

  return current
}

function CounterCard({ item, triggered }: { item: CounterItem; triggered: boolean }) {
  const value = useCountUp(item.target, 1400, triggered)
  return (
    <div className="flex flex-col items-center px-8 py-6">
      <span className="font-display text-5xl font-bold text-[--color-accent] md:text-6xl">
        {item.prefix ?? ''}
        {value}
        {item.suffix}
      </span>
      <span className="mt-2 text-sm font-medium uppercase tracking-widest text-zinc-400">
        {item.label}
      </span>
    </div>
  )
}

export default function CounterStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="border-y border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800 md:grid-cols-4 md:divide-y-0">
          {COUNTERS.map((item) => (
            <CounterCard key={item.label} item={item} triggered={triggered} />
          ))}
        </div>
      </div>
    </div>
  )
}
