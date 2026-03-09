import { getSQL } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sql = getSQL()

  try {
    const clientRows = await sql`
      SELECT id, code, name, address, client_type, establishment_type,
             status, criticality, has_documents, has_photos, created_at,
             ST_X(geom) as lng, ST_Y(geom) as lat
      FROM clients WHERE id = ${Number(id)}
    `

    if (clientRows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const client = clientRows[0]

    const documents = await sql`
      SELECT id, doc_type, name, url, created_at
      FROM documents WHERE client_id = ${Number(id)}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ ...client, documents })
  } catch (error) {
    console.error('Client detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
