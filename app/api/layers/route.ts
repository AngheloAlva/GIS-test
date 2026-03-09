import { getSQL } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sql = getSQL()
  const params = request.nextUrl.searchParams
  const type = params.get('type') || 'clients'
  const bbox = params.get('bbox') // west,south,east,north

  if (!bbox) {
    return NextResponse.json({ error: 'bbox is required' }, { status: 400 })
  }

  const [west, south, east, north] = bbox.split(',').map(Number)

  try {
    let features

    if (type === 'clients') {
      const status = params.get('status')
      const criticality = params.get('criticality')
      const clientType = params.get('client_type')
      const establishmentType = params.get('establishment_type')
      const hasDocuments = params.get('has_documents')
      const hasPhotos = params.get('has_photos')

      const conditions: string[] = [
        `geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)`
      ]
      const values: (string | number | boolean)[] = [west, south, east, north]
      let paramIndex = 5

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
      if (clientType) {
        conditions.push(`client_type = $${paramIndex}`)
        values.push(clientType)
        paramIndex++
      }
      if (establishmentType) {
        conditions.push(`establishment_type = $${paramIndex}`)
        values.push(establishmentType)
        paramIndex++
      }
      if (hasDocuments === 'true' || hasDocuments === 'false') {
        conditions.push(`has_documents = $${paramIndex}`)
        values.push(hasDocuments === 'true')
        paramIndex++
      }
      if (hasPhotos === 'true' || hasPhotos === 'false') {
        conditions.push(`has_photos = $${paramIndex}`)
        values.push(hasPhotos === 'true')
        paramIndex++
      }

      const where = conditions.join(' AND ')
      features = await sql.query(
        `SELECT json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::json,
          'properties', json_build_object(
            'id', id, 'code', code, 'name', name, 'address', address,
            'client_type', client_type, 'establishment_type', establishment_type,
            'status', status, 'criticality', criticality,
            'has_documents', has_documents, 'has_photos', has_photos
          )
        ) as feature FROM clients WHERE ${where} LIMIT 2000`,
        values
      )
    } else if (type === 'plants') {
      features = await sql.query(
        `SELECT json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::json,
          'properties', json_build_object(
            'id', id, 'code', code, 'name', name,
            'plant_type', plant_type, 'status', status, 'capacity', capacity
          )
        ) as feature FROM plants 
        WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)`,
        [west, south, east, north]
      )
    } else if (type === 'networks') {
      features = await sql.query(
        `SELECT json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::json,
          'properties', json_build_object(
            'id', id, 'code', code, 'name', name,
            'network_type', network_type, 'status', status,
            'material', material, 'diameter_mm', diameter_mm
          )
        ) as feature FROM networks 
        WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)`,
        [west, south, east, north]
      )
    } else {
      return NextResponse.json({ error: 'Invalid layer type' }, { status: 400 })
    }

    const geojson = {
      type: 'FeatureCollection',
      features: (features || []).map((r: { feature: unknown }) => r.feature),
    }

    return NextResponse.json(geojson)
  } catch (error) {
    console.error('Layers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
