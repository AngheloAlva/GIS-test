'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR from 'swr'
import { PanelLeftClose, PanelLeftOpen, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { GisMap } from './gis-map'
import { SearchBar } from './search-bar'
import { LayerToggles } from './layer-toggles'
import { FilterPanel } from './filter-panel'
import { StatsPanel } from './stats-panel'
import { ResultsList } from './results-list'
import { RadiusTool } from './radius-tool'
import { ClientDetail } from './client-detail'
import { MapStyleToggle } from './map-style-toggle'
import { MapLegend } from './map-legend'
import { AnalyticsPanel } from './analytics-panel'
import { useGisStore } from '@/hooks/use-gis-store'
import { fetchLayers, fetchNearbyNetworks, fetchStats } from '@/lib/api-client'
import type { GeoJSONFeatureCollection, SearchResult, StatsData } from '@/types/gis'

function layerFetcher([type, bbox, filters]: [string, string, Record<string, string>]) {
  return fetchLayers(type as 'clients' | 'plants' | 'networks', bbox, filters)
}

export function GisDashboard() {
  const {
    state,
    setViewState,
    toggleLayer,
    setFilters,
    setSelectedClient,
    toggleRadiusMode,
    setRadiusCenter,
    setRadiusMeters,
    setRadiusResults,
    setHighlightedNetworks,
  } = useGisStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11')
  const [bbox, setBbox] = useState('')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced bbox update when map moves
  const handleViewStateChange = useCallback(
    (vs: typeof state.viewState) => {
      setViewState(vs)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const scale = 360 / Math.pow(2, vs.zoom)
        const west = vs.longitude - scale
        const east = vs.longitude + scale
        const south = vs.latitude - scale * 0.5
        const north = vs.latitude + scale * 0.5
        setBbox(`${west},${south},${east},${north}`)
      }, 400)
    },
    [setViewState],
  )

  // Initialize bbox
  useEffect(() => {
    const vs = state.viewState
    const scale = 360 / Math.pow(2, vs.zoom)
    const west = vs.longitude - scale
    const east = vs.longitude + scale
    const south = vs.latitude - scale * 0.5
    const north = vs.latitude + scale * 0.5
    setBbox(`${west},${south},${east},${north}`)
  }, [])

  // SWR data fetching for each layer
  const { data: clientsData, isLoading: clientsLoading } = useSWR<GeoJSONFeatureCollection>(
    bbox && state.layers.clients ? ['clients', bbox, state.filters] : null,
    layerFetcher,
    { refreshInterval: 0, revalidateOnFocus: false },
  )

  const { data: plantsData } = useSWR<GeoJSONFeatureCollection>(
    bbox && state.layers.plants ? ['plants', bbox, {}] : null,
    layerFetcher,
    { refreshInterval: 0, revalidateOnFocus: false },
  )

  const { data: networksData } = useSWR<GeoJSONFeatureCollection>(
    bbox && state.layers.networks ? ['networks', bbox, {}] : null,
    layerFetcher,
    { refreshInterval: 0, revalidateOnFocus: false },
  )

  // Fetch stats when bbox changes
  useEffect(() => {
    if (!bbox) return
    setStatsLoading(true)
    fetchStats(bbox)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [bbox])

  // Fetch nearby networks when a client is selected
  useEffect(() => {
    if (!state.selectedClientId || !clientsData) {
      setHighlightedNetworks(null)
      return
    }
    const feature = clientsData.features.find(
      (f) => f.properties?.id === state.selectedClientId,
    )
    if (!feature || feature.geometry.type !== 'Point') {
      setHighlightedNetworks(null)
      return
    }
    const [lng, lat] = feature.geometry.coordinates as number[]
    fetchNearbyNetworks(lat, lng, 500)
      .then(setHighlightedNetworks)
      .catch(() => setHighlightedNetworks(null))
  }, [state.selectedClientId, clientsData, setHighlightedNetworks])

  const handleSearchResultClick = useCallback(
    (result: SearchResult) => {
      setViewState({
        longitude: result.lng,
        latitude: result.lat,
        zoom: 16,
      })
      if (result.layer === 'clients') {
        setSelectedClient(result.id)
      }
    },
    [setViewState, setSelectedClient],
  )

  const handleRadiusClick = useCallback(
    (lng: number, lat: number) => {
      setRadiusCenter({ lng, lat })
    },
    [setRadiusCenter],
  )

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-sidebar-background border-r border-sidebar-border flex-shrink-0 overflow-hidden relative`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Ingenieria Simple" width={120} height={32} className="h-8 w-auto" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAnalyticsOpen(true)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              title="Panel de Analitica"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="sr-only">Abrir panel de analitica</span>
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-3 space-y-4">
              <SearchBar onResultClick={handleSearchResultClick} />
              <MapStyleToggle current={mapStyle} onChange={setMapStyle} />
              <Separator className="bg-sidebar-border" />
              <LayerToggles layers={state.layers} onToggle={toggleLayer} />
              <Separator className="bg-sidebar-border" />
              <FilterPanel
                filters={state.filters}
                onFiltersChange={setFilters}
                resultCount={clientsData?.features.length}
              />
              <Separator className="bg-sidebar-border" />
              <StatsPanel stats={stats} isLoading={statsLoading} />
              <Separator className="bg-sidebar-border" />
              <RadiusTool
                radiusMode={state.radiusMode}
                onToggleRadiusMode={toggleRadiusMode}
                radiusCenter={state.radiusCenter}
                radiusMeters={state.radiusMeters}
                onRadiusMetersChange={setRadiusMeters}
                filters={state.filters}
                onClientClick={setSelectedClient}
                onRadiusResults={setRadiusResults}
              />
              <Separator className="bg-sidebar-border" />
              <ResultsList
                data={clientsData || null}
                onClientClick={setSelectedClient}
                isLoading={clientsLoading}
              />
            </div>
          </ScrollArea>
        </div>

      </aside>

      {/* Client detail panel - separate from sidebar, solid bg */}
      {state.selectedClientId && (
        <aside className="w-80 h-full flex-shrink-0 border-r border-sidebar-border relative bg-background">
          <ClientDetail
            clientId={state.selectedClientId}
            onClose={() => setSelectedClient(null)}
            nearbyNetworks={state.highlightedNetworks}
          />
        </aside>
      )}

      {/* Toggle sidebar button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 left-3 z-10 h-9 w-9 bg-card shadow-md border-border hover:bg-muted"
        style={{ left: sidebarOpen ? 'calc(20rem + 0.75rem)' : '0.75rem' }}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      {/* Map */}
      <main className="flex-1 relative">
        <GisMap
          viewState={state.viewState}
          onViewStateChange={handleViewStateChange}
          clientsData={clientsData || null}
          plantsData={plantsData || null}
          networksData={networksData || null}
          showClients={state.layers.clients}
          showPlants={state.layers.plants}
          showNetworks={state.layers.networks}
          onClientClick={setSelectedClient}
          radiusMode={state.radiusMode}
          onRadiusClick={handleRadiusClick}
          radiusCenter={state.radiusCenter}
          radiusMeters={state.radiusMeters}
          radiusResultsData={state.radiusResults}
          highlightedNetworks={state.highlightedNetworks}
          mapStyle={mapStyle}
        />
        <MapLegend
          showClients={state.layers.clients}
          showPlants={state.layers.plants}
          showNetworks={state.layers.networks}
          hasHighlightedNetworks={!!state.highlightedNetworks?.features.length}
        />
      </main>

      {/* Analytics Panel */}
      <AnalyticsPanel open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
    </div>
  )
}
