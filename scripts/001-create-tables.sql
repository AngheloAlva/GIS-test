-- Drop existing tables
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS networks CASCADE;

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(400),
  client_type VARCHAR(50) NOT NULL CHECK (client_type IN ('industrial', 'comercial', 'habitacional', 'gobierno')),
  establishment_type VARCHAR(50) CHECK (establishment_type IN ('hospital', 'colegio', 'supermercado', 'oficina', 'fabrica', 'residencial', 'municipal', 'otro')),
  status VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  criticality VARCHAR(10) NOT NULL DEFAULT 'baja' CHECK (criticality IN ('alta', 'media', 'baja')),
  has_documents BOOLEAN DEFAULT false,
  has_photos BOOLEAN DEFAULT false,
  geom GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants table
CREATE TABLE plants (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  plant_type VARCHAR(50) NOT NULL CHECK (plant_type IN ('planta_principal', 'oficina_regional', 'subestacion', 'centro_distribucion')),
  status VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'mantenimiento')),
  capacity VARCHAR(100),
  geom GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Networks table
CREATE TABLE networks (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200),
  network_type VARCHAR(50) NOT NULL CHECK (network_type IN ('red_primaria', 'red_secundaria', 'red_distribucion', 'conexion')),
  status VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'en_construccion')),
  material VARCHAR(50),
  diameter_mm INTEGER,
  geom GEOMETRY(LineString, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('contrato', 'inspeccion', 'certificado', 'foto', 'plano', 'informe')),
  name VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial indexes
CREATE INDEX idx_clients_geom ON clients USING GIST (geom);
CREATE INDEX idx_plants_geom ON plants USING GIST (geom);
CREATE INDEX idx_networks_geom ON networks USING GIST (geom);

-- Regular indexes
CREATE INDEX idx_clients_status ON clients (status);
CREATE INDEX idx_clients_criticality ON clients (criticality);
CREATE INDEX idx_clients_type ON clients (client_type);
CREATE INDEX idx_clients_establishment ON clients (establishment_type);
CREATE INDEX idx_documents_client ON documents (client_id);
