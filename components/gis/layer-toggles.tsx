'use client'

import { Switch } from '@/components/ui/switch'
import { MapPin, Factory, Cable } from 'lucide-react'

interface LayerTogglesProps {
  layers: { clients: boolean; plants: boolean; networks: boolean }
  onToggle: (layer: 'clients' | 'plants' | 'networks') => void
}

const layerConfig = [
  { key: 'clients' as const, label: 'Clientes', icon: MapPin, color: 'bg-primary' },
  { key: 'plants' as const, label: 'Plantas / Oficinas', icon: Factory, color: 'bg-emerald-500' },
  { key: 'networks' as const, label: 'Redes', icon: Cable, color: 'bg-violet-500' },
]

export function LayerToggles({ layers, onToggle }: LayerTogglesProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground px-1 mb-2">
        Capas
      </h3>
      {layerConfig.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-md px-2.5 py-2 hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <Icon className="h-4 w-4 text-sidebar-muted-foreground" />
            <span className="text-sm text-sidebar-foreground">{label}</span>
          </div>
          <Switch
            checked={layers[key]}
            onCheckedChange={() => onToggle(key)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      ))}
    </div>
  )
}
