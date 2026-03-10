'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartEntry {
  month: string
  visits: number
}

export default function VisitsBarChart({ data }: { data: ChartEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#a1a1aa', fontSize: 12 }}
          axisLine={{ stroke: '#3f3f46' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#a1a1aa', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            borderColor: '#3f3f46',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(232,98,10,0.08)' }}
          formatter={(value) => {
            const v = Number(value ?? 0)
            return [`${v} visit${v !== 1 ? 's' : ''}`, 'Visits']
          }}
        />
        <Bar dataKey="visits" fill="#e8620a" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
