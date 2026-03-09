// Generates SQL statements and prints them as JSON array for database insertion

const SANTIAGO_CENTER = { lat: -33.4489, lng: -70.6693 };
const SPREAD = { lat: 0.12, lng: 0.15 };

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}
function randomLat() {
  return SANTIAGO_CENTER.lat + randBetween(-SPREAD.lat, SPREAD.lat);
}
function randomLng() {
  return SANTIAGO_CENTER.lng + randBetween(-SPREAD.lng, SPREAD.lng);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function esc(str) {
  return str.replace(/'/g, "''");
}

const comunas = [
  'Providencia', 'Las Condes', 'Vitacura', 'Santiago Centro', 'Nunoa',
  'La Reina', 'Macul', 'San Joaquin', 'La Florida', 'Penalolen',
  'Maipu', 'Cerrillos', 'Estacion Central', 'Quinta Normal', 'Recoleta',
  'Independencia', 'Conchali', 'Huechuraba', 'Renca', 'Quilicura',
  'Pudahuel', 'Lo Prado', 'Cerro Navia', 'San Miguel', 'La Cisterna'
];

const calles = [
  'Av. Providencia', 'Av. Apoquindo', 'Av. Las Condes', 'Av. Vitacura',
  'Alameda', 'Calle Merced', 'Calle Monjitas',
  'Av. Irarrazaval', 'Av. Grecia', 'Av. Macul', 'Calle Los Leones',
  'Av. Pedro de Valdivia', 'Av. Tobalaba', 'Av. Manquehue', 'Calle Suecia',
  'Av. 11 de Septiembre', 'Calle Agustinas', 'Calle Huerfanos',
  'Av. Matta', 'Av. Santa Rosa', 'Av. Vicuna Mackenna',
  'Av. Americo Vespucio', 'Autopista Central'
];

const clientTypes = ['industrial', 'comercial', 'habitacional', 'gobierno'];
const establishmentTypes = {
  gobierno: ['municipal', 'oficina'],
  industrial: ['fabrica', 'otro'],
  comercial: ['supermercado', 'oficina', 'hospital', 'colegio', 'otro'],
  habitacional: ['residencial', 'otro']
};
const criticalities = ['alta', 'media', 'baja'];
const docTypes = ['contrato', 'inspeccion', 'certificado', 'foto', 'plano', 'informe'];
const networkTypes = ['red_primaria', 'red_secundaria', 'red_distribucion', 'conexion'];
const materials = ['acero', 'polietileno', 'cobre', 'PVC', 'hierro_ductil'];

const lines = [];
const clientsWithDocs = [];

// Clients
for (let i = 1; i <= 300; i++) {
  const code = `CLI-${String(i).padStart(5, '0')}`;
  const clientType = pick(clientTypes);
  const estType = pick(establishmentTypes[clientType]);
  const comuna = pick(comunas);
  const calle = pick(calles);
  const numero = Math.floor(Math.random() * 9000) + 100;
  const name = `Cliente ${comuna} ${i}`;
  const address = `${calle} ${numero}, ${comuna}, Santiago`;
  const status = Math.random() > 0.15 ? 'activo' : 'inactivo';
  const criticality = pick(criticalities);
  const hasDocs = Math.random() > 0.3;
  const hasPhotos = Math.random() > 0.5;
  const lat = randomLat().toFixed(6);
  const lng = randomLng().toFixed(6);
  if (hasDocs) clientsWithDocs.push(i);
  lines.push(`INSERT INTO clients (code, name, address, client_type, establishment_type, status, criticality, has_documents, has_photos, geom) VALUES ('${esc(code)}', '${esc(name)}', '${esc(address)}', '${clientType}', '${estType}', '${status}', '${criticality}', ${hasDocs}, ${hasPhotos}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))`);
}

// Plants
const plantData = [
  { name: 'Planta Principal Maipu', type: 'planta_principal', lat: -33.5100, lng: -70.7570, capacity: '500000 m3/dia' },
  { name: 'Planta La Florida', type: 'planta_principal', lat: -33.5170, lng: -70.5880, capacity: '350000 m3/dia' },
  { name: 'Oficina Regional Providencia', type: 'oficina_regional', lat: -33.4260, lng: -70.6100, capacity: 'N/A' },
  { name: 'Oficina Regional Las Condes', type: 'oficina_regional', lat: -33.4070, lng: -70.5670, capacity: 'N/A' },
  { name: 'Subestacion Nunoa', type: 'subestacion', lat: -33.4530, lng: -70.5960, capacity: '120000 m3/dia' },
  { name: 'Subestacion Recoleta', type: 'subestacion', lat: -33.4070, lng: -70.6420, capacity: '80000 m3/dia' },
  { name: 'Subestacion Quilicura', type: 'subestacion', lat: -33.3570, lng: -70.7310, capacity: '95000 m3/dia' },
  { name: 'Centro Distribucion Sur', type: 'centro_distribucion', lat: -33.5340, lng: -70.6600, capacity: '200000 m3/dia' },
  { name: 'Centro Distribucion Norte', type: 'centro_distribucion', lat: -33.3800, lng: -70.6500, capacity: '180000 m3/dia' },
  { name: 'Subestacion Pudahuel', type: 'subestacion', lat: -33.4350, lng: -70.7500, capacity: '110000 m3/dia' },
];
for (let i = 0; i < plantData.length; i++) {
  const p = plantData[i];
  const code = `PLT-${String(i + 1).padStart(3, '0')}`;
  const status = i < 8 ? 'activo' : 'mantenimiento';
  lines.push(`INSERT INTO plants (code, name, plant_type, status, capacity, geom) VALUES ('${code}', '${esc(p.name)}', '${p.type}', '${status}', '${esc(p.capacity)}', ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326))`);
}

// Networks
for (let i = 1; i <= 200; i++) {
  const code = `NET-${String(i).padStart(4, '0')}`;
  const netType = pick(networkTypes);
  const name = `Tramo ${pick(comunas)} ${i}`;
  const status = Math.random() > 0.1 ? 'activo' : (Math.random() > 0.5 ? 'inactivo' : 'en_construccion');
  const material = pick(materials);
  const diameter = pick([100, 150, 200, 250, 300, 400, 500, 600]);
  const baseLat = randomLat();
  const baseLng = randomLng();
  const numPoints = Math.floor(Math.random() * 3) + 2;
  const points = [];
  for (let j = 0; j < numPoints; j++) {
    const pLng = (baseLng + randBetween(-0.008, 0.008)).toFixed(6);
    const pLat = (baseLat + randBetween(-0.005, 0.005)).toFixed(6);
    points.push(`${pLng} ${pLat}`);
  }
  const lineWkt = `LINESTRING(${points.join(', ')})`;
  lines.push(`INSERT INTO networks (code, name, network_type, status, material, diameter_mm, geom) VALUES ('${code}', '${esc(name)}', '${netType}', '${status}', '${material}', ${diameter}, ST_SetSRID(ST_GeomFromText('${lineWkt}'), 4326))`);
}

// Documents
for (const clientIdx of clientsWithDocs) {
  const numDocs = Math.floor(Math.random() * 3) + 1;
  for (let j = 0; j < numDocs; j++) {
    const docType = pick(docTypes);
    const docName = `${docType.charAt(0).toUpperCase() + docType.slice(1)} - Cliente ${clientIdx} (${j + 1})`;
    const url = `https://storage.example.com/docs/${docType}/${clientIdx}_${j + 1}.pdf`;
    lines.push(`INSERT INTO documents (client_id, doc_type, name, url) VALUES (${clientIdx}, '${docType}', '${esc(docName)}', '${url}')`);
  }
}

console.log(JSON.stringify(lines));
