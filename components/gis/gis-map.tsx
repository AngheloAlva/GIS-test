'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl } from 'react-map-gl'
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl'
import type { CircleLayer, LineLayer } from 'react-map-gl'
import type { GeoJSONFeatureCollection, RadiusResult, ViewState } from '@/types/gis'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const clientsLayer: CircleLayer = {
  id: 'clients-layer',
  type: 'circle',
  source: 'clients',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 14, 7, 18, 12],
    'circle-color': [
      'match',
      ['get', 'criticality'],
      'alta', '#EF4444',
      'media', '#F59E0B',
      'baja', '#22C55E',
      '#00b864',
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': [
      'match',
      ['get', 'client_type'],
      'industrial', '#1E40AF',
      'comercial', '#7C3AED',
      'habitacional', '#0D9488',
      'gobierno', '#DC2626',
      '#ffffff',
    ],
    'circle-opacity': 0.9,
  },
}

const plantsCircleLayer: CircleLayer = {
  id: 'plants-layer',
  type: 'circle',
  source: 'plants',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 12, 18, 18],
    'circle-color': '#10B981',
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.95,
  },
}

const networksLayer: LineLayer = {
  id: 'networks-layer',
  type: 'line',
  source: 'networks',
  paint: {
    'line-color': [
      'match',
      ['get', 'network_type'],
      'red_primaria', '#003a8e',
      'red_secundaria', '#8B5CF6',
      'red_distribucion', '#F59E0B',
      'conexion', '#94A3B8',
      '#64748B',
    ],
    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 2.5, 18, 4],
    'line-opacity': 0.8,
  },
}

const radiusResultsGlowLayer: CircleLayer = {
  id: 'radius-results-glow',
  type: 'circle',
  source: 'radius-results',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 14, 16, 18, 24],
    'circle-color': [
      'match',
      ['get', 'criticality'],
      'alta', '#EF4444',
      'media', '#F59E0B',
      'baja', '#22C55E',
      '#00b864',
    ],
    'circle-opacity': 0.25,
    'circle-blur': 1,
  },
}

const radiusResultsPointLayer: CircleLayer = {
  id: 'radius-results-layer',
  type: 'circle',
  source: 'radius-results',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 14, 10, 18, 16],
    'circle-color': [
      'match',
      ['get', 'criticality'],
      'alta', '#EF4444',
      'media', '#F59E0B',
      'baja', '#22C55E',
      '#00b864',
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 1,
  },
}

const highlightedNetworksGlowLayer: LineLayer = {
  id: 'highlighted-networks-glow',
  type: 'line',
  source: 'highlighted-networks',
  paint: {
    'line-color': '#FF6B35',
    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 12, 18, 18],
    'line-opacity': 0.3,
    'line-blur': 3,
  },
}

const highlightedNetworksLineLayer: LineLayer = {
  id: 'highlighted-networks-layer',
  type: 'line',
  source: 'highlighted-networks',
  paint: {
    'line-color': '#FF6B35',
    'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 14, 5, 18, 8],
    'line-opacity': 0.9,
  },
}

interface RadiusCircleData {
  center: [number, number]
  radiusKm: number
}

function createRadiusGeoJSON(data: RadiusCircleData): GeoJSON.Feature {
  const { center, radiusKm } = data
  const points = 64
  const coords: number[][] = []
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const dx = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180))
    const dy = radiusKm / 110.574
    coords.push([center[0] + dx * Math.cos(angle), center[1] + dy * Math.sin(angle)])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

interface GisMapProps {
  viewState: ViewState
  onViewStateChange: (vs: ViewState) => void
  clientsData: GeoJSONFeatureCollection | null
  plantsData: GeoJSONFeatureCollection | null
  networksData: GeoJSONFeatureCollection | null
  showClients: boolean
  showPlants: boolean
  showNetworks: boolean
  onClientClick: (id: number) => void
  radiusMode: boolean
  onRadiusClick: (lng: number, lat: number) => void
  radiusCenter: { lng: number; lat: number } | null
  radiusMeters: number
  radiusResultsData: RadiusResult['clients'] | null
  highlightedNetworks: GeoJSONFeatureCollection | null
  mapStyle: string
}

const emptyGeoJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

