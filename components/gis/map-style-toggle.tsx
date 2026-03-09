'use client'

import { Map, Satellite } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STYLES = [
  { id: 'mapbox://styles/mapbox/light-v11', label: 'Calles', icon: Map },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satelite', icon: Satellite },
]

interface MapStyleToggleProps {
  current: string
  onChange: (style: string) => void
}

export function MapStyleToggle({ current, onChange }: MapStyleToggleProps) {
  return (
    <div className="flex items-center gap-1 px-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground mr-auto">
        Base Map
      </h3>
      {STYLES.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={current === id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(id)}
          className={`h-7 text-xs gap-1 ${
            current === id
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          <Icon className="h-3 w-3" />
          {label}
        </Button>
      ))}
    </div>
  )
}
