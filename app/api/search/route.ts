import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET(request: NextRequest) {
  const sql = getSQL()
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const searchTerm = `%${q}%`

  const clients = await sql`
    SELECT id, code, name, address, client_type, status, criticality,
           ST_X(geom) as lng, ST_Y(geom) as lat
    FROM clients
    WHERE code ILIKE ${searchTerm}
       OR name ILIKE ${searchTerm}
       OR address ILIKE ${searchTerm}
    ORDER BY name
    LIMIT 20
  `

  const plants = await sql`
    SELECT id, code, name, plant_type, status,
           ST_X(geom) as lng, ST_Y(geom) as lat
    FROM plants
    WHERE code ILIKE ${searchTerm}
       OR name ILIKE ${searchTerm}
    ORDER BY name
    LIMIT 10
  `

  return NextResponse.json({
    results: [
      ...clients.map((c: Record<string, unknown>) => ({ ...c, layer: 'clients' })),
      ...plants.map((p: Record<string, unknown>) => ({ ...p, layer: 'plants' })),
    ],
  })
}
