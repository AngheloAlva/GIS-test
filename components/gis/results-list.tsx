'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { GeoJSONFeatureCollection } from '@/types/gis'

interface ResultsListProps {
  data: GeoJSONFeatureCollection | null
  onClientClick: (id: number) => void
  isLoading: boolean
}

const PAGE_SIZE = 15

export function ResultsList({ data, onClientClick, isLoading }: ResultsListProps) {
  const [page, setPage] = useState(0)
  const features = data?.features || []
  const totalPages = Math.ceil(features.length / PAGE_SIZE)
  const paginated = features.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground mb-2">
          Resultados
        </h3>
        <p className="text-xs text-sidebar-muted-foreground px-1">Cargando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground">
          Resultados ({features.length})
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3 w-3 text-sidebar-muted-foreground" />
            </Button>
            <span className="text-[10px] text-sidebar-muted-foreground">
              {page + 1}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3 w-3 text-sidebar-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="max-h-56">
        <div className="space-y-0.5">
          {paginated.map((f) => {
            const p = f.properties || {}
            return (
              <button
                key={p.id}
                onClick={() => onClientClick(p.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-left"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    p.criticality === 'alta'
                      ? 'bg-red-500'
                      : p.criticality === 'media'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-sidebar-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-sidebar-muted-foreground truncate">
                    {p.code} - {p.client_type}
                  </p>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    p.status === 'activo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {p.status}
                </span>
              </button>
            )
          })}
          {features.length === 0 && (
            <p className="text-xs text-sidebar-muted-foreground px-2.5 py-2 italic">
              No hay resultados en esta vista
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
