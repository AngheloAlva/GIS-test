import { NextRequest, NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET(request: NextRequest) {
  const sql = getSQL()
  const { searchParams } = request.nextUrl
  const bbox = searchParams.get('bbox')

  let bboxCondition = ''
  const params: number[] = []

  if (bbox) {
    const [west, south, east, north] = bbox.split(',').map(Number)
    if ([west, south, east, north].some(isNaN)) {
      return NextResponse.json({ error: 'Invalid bbox' }, { status: 400 })
    }
    params.push(west, south, east, north)
    bboxCondition = `WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)`
  }

  if (bboxCondition) {
    const [west, south, east, north] = params

    const totalInZone = await sql`
      SELECT COUNT(*)::int as count FROM clients
      WHERE geom && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
    `

    const criticalInZone = await sql`
      SELECT COUNT(*)::int as count FROM clients
      WHERE geom && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
        AND criticality = 'alta'
    `

    const missingDocs = await sql`
      SELECT COUNT(*)::int as count FROM clients
      WHERE geom && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
        AND has_documents = false
    `

    const activeInZone = await sql`
      SELECT COUNT(*)::int as count FROM clients
      WHERE geom && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
        AND status = 'activo'
    `

    const plantsInZone = await sql`
      SELECT COUNT(*)::int as count FROM plants
      WHERE geom && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
    `

    return NextResponse.json({
      clients_in_zone: totalInZone[0].count,
      critical_in_zone: criticalInZone[0].count,
      missing_docs: missingDocs[0].count,
      active_in_zone: activeInZone[0].count,
      plants_in_zone: plantsInZone[0].count,
    })
  }

  const totalClients = await sql`SELECT COUNT(*)::int as count FROM clients`
  const totalPlants = await sql`SELECT COUNT(*)::int as count FROM plants`
  const totalNetworks = await sql`SELECT COUNT(*)::int as count FROM networks`
  const criticalClients = await sql`SELECT COUNT(*)::int as count FROM clients WHERE criticality = 'alta'`
  const missingDocsAll = await sql`SELECT COUNT(*)::int as count FROM clients WHERE has_documents = false`

  return NextResponse.json({
    clients_in_zone: totalClients[0].count,
    critical_in_zone: criticalClients[0].count,
    missing_docs: missingDocsAll[0].count,
    active_in_zone: totalClients[0].count,
    plants_in_zone: totalPlants[0].count,
    total_networks: totalNetworks[0].count,
  })
}
