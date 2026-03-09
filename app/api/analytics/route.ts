import { NextResponse } from 'next/server'
import { getSQL } from '@/lib/db'

export async function GET() {
  const sql = getSQL()
  const [
    totals,
    byType,
    byCriticality,
    byEstablishment,
    byStatus,
    docCoverage,
    plantsByType,
    networksByType,
    networksByStatus,
    recentClients,
  ] = await Promise.all([
    // Overall totals
    sql`SELECT
      (SELECT COUNT(*)::int FROM clients) as total_clients,
      (SELECT COUNT(*)::int FROM plants) as total_plants,
      (SELECT COUNT(*)::int FROM networks) as total_networks,
      (SELECT COUNT(*)::int FROM documents) as total_documents,
      (SELECT COUNT(*)::int FROM clients WHERE criticality = 'alta') as critical_clients,
      (SELECT COUNT(*)::int FROM clients WHERE has_documents = false) as missing_docs,
      (SELECT COUNT(*)::int FROM clients WHERE has_photos = false) as missing_photos,
      (SELECT COUNT(*)::int FROM clients WHERE status = 'activo') as active_clients,
      (SELECT COUNT(*)::int FROM clients WHERE status = 'inactivo') as inactive_clients
    `,
    // Clients by type
    sql`SELECT client_type as name, COUNT(*)::int as value FROM clients GROUP BY client_type ORDER BY value DESC`,
    // Clients by criticality
    sql`SELECT criticality as name, COUNT(*)::int as value FROM clients GROUP BY criticality ORDER BY value DESC`,
    // Clients by establishment type
    sql`SELECT establishment_type as name, COUNT(*)::int as value FROM clients WHERE establishment_type IS NOT NULL GROUP BY establishment_type ORDER BY value DESC`,
    // Clients by status
    sql`SELECT status as name, COUNT(*)::int as value FROM clients GROUP BY status ORDER BY value DESC`,
    // Document coverage (clients with/without docs)
    sql`SELECT
      SUM(CASE WHEN has_documents THEN 1 ELSE 0 END)::int as with_docs,
      SUM(CASE WHEN NOT has_documents THEN 1 ELSE 0 END)::int as without_docs,
      SUM(CASE WHEN has_photos THEN 1 ELSE 0 END)::int as with_photos,
      SUM(CASE WHEN NOT has_photos THEN 1 ELSE 0 END)::int as without_photos
    FROM clients`,
    // Plants by type
    sql`SELECT plant_type as name, COUNT(*)::int as value FROM plants GROUP BY plant_type ORDER BY value DESC`,
    // Networks by type
    sql`SELECT network_type as name, COUNT(*)::int as value FROM networks GROUP BY network_type ORDER BY value DESC`,
    // Networks by status
    sql`SELECT status as name, COUNT(*)::int as value FROM networks GROUP BY status ORDER BY value DESC`,
    // Recent clients (last 10)
    sql`SELECT id, code, name, client_type, criticality, status, created_at FROM clients ORDER BY created_at DESC LIMIT 10`,
  ])

  return NextResponse.json({
    totals: totals[0],
    byType,
    byCriticality,
    byEstablishment,
    byStatus,
    docCoverage: docCoverage[0],
    plantsByType,
    networksByType,
    networksByStatus,
    recentClients,
  })
}
