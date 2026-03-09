import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const rb = (a,b) => a + Math.random() * (b - a);
const rlat = () => -33.4489 + rb(-0.12, 0.12);
const rlng = () => -70.6693 + rb(-0.15, 0.15);
const pk = a => a[Math.floor(Math.random() * a.length)];
const comunas = ['Providencia','Las Condes','Vitacura','Santiago Centro','Nunoa','La Reina','Macul','San Joaquin','La Florida','Penalolen','Maipu','Cerrillos','Recoleta','Quilicura','Pudahuel'];
const nt = ['red_primaria','red_secundaria','red_distribucion','conexion'];
const mt = ['acero','polietileno','cobre','PVC','hierro_ductil'];
const dt = ['contrato','inspeccion','certificado','foto','plano','informe'];

async function batchRun(queries, batchSize = 20) {
  for (let i = 0; i < queries.length; i += batchSize) {
    await Promise.all(queries.slice(i, i + batchSize).map(q => sql.query(q[0], q[1])));
    if ((i + batchSize) % 60 === 0) console.log(`  batch progress: ${Math.min(i + batchSize, queries.length)}/${queries.length}`);
  }
}

async function main() {
  try {
    const ncResult = await sql`SELECT COUNT(*) as c FROM networks`;
    const existing = parseInt(ncResult[0].c);
    const needed = 200 - existing;
    console.log(`Networks: ${existing} exist, seeding ${needed} more...`);
    
    // Build network queries
    const netQueries = [];
    for (let i = existing + 1; i <= 200; i++) {
      const bLat = rlat(), bLng = rlng();
      const pts = [];
      for (let j = 0; j < Math.floor(Math.random()*3)+2; j++) {
        pts.push(`${(bLng+rb(-0.008,0.008)).toFixed(6)} ${(bLat+rb(-0.005,0.005)).toFixed(6)}`);
      }
      netQueries.push([
        `INSERT INTO networks (code,name,network_type,status,material,diameter_mm,geom) VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_GeomFromText($7),4326))`,
        [`NET-${String(i).padStart(4,'0')}`, `Tramo ${pk(comunas)} ${i}`, pk(nt), Math.random()>0.1?'activo':(Math.random()>0.5?'inactivo':'en_construccion'), pk(mt), pk([100,150,200,250,300,400,500,600]), `LINESTRING(${pts.join(', ')})`]
      ]);
    }
    await batchRun(netQueries);
    console.log('Networks done.');

    // Documents
    const clients = await sql`SELECT id FROM clients WHERE has_documents = true`;
    console.log(`Adding docs for ${clients.length} clients...`);
    const docQueries = [];
    for (const c of clients) {
      const nd = Math.floor(Math.random()*3)+1;
      for (let j = 0; j < nd; j++) {
        const dType = pk(dt);
        docQueries.push([
          `INSERT INTO documents (client_id,doc_type,name,url) VALUES ($1,$2,$3,$4)`,
          [c.id, dType, `${dType.charAt(0).toUpperCase()+dType.slice(1)} - Cliente ${c.id} (${j+1})`, `https://storage.example.com/docs/${dType}/${c.id}_${j+1}.pdf`]
        ]);
      }
    }
    await batchRun(docQueries);
    console.log('Documents done.');

    const cc = await sql`SELECT COUNT(*) as c FROM clients`;
    const pc = await sql`SELECT COUNT(*) as c FROM plants`;
    const nc = await sql`SELECT COUNT(*) as c FROM networks`;
    const dcc = await sql`SELECT COUNT(*) as c FROM documents`;
    console.log(`=== FINAL === Clients:${cc[0].c} Plants:${pc[0].c} Networks:${nc[0].c} Docs:${dcc[0].c}`);
  } catch(e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  }
}
main();