export function GisMap({
  viewState,
  onViewStateChange,
  clientsData,
  plantsData,
  networksData,
  showClients,
  showPlants,
  showNetworks,
  onClientClick,
  radiusMode,
  onRadiusClick,
  radiusCenter,
  radiusMeters,
  radiusResultsData,
  highlightedNetworks,
  mapStyle,
}: GisMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popup, setPopup] = useState<{
    lng: number
    lat: number
    properties: Record<string, unknown>
    layer: string
  } | null>(null)

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (radiusMode) {
        onRadiusClick(e.lngLat.lng, e.lngLat.lat)
        return
      }

      const features = e.features
      if (!features || features.length === 0) {
        setPopup(null)
        return
      }

      const feature = features[0]
      const props = feature.properties || {}
      const layerId = feature.layer.id

      if (layerId === 'clients-layer') {
        const geom = feature.geometry as GeoJSON.Point
        setPopup({
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
          properties: props,
          layer: 'client',
        })
      } else if (layerId === 'plants-layer') {
        const geom = feature.geometry as GeoJSON.Point
        setPopup({
          lng: geom.coordinates[0],
          lat: geom.coordinates[1],
          properties: props,
          layer: 'plant',
        })
      }
    },
    [radiusMode, onRadiusClick],
  )

  const radiusResultsGeoJSON: GeoJSONFeatureCollection | null =
    radiusResultsData && radiusResultsData.length > 0
      ? {
          type: 'FeatureCollection',
          features: radiusResultsData.map((c) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [c.lng, c.lat],
            },
            properties: {
              id: c.id,
              criticality: c.criticality,
              client_type: c.client_type,
              name: c.name,
            },
          })),
        }
      : null

  const radiusGeoJSON = radiusCenter
    ? createRadiusGeoJSON({
        center: [radiusCenter.lng, radiusCenter.lat],
        radiusKm: radiusMeters / 1000,
      })
    : null

  const interactiveLayerIds = [
    ...(showClients ? ['clients-layer'] : []),
    ...(showPlants ? ['plants-layer'] : []),
  ]

  useEffect(() => {
    const map = mapRef.current
    if (map) {
      map.getCanvas().style.cursor = radiusMode ? 'crosshair' : ''
    }
  }, [radiusMode])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center space-y-2 p-8 max-w-md">
          <p className="text-sm font-semibold text-foreground">Mapbox Token Requerido</p>
          <p className="text-xs text-muted-foreground">
            {'Agrega NEXT_PUBLIC_MAPBOX_TOKEN en la seccion Vars del sidebar. Token gratis en mapbox.com/account/access-tokens'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => onViewStateChange(e.viewState as ViewState)}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={mapStyle}
      style={{ width: '100%', height: '100%' }}
      onClick={handleClick}
      interactiveLayerIds={interactiveLayerIds}
      attributionControl={false}
      minZoom={8}
      maxZoom={18}
    >
      <NavigationControl position="bottom-right" />
      <ScaleControl position="bottom-left" unit="metric" />

      {showNetworks && (
        <Source id="networks" type="geojson" data={networksData || emptyGeoJSON}>
          <Layer {...networksLayer} />
        </Source>
      )}

      {highlightedNetworks && highlightedNetworks.features.length > 0 && (
        <Source id="highlighted-networks" type="geojson" data={highlightedNetworks}>
          <Layer {...highlightedNetworksGlowLayer} />
          <Layer {...highlightedNetworksLineLayer} />
        </Source>
      )}

      {showClients && (
        <Source id="clients" type="geojson" data={clientsData || emptyGeoJSON}>
          <Layer {...clientsLayer} />
        </Source>
      )}

      {showPlants && (
        <Source id="plants" type="geojson" data={plantsData || emptyGeoJSON}>
          <Layer {...plantsCircleLayer} />
        </Source>
      )}

      {radiusGeoJSON && (
        <Source id="radius-circle" type="geojson" data={radiusGeoJSON}>
          <Layer
            id="radius-fill"
            type="fill"
            paint={{
              'fill-color': '#00b864',
              'fill-opacity': 0.1,
            }}
          />
          <Layer
            id="radius-outline"
            type="line"
            paint={{
              'line-color': '#00b864',
              'line-width': 2,
              'line-dasharray': [3, 2],
            }}
          />
        </Source>
      )}

      {radiusResultsGeoJSON && (
        <Source id="radius-results" type="geojson" data={radiusResultsGeoJSON}>
          <Layer {...radiusResultsGlowLayer} />
          <Layer {...radiusResultsPointLayer} />
        </Source>
      )}

      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          anchor="bottom"
          onClose={() => setPopup(null)}
          closeButton={true}
          closeOnClick={false}
          className="gis-popup"
        >
          <div className="p-1 min-w-[180px]">
            {popup.layer === 'client' && (
              <>
                <p className="font-semibold text-foreground text-sm">{String(popup.properties.name)}</p>
                <p className="text-xs text-muted-foreground">{String(popup.properties.code)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      popup.properties.criticality === 'alta'
                        ? 'bg-red-500'
                        : popup.properties.criticality === 'media'
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                  />
                  <span className="text-xs capitalize text-muted-foreground">
                    {String(popup.properties.criticality)}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {String(popup.properties.client_type)}
                  </span>
                </div>
                <button
                  onClick={() => onClientClick(Number(popup.properties.id))}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Ver detalle
                </button>
              </>
            )}
            {popup.layer === 'plant' && (
              <>
                <p className="font-semibold text-foreground text-sm">{String(popup.properties.name)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {String(popup.properties.plant_type).replace(/_/g, ' ')}
                </p>
              </>
            )}
          </div>
        </Popup>
      )}
    </Map>
  )
}
