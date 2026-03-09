'use client'

import { useState, useCallback } from 'react'
import type { GeoJSONFeatureCollection, LayerFilters, RadiusResult, ViewState } from '@/types/gis'

const SANTIAGO_CENTER: ViewState = {
  longitude: -70.6483,
  latitude: -33.4489,
  zoom: 12,
}

export interface GisState {
  viewState: ViewState
  layers: {
    clients: boolean
    plants: boolean
    networks: boolean
  }
  filters: LayerFilters
  selectedClientId: number | null
  radiusMode: boolean
  radiusCenter: { lng: number; lat: number } | null
  radiusMeters: number
  radiusResults: RadiusResult['clients'] | null
  highlightedNetworks: GeoJSONFeatureCollection | null
  searchQuery: string
}

const initialState: GisState = {
  viewState: SANTIAGO_CENTER,
  layers: {
    clients: true,
    plants: true,
    networks: true,
  },
  filters: {},
  selectedClientId: null,
  radiusMode: false,
  radiusCenter: null,
  radiusMeters: 1000,
  radiusResults: null,
  highlightedNetworks: null,
  searchQuery: '',
}

export function useGisStore() {
  const [state, setState] = useState<GisState>(initialState)

  const setViewState = useCallback((vs: ViewState) => {
    setState((s) => ({ ...s, viewState: vs }))
  }, [])

  const toggleLayer = useCallback((layer: keyof GisState['layers']) => {
    setState((s) => ({
      ...s,
      layers: { ...s.layers, [layer]: !s.layers[layer] },
    }))
  }, [])

  const setFilters = useCallback((filters: LayerFilters) => {
    setState((s) => ({ ...s, filters }))
  }, [])

  const setSelectedClient = useCallback((id: number | null) => {
    setState((s) => ({ ...s, selectedClientId: id }))
  }, [])

  const toggleRadiusMode = useCallback(() => {
    setState((s) => ({
      ...s,
      radiusMode: !s.radiusMode,
      radiusCenter: !s.radiusMode ? null : s.radiusCenter,
    }))
  }, [])

  const setRadiusCenter = useCallback((center: { lng: number; lat: number } | null) => {
    setState((s) => ({ ...s, radiusCenter: center }))
  }, [])

  const setRadiusMeters = useCallback((meters: number) => {
    setState((s) => ({ ...s, radiusMeters: meters }))
  }, [])

  const setRadiusResults = useCallback((results: RadiusResult['clients'] | null) => {
    setState((s) => ({ ...s, radiusResults: results }))
  }, [])

  const setHighlightedNetworks = useCallback((networks: GeoJSONFeatureCollection | null) => {
    setState((s) => ({ ...s, highlightedNetworks: networks }))
  }, [])

  const setSearchQuery = useCallback((q: string) => {
    setState((s) => ({ ...s, searchQuery: q }))
  }, [])

  const getBbox = useCallback((): string => {
    const { longitude, latitude, zoom } = state.viewState
    const scale = 360 / Math.pow(2, zoom)
    const west = longitude - scale
    const east = longitude + scale
    const south = latitude - scale * 0.5
    const north = latitude + scale * 0.5
    return `${west},${south},${east},${north}`
  }, [state.viewState])

  return {
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
    setSearchQuery,
    getBbox,
  }
}
