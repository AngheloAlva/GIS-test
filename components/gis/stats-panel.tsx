'use client'

import { Users, AlertTriangle, FileX, Factory } from 'lucide-react'
import type { StatsData } from '@/types/gis'

interface StatsPanelProps {
  stats: StatsData | null
  isLoading: boolean
}

export function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  const items = [
    {
      label: 'Clientes en zona',
      value: stats?.clients_in_zone ?? 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Criticos',
      value: stats?.critical_in_zone ?? 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Sin documentos',
      value: stats?.missing_docs ?? 0,
      icon: FileX,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Plantas',
      value: stats?.plants_in_zone ?? 0,
      icon: Factory,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground px-1 mb-2">
        Indicadores
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg bg-sidebar-accent p-2.5"
          >
            <div className={`rounded-md p-1.5 ${bg}`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-sidebar-foreground leading-none">
                {isLoading ? '...' : value}
              </p>
              <p className="text-[10px] text-sidebar-muted-foreground leading-tight mt-0.5 truncate">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
