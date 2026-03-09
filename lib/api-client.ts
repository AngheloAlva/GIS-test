import type { LayerFilters, GeoJSONFeatureCollection, ClientDetail, SearchResult, StatsData, RadiusResult } from '@/types/gis'

const BASE = '/api'

function buildParams(obj: Record<string, string | number | boolean | undefined | null>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      p.set(k, String(v))
    }
  }
  return p.toString()
}

export async function fetchLayers(
  type: 'clients' | 'plants' | 'networks',
  bbox: string,
  filters?: LayerFilters,
): Promise<GeoJSONFeatureCollection> {
  const params = buildParams({
    type,
    bbox,
    ...(filters || {}),
  })
  const res = await fetch(`${BASE}/layers?${params}`)
  if (!res.ok) throw new Error(`Layers API error: ${res.status}`)
  return res.json()
}

export async function fetchClientDetail(id: number): Promise<ClientDetail> {
  const res = await fetch(`${BASE}/clients/${id}`)
  if (!res.ok) throw new Error(`Client detail API error: ${res.status}`)
  return res.json()
}

export async function fetchSearch(q: string): Promise<{ results: SearchResult[] }> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error(`Search API error: ${res.status}`)
  return res.json()
}

export async function fetchStats(bbox?: string): Promise<StatsData> {
  const params = bbox ? `?bbox=${bbox}` : ''
  const res = await fetch(`${BASE}/stats${params}`)
  if (!res.ok) throw new Error(`Stats API error: ${res.status}`)
  return res.json()
}

export async function fetchNearbyNetworks(
  lat: number,
  lng: number,
  meters: number = 500,
): Promise<GeoJSONFeatureCollection> {
  const params = buildParams({ lat, lng, meters })
  const res = await fetch(`${BASE}/networks/near-client?${params}`)
  if (!res.ok) throw new Error(`Networks near-client API error: ${res.status}`)
  return res.json()
}

export async function fetchClientsWithinRadius(
  lat: number,
  lng: number,
  meters: number,
  filters?: LayerFilters,
): Promise<RadiusResult> {
  const params = buildParams({
    lat,
    lng,
    meters,
    ...(filters || {}),
  })
  const res = await fetch(`${BASE}/clients/within-radius?${params}`)
  if (!res.ok) throw new Error(`Radius API error: ${res.status}`)
  return res.json()
}
