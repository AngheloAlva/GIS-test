'use client'

import { useEffect, useState } from 'react'
import { Crosshair, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchClientsWithinRadius } from '@/lib/api-client'
import type { LayerFilters } from '@/types/gis'

interface RadiusToolProps {
  radiusMode: boolean
  onToggleRadiusMode: () => void
  radiusCenter: { lng: number; lat: number } | null
  radiusMeters: number
  onRadiusMetersChange: (m: number) => void
  filters: LayerFilters
  onClientClick: (id: number) => void
  onRadiusResults: (results: RadiusClient[]) => void
}

interface RadiusClient {
  id: number
  code: string
  name: string
  criticality: string
  client_type: string
  status: string
  lng: number
  lat: number
  distance_m: number
}

export function RadiusTool({
  radiusMode,
  onToggleRadiusMode,
  radiusCenter,
  radiusMeters,
  onRadiusMetersChange,
  filters,
  onClientClick,
  onRadiusResults,
}: RadiusToolProps) {
  const [results, setResults] = useState<RadiusClient[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!radiusCenter) {
      setResults([])
      setTotal(0)
      onRadiusResults([])
      return
    }
    setIsLoading(true)
    fetchClientsWithinRadius(radiusCenter.lat, radiusCenter.lng, radiusMeters, filters)
      .then((data) => {
        setResults(data.clients)
        setTotal(data.total)
        onRadiusResults(data.clients)
      })
      .finally(() => setIsLoading(false))
  }, [radiusCenter, radiusMeters, filters, onRadiusResults])

  const critCounts = results.reduce(
    (acc, c) => {
      acc[c.criticality] = (acc[c.criticality] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground px-1">
          Consulta de Radio
        </h3>
        <Button
          variant={radiusMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleRadiusMode}
          className={`h-7 text-xs gap-1.5 ${
            radiusMode
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          {radiusMode ? (
            <>
              <X className="h-3 w-3" />
              Cancelar
            </>
          ) : (
            <>
              <Crosshair className="h-3 w-3" />
              Activar
            </>
          )}
        </Button>
      </div>

      {radiusMode && (
        <p className="text-xs text-primary px-1">
          Haz clic en el mapa para definir el centro del radio
        </p>
      )}

      {radiusCenter && (
        <>
          <div className="px-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sidebar-muted-foreground">Radio</span>
              <span className="text-xs font-medium text-sidebar-foreground">
                {radiusMeters >= 1000
                  ? `${(radiusMeters / 1000).toFixed(1)} km`
                  : `${radiusMeters} m`}
              </span>
            </div>
            <Slider
              value={[radiusMeters]}
              onValueChange={([v]) => onRadiusMetersChange(v)}
              min={100}
              max={5000}
              step={100}
              className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
            />
          </div>

          <div className="px-1 space-y-1.5">
            <p className="text-xs text-sidebar-muted-foreground">
              {isLoading ? 'Buscando...' : `${total} clientes encontrados`}
            </p>
            {results.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {critCounts.alta && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] px-1.5 py-0">
                    {critCounts.alta} alta
                  </Badge>
                )}
                {critCounts.media && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] px-1.5 py-0">
                    {critCounts.media} media
                  </Badge>
                )}
                {critCounts.baja && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                    {critCounts.baja} baja
                  </Badge>
                )}
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ScrollArea className="max-h-48">
              <div className="space-y-0.5">
                {results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onClientClick(c.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-left"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        c.criticality === 'alta'
                          ? 'bg-red-500'
                          : c.criticality === 'media'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-sidebar-foreground truncate">{c.name}</p>
                      <p className="text-[10px] text-sidebar-muted-foreground">
                        {c.code} - {Math.round(c.distance_m)}m
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 border-sidebar-border text-sidebar-muted-foreground"
                    >
                      {c.client_type}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  )
}
