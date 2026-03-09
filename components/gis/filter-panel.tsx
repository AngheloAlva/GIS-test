'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LayerFilters } from '@/types/gis'

interface FilterPanelProps {
  filters: LayerFilters
  onFiltersChange: (filters: LayerFilters) => void
  resultCount?: number
}

export function FilterPanel({ filters, onFiltersChange, resultCount }: FilterPanelProps) {
  const activeCount = Object.values(filters).filter((v) => v && v !== 'all' && v !== '').length
  const update = (key: keyof LayerFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    if (value === 'all' || value === '') {
      delete newFilters[key]
    }
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground">
            Filtros
          </h3>
          {activeCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-4">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({})}
            className="h-6 text-[10px] text-sidebar-muted-foreground hover:text-destructive px-2"
          >
            Limpiar
          </Button>
        )}
      </div>

      {resultCount !== undefined && (
        <div className="px-1 pb-1">
          <p className="text-xs text-sidebar-foreground">
            Mostrando <span className="text-primary font-semibold">{resultCount}</span> instalaciones
          </p>
        </div>
      )}

      <div className="space-y-1.5 px-1">
        <Label className="text-xs text-sidebar-muted-foreground">Estado</Label>
        <Select
          value={(filters.status as string) || 'all'}
          onValueChange={(v) => update('status', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 px-1">
        <Label className="text-xs text-sidebar-muted-foreground">Tipo Cliente</Label>
        <Select
          value={(filters.client_type as string) || 'all'}
          onValueChange={(v) => update('client_type', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
            <SelectItem value="habitacional">Habitacional</SelectItem>
            <SelectItem value="gobierno">Gobierno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 px-1">
        <Label className="text-xs text-sidebar-muted-foreground">Criticidad</Label>
        <Select
          value={(filters.criticality as string) || 'all'}
          onValueChange={(v) => update('criticality', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 px-1">
        <Label className="text-xs text-sidebar-muted-foreground">Establecimiento</Label>
        <Select
          value={(filters.establishment_type as string) || 'all'}
          onValueChange={(v) => update('establishment_type', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="hospital">Hospital</SelectItem>
            <SelectItem value="colegio">Colegio</SelectItem>
            <SelectItem value="supermercado">Supermercado</SelectItem>
            <SelectItem value="oficina">Oficina</SelectItem>
            <SelectItem value="fabrica">Fabrica</SelectItem>
            <SelectItem value="residencial">Residencial</SelectItem>
            <SelectItem value="municipal">Municipal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
        <Label className="text-xs text-sidebar-foreground cursor-pointer">Con documentos</Label>
        <Switch
          checked={filters.has_documents === 'true'}
          onCheckedChange={(v) => update('has_documents', v ? 'true' : '')}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <div className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
        <Label className="text-xs text-sidebar-foreground cursor-pointer">Con fotos</Label>
        <Switch
          checked={filters.has_photos === 'true'}
          onCheckedChange={(v) => update('has_photos', v ? 'true' : '')}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  )
}
