import { getSQL } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sql = getSQL()
  const params = request.nextUrl.searchParams
  const lat = params.get('lat')
  const lng = params.get('lng')
  const meters = params.get('meters') || '1000'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  try {
    const status = params.get('status')
    const criticality = params.get('criticality')

    const conditions: string[] = [
      `ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    ]
    const values: (string | number)[] = [Number(lng), Number(lat), Number(meters)]
    let paramIndex = 4

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }
    if (criticality) {
      conditions.push(`criticality = $${paramIndex}`)
      values.push(criticality)
      paramIndex++
    }

    const where = conditions.join(' AND ')
    const results = await sql.query(
      `SELECT id, code, name, criticality, client_type, status,
      ST_X(geom) as lng, ST_Y(geom) as lat,
      ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography))::int as distance_m
      FROM clients WHERE ${where}
      ORDER BY distance_m
      LIMIT 200`,
      values,
    )

    return NextResponse.json({
      total: results.length,
      clients: results,
    })
  } catch (error) {
    console.error('Radius API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
