export type ClientType = 'industrial' | 'comercial' | 'habitacional' | 'gobierno'
export type EstablishmentType = 'hospital' | 'colegio' | 'supermercado' | 'oficina' | 'fabrica' | 'residencial' | 'municipal' | 'otro'
export type Criticality = 'alta' | 'media' | 'baja'
export type ClientStatus = 'activo' | 'inactivo'
export type PlantType = 'planta_principal' | 'oficina_regional' | 'subestacion' | 'centro_distribucion'
export type NetworkType = 'red_primaria' | 'red_secundaria' | 'red_distribucion' | 'conexion'
export type DocType = 'contrato' | 'inspeccion' | 'certificado' | 'foto' | 'plano' | 'informe'

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'LineString'
    coordinates: number[] | number[][]
  }
  properties: Record<string, unknown>
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface ClientProperties {
  id: number
  code: string
  name: string
  address: string
  client_type: ClientType
  establishment_type: EstablishmentType
  status: ClientStatus
  criticality: Criticality
  has_documents: boolean
  has_photos: boolean
}

export interface PlantProperties {
  id: number
  code: string
  name: string
  plant_type: PlantType
  status: string
  capacity: string
}

export interface NetworkProperties {
  id: number
  code: string
  name: string
  network_type: NetworkType
  status: string
  material: string
  diameter_mm: number
}

export interface DocumentItem {
  id: number
  doc_type: DocType
  name: string
  url: string
  created_at: string
}

export interface ClientDetail {
  id: number
  code: string
  name: string
  address: string
  client_type: ClientType
  establishment_type: EstablishmentType
  status: ClientStatus
  criticality: Criticality
  has_documents: boolean
  has_photos: boolean
  created_at: string
  lng: number
  lat: number
  documents: DocumentItem[]
}

export interface LayerFilters {
  status?: string
  criticality?: string
  client_type?: string
  establishment_type?: string
  has_documents?: string
  has_photos?: string
}

export interface RadiusResult {
  total: number
  clients: {
    id: number
    code: string
    name: string
    criticality: string
    client_type: string
    status: string
    lng: number
    lat: number
    distance_m: number
  }[]
}

export interface StatsData {
  clients_in_zone: number
  critical_in_zone: number
  missing_docs: number
  active_in_zone: number
  plants_in_zone: number
  total_networks?: number
}

export interface SearchResult {
  id: number
  code: string
  name: string
  address?: string
  layer: 'clients' | 'plants'
  lng: number
  lat: number
  client_type?: string
  status?: string
  criticality?: string
  plant_type?: string
}

export interface ViewState {
  longitude: number
  latitude: number
  zoom: number
}

export type LayerType = 'clients' | 'plants' | 'networks'
