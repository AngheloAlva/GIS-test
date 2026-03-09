'use client'

import { useEffect, useState } from 'react'
import { X, FileText, Camera, MapPin, Calendar, Building2, ClipboardCheck, Shield, Map, FileBarChart, Cable } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { fetchClientDetail } from '@/lib/api-client'
import type { ClientDetail as ClientDetailType, GeoJSONFeatureCollection } from '@/types/gis'

const networkTypeLabels: Record<string, string> = {
  red_primaria: 'Primaria',
  red_secundaria: 'Secundaria',
  red_distribucion: 'Distribución',
  conexion: 'Conexión',
}

interface ClientDetailProps {
  clientId: number
  onClose: () => void
  nearbyNetworks?: GeoJSONFeatureCollection | null
}

const criticalityColors: Record<string, string> = {
  alta: 'bg-red-50 text-red-700 border-red-200',
  media: 'bg-amber-50 text-amber-700 border-amber-200',
  baja: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const docTypeIcons: Record<string, typeof FileText> = {
  contrato: FileText,
  inspeccion: ClipboardCheck,
  certificado: Shield,
  foto: Camera,
  plano: Map,
  informe: FileBarChart,
}

const docTypeLabels: Record<string, string> = {
  contrato: 'Contratos',
  inspeccion: 'Inspecciones',
  certificado: 'Certificados',
  foto: 'Fotos',
  plano: 'Planos',
  informe: 'Informes',
}

export function ClientDetail({ clientId, onClose, nearbyNetworks }: ClientDetailProps) {
  const [client, setClient] = useState<ClientDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchClientDetail(clientId)
      .then(setClient)
      .finally(() => setIsLoading(false))
  }, [clientId])

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <div>
          <h2 className="text-sm font-semibold text-sidebar-foreground">{client.name}</h2>
          <p className="text-xs text-sidebar-muted-foreground">{client.code}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-sidebar-accent transition-colors"
        >
          <X className="h-4 w-4 text-sidebar-muted-foreground" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={criticalityColors[client.criticality]}
            >
              {client.criticality}
            </Badge>
            <Badge
              variant="outline"
              className={
                client.status === 'activo'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }
            >
              {client.status}
            </Badge>
            <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
              {client.client_type}
            </Badge>
          </div>

          <div className="space-y-2.5">
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-sidebar-muted-foreground mt-0.5 shrink-0" />
                <span className="text-xs text-sidebar-foreground">{client.address}</span>
              </div>
            )}
            {client.establishment_type && (
              <div className="flex items-start gap-2">
                <Building2 className="h-3.5 w-3.5 text-sidebar-muted-foreground mt-0.5 shrink-0" />
                <span className="text-xs text-sidebar-foreground capitalize">
                  {client.establishment_type}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="h-3.5 w-3.5 text-sidebar-muted-foreground mt-0.5 shrink-0" />
              <span className="text-xs text-sidebar-foreground">
                {new Date(client.created_at).toLocaleDateString('es-CL')}
              </span>
            </div>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${client.has_documents ? 'bg-emerald-500' : 'bg-zinc-500'}`}
              />
              <span className="text-sidebar-muted-foreground">
                {client.has_documents ? 'Con docs' : 'Sin docs'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${client.has_photos ? 'bg-emerald-500' : 'bg-zinc-500'}`}
              />
              <span className="text-sidebar-muted-foreground">
                {client.has_photos ? 'Con fotos' : 'Sin fotos'}
              </span>
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {nearbyNetworks && nearbyNetworks.features.length > 0 && (() => {
            const byType = nearbyNetworks.features.reduce(
              (acc, f) => {
                const type = String(f.properties?.network_type || 'otro')
                acc[type] = (acc[type] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cable className="h-3.5 w-3.5 text-orange-500" />
                  <h4 className="text-xs font-semibold text-sidebar-foreground">
                    Redes cercanas ({nearbyNetworks.features.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {Object.entries(byType).map(([type, count]) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0"
                    >
                      {count} {networkTypeLabels[type] || type}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-sidebar-muted-foreground px-1">
                  Radio de 500m desde la instalación
                </p>
                <Separator className="bg-sidebar-border mt-3" />
              </div>
            )
          })()}

          <div>
            <h4 className="text-xs font-semibold text-sidebar-foreground mb-2">
              Documentos ({client.documents.length})
            </h4>

            {client.documents.length > 0 && (() => {
              const photoCount = client.documents.filter((d) => d.doc_type === 'foto').length
              const docCount = client.documents.length - photoCount
              return (
                <div className="flex items-center gap-2 text-xs text-sidebar-muted-foreground mb-3">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{docCount} documentos</span>
                  <span className="text-sidebar-border">|</span>
                  <Camera className="h-3.5 w-3.5" />
                  <span>{photoCount} fotos</span>
                </div>
              )
            })()}

            {client.documents.length === 0 ? (
              <p className="text-xs text-sidebar-muted-foreground italic">
                Sin documentos asociados
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  client.documents.reduce(
                    (acc, doc) => {
                      if (!acc[doc.doc_type]) acc[doc.doc_type] = []
                      acc[doc.doc_type].push(doc)
                      return acc
                    },
                    {} as Record<string, typeof client.documents>,
                  ),
                ).map(([type, docs]) => {
                  const GroupIcon = docTypeIcons[type] || FileText
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <GroupIcon className="h-3 w-3 text-sidebar-muted-foreground" />
                        <p className="text-[10px] font-medium text-sidebar-muted-foreground uppercase tracking-wider">
                          {docTypeLabels[type] || type} ({docs.length})
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        {docs.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-sidebar-accent transition-colors group"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-sidebar-foreground truncate">
                                {doc.name}
                              </p>
                              <p className="text-[10px] text-sidebar-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString('es-CL')}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
