'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MapLegendProps {
  showClients: boolean
  showPlants: boolean
  showNetworks: boolean
  hasHighlightedNetworks?: boolean
}

function LegendCircle({ fill, stroke, label }: { fill: string; stroke?: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{
          backgroundColor: fill,
          border: stroke ? `2px solid ${stroke}` : undefined,
        }}
      />
      <span className="text-[11px] text-foreground/80">{label}</span>
    </div>
  )
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 h-0.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-foreground/80">{label}</span>
    </div>
  )
}

export function MapLegend({ showClients, showPlants, showNetworks, hasHighlightedNetworks }: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (!showClients && !showPlants && !showNetworks) return null

  return (
    <div className="absolute bottom-8 left-3 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg text-xs max-w-52">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-3 py-2 font-semibold text-foreground"
      >
        Leyenda
        {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-2.5 space-y-3">
          {showClients && (
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Criticidad</p>
              <div className="space-y-1">
                <LegendCircle fill="#EF4444" label="Alta" />
                <LegendCircle fill="#F59E0B" label="Media" />
                <LegendCircle fill="#22C55E" label="Baja" />
              </div>
            </div>
          )}

          {showClients && (
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Tipo cliente</p>
              <div className="space-y-1">
                <LegendCircle fill="#94a3b8" stroke="#1E40AF" label="Industrial" />
                <LegendCircle fill="#94a3b8" stroke="#7C3AED" label="Comercial" />
                <LegendCircle fill="#94a3b8" stroke="#0D9488" label="Habitacional" />
                <LegendCircle fill="#94a3b8" stroke="#DC2626" label="Gobierno" />
              </div>
            </div>
          )}

          {showPlants && (
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Plantas</p>
              <LegendCircle fill="#10B981" label="Planta / Centro" />
            </div>
          )}

          {showNetworks && (
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Redes</p>
              <div className="space-y-1">
                <LegendLine color="#003a8e" label="Primaria" />
                <LegendLine color="#8B5CF6" label="Secundaria" />
                <LegendLine color="#F59E0B" label="Distribución" />
                <LegendLine color="#94A3B8" label="Conexión" />
              </div>
            </div>
          )}

          {hasHighlightedNetworks && (
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Red conectada</p>
              <LegendLine color="#FF6B35" label="Red cercana a instalación" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
