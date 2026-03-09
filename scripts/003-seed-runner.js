import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('Clearing existing data...');
    await sql`DELETE FROM documents`;
    await sql`DELETE FROM clients`;
    await sql`DELETE FROM plants`;
    await sql`DELETE FROM networks`;
    console.log('Data cleared. Starting seed...');

    const SANTIAGO = { lat: -33.4489, lng: -70.6693 };
    const SP = { lat: 0.12, lng: 0.15 };
    const rb = (a,b) => a + Math.random() * (b - a);
    const rlat = () => SANTIAGO.lat + rb(-SP.lat, SP.lat);
    const rlng = () => SANTIAGO.lng + rb(-SP.lng, SP.lng);
    const pk = a => a[Math.floor(Math.random() * a.length)];

    const comunas = ['Providencia','Las Condes','Vitacura','Santiago Centro','Nunoa','La Reina','Macul','San Joaquin','La Florida','Penalolen','Maipu','Cerrillos','Estacion Central','Quinta Normal','Recoleta','Independencia','Conchali','Huechuraba','Renca','Quilicura','Pudahuel','Lo Prado','Cerro Navia','San Miguel','La Cisterna'];
    const calles = ['Av. Providencia','Av. Apoquindo','Av. Las Condes','Alameda','Calle Merced','Av. Irarrazaval','Av. Grecia','Calle Los Leones','Av. Pedro de Valdivia','Av. Tobalaba','Av. Manquehue','Av. 11 de Septiembre','Av. Matta','Av. Santa Rosa','Av. Vicuna Mackenna','Av. Americo Vespucio'];
    const ct = ['industrial','comercial','habitacional','gobierno'];
    const et = {gobierno:['municipal','oficina'],industrial:['fabrica','otro'],comercial:['supermercado','oficina','hospital','colegio','otro'],habitacional:['residencial','otro']};
    const cr = ['alta','media','baja'];
    const dt = ['contrato','inspeccion','certificado','foto','plano','informe'];

    // Seed clients
    const cwdocs = [];
    for (let i = 1; i <= 300; i++) {
      const cType = pk(ct);
      const hd = Math.random() > 0.3;
      if (hd) cwdocs.push(i);
      await sql.query(
        `INSERT INTO clients (code,name,address,client_type,establishment_type,status,criticality,has_documents,has_photos,geom) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,ST_SetSRID(ST_MakePoint($10,$11),4326))`,
        [`CLI-${String(i).padStart(5,'0')}`, `Cliente ${pk(comunas)} ${i}`, `${pk(calles)} ${Math.floor(Math.random()*9000)+100}, ${pk(comunas)}, Santiago`, cType, pk(et[cType]), Math.random()>0.15?'activo':'inactivo', pk(cr), hd, Math.random()>0.5, rlng(), rlat()]
      );
      if (i % 50 === 0) console.log(`  clients: ${i}/300`);
    }

    // Seed plants
    const pls = [[-33.51,-70.757,'Planta Principal Maipu','planta_principal','500000 m3/dia'],[-33.517,-70.588,'Planta La Florida','planta_principal','350000 m3/dia'],[-33.426,-70.61,'Oficina Providencia','oficina_regional','N/A'],[-33.407,-70.567,'Oficina Las Condes','oficina_regional','N/A'],[-33.453,-70.596,'Subestacion Nunoa','subestacion','120000 m3/dia'],[-33.407,-70.642,'Subestacion Recoleta','subestacion','80000 m3/dia'],[-33.357,-70.731,'Subestacion Quilicura','subestacion','95000 m3/dia'],[-33.534,-70.66,'CD Sur','centro_distribucion','200000 m3/dia'],[-33.38,-70.65,'CD Norte','centro_distribucion','180000 m3/dia'],[-33.435,-70.75,'Subestacion Pudahuel','subestacion','110000 m3/dia']];
    for (let i = 0; i < pls.length; i++) {
      const p = pls[i];
      await sql.query(
        `INSERT INTO plants (code,name,plant_type,status,capacity,geom) VALUES ($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($6,$7),4326))`,
        [`PLT-${String(i+1).padStart(3,'0')}`, p[2], p[3], i<8?'activo':'mantenimiento', p[4], p[1], p[0]]
      );
    }
    console.log('  plants: 10/10');

    // Seed networks
    const nt = ['red_primaria','red_secundaria','red_distribucion','conexion'];
    const mt = ['acero','polietileno','cobre','PVC','hierro_ductil'];
    for (let i = 1; i <= 200; i++) {
      const bLat=rlat(), bLng=rlng();
      const pts=[];
      for(let j=0;j<Math.floor(Math.random()*3)+2;j++){
        pts.push(`${(bLng+rb(-0.008,0.008)).toFixed(6)} ${(bLat+rb(-0.005,0.005)).toFixed(6)}`);
      }
      await sql.query(
        `INSERT INTO networks (code,name,network_type,status,material,diameter_mm,geom) VALUES ($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_GeomFromText($7),4326))`,
        [`NET-${String(i).padStart(4,'0')}`, `Tramo ${pk(comunas)} ${i}`, pk(nt), Math.random()>0.1?'activo':(Math.random()>0.5?'inactivo':'en_construccion'), pk(mt), pk([100,150,200,250,300,400,500,600]), `LINESTRING(${pts.join(', ')})`]
      );
      if (i % 50 === 0) console.log(`  networks: ${i}/200`);
    }

    // Seed documents
    let dc = 0;
    for (const cid of cwdocs) {
      const nd = Math.floor(Math.random()*3)+1;
      for (let j = 0; j < nd; j++) {
        const dType = pk(dt);
        await sql.query(
          `INSERT INTO documents (client_id,doc_type,name,url) VALUES ($1,$2,$3,$4)`,
          [cid, dType, `${dType.charAt(0).toUpperCase()+dType.slice(1)} - Cliente ${cid} (${j+1})`, `https://storage.example.com/docs/${dType}/${cid}_${j+1}.pdf`]
        );
        dc++;
      }
    }

    const cc = await sql`SELECT COUNT(*) as c FROM clients`;
    const pc = await sql`SELECT COUNT(*) as c FROM plants`;
    const nc = await sql`SELECT COUNT(*) as c FROM networks`;
    const dcc = await sql`SELECT COUNT(*) as c FROM documents`;
    console.log(`=== DONE === Clients:${cc[0].c} Plants:${pc[0].c} Networks:${nc[0].c} Docs:${dcc[0].c}`);
  } catch(e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  }
}
main();
