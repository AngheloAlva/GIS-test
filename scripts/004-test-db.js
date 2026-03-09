import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const cc = await sql`SELECT COUNT(*) as c FROM clients`;
    const pc = await sql`SELECT COUNT(*) as c FROM plants`;
    const nc = await sql`SELECT COUNT(*) as c FROM networks`;
    const dc = await sql`SELECT COUNT(*) as c FROM documents`;
    console.log(`Clients: ${cc[0].c}, Plants: ${pc[0].c}, Networks: ${nc[0].c}, Documents: ${dc[0].c}`);
    
    const sample = await sql`SELECT id, code, name, client_type, status, criticality, ST_AsText(geom) as geom_text FROM clients LIMIT 3`;
    console.log('Sample clients:', JSON.stringify(sample, null, 2));
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
main();
