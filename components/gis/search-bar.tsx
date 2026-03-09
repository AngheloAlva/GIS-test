'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin, Factory } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchSearch } from '@/lib/api-client'
import type { SearchResult } from '@/types/gis'

interface SearchBarProps {
  onResultClick: (result: SearchResult) => void
}

export function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchSearch(query)
        setResults(data.results)
        setIsOpen(data.results.length > 0)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por ID, nombre o direccion..."
          className="pl-9 pr-8 h-9 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="h-3.5 w-3.5 text-sidebar-muted-foreground hover:text-sidebar-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-sidebar-background border border-sidebar-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-sidebar-muted-foreground">Buscando...</div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.layer}-${r.id}`}
                onClick={() => {
                  onResultClick(r)
                  setIsOpen(false)
                  setQuery(r.name)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-sidebar-accent transition-colors"
              >
                {r.layer === 'clients' ? (
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <Factory className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-sidebar-foreground truncate">{r.name}</p>
                  <p className="text-xs text-sidebar-muted-foreground truncate">
                    {r.code}
                    {r.address && ` - ${r.address}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
