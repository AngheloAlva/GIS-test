import { getSQL } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sql = getSQL()
  const params = request.nextUrl.searchParams
  const lat = params.get('lat')
  const lng = params.get('lng')
  const meters = params.get('meters') || '500'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  try {
    const features = await sql.query(
      `SELECT json_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(geom)::json,
        'properties', json_build_object(
          'id', id, 'code', code, 'name', name,
          'network_type', network_type, 'status', status,
          'material', material, 'diameter_mm', diameter_mm,
          'distance_m', ROUND(ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography))::int
        )
      ) as feature
      FROM networks
      WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)
      LIMIT 50`,
      [Number(lng), Number(lat), Number(meters)],
    )

    const geojson = {
      type: 'FeatureCollection',
      features: (features || []).map((r: { feature: unknown }) => r.feature),
    }

    return NextResponse.json(geojson)
  } catch (error) {
    console.error('Networks near-client API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
