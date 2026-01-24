-- OpenData.id Costmap Schema
-- DuckDB with Spatial Extension

INSTALL spatial;
LOAD spatial;

-- Regions (514 kabupaten/kota)
CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY,
    code VARCHAR NOT NULL UNIQUE,       -- BPS code e.g. "3171"
    name VARCHAR NOT NULL,              -- "Jakarta Pusat"
    province VARCHAR NOT NULL,          -- "DKI Jakarta"
    type VARCHAR NOT NULL,              -- "kota" | "kabupaten"
    geometry GEOMETRY,                  -- Polygon boundary
    lat DOUBLE,                         -- Centroid latitude
    lng DOUBLE                          -- Centroid longitude
);

-- Wages (UMR per region per year)
CREATE TABLE IF NOT EXISTS wages (
    id INTEGER PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id),
    year INTEGER NOT NULL,
    umr DECIMAL(15,2) NOT NULL,         -- Official minimum wage
    UNIQUE(region_id, year)
);

-- Cost categories
CREATE TABLE IF NOT EXISTS cost_categories (
    id INTEGER PRIMARY KEY,
    slug VARCHAR NOT NULL UNIQUE,       -- "rent", "food", "transport"
    name VARCHAR NOT NULL               -- "Sewa/Kost", "Makanan", "Transportasi"
);

-- Living costs per region
CREATE TABLE IF NOT EXISTS living_costs (
    id INTEGER PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id),
    category_id INTEGER NOT NULL REFERENCES cost_categories(id),
    year INTEGER NOT NULL,
    min_cost DECIMAL(15,2),             -- Budget lifestyle
    avg_cost DECIMAL(15,2),             -- Average
    max_cost DECIMAL(15,2),             -- Comfortable
    UNIQUE(region_id, category_id, year)
);

-- Provinces (34 provinces with pre-computed boundaries)
CREATE TABLE IF NOT EXISTS provinces (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    geometry GEOMETRY,
    lat DOUBLE,
    lng DOUBLE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_regions_province ON regions(province);
CREATE INDEX IF NOT EXISTS idx_wages_region ON wages(region_id);
CREATE INDEX IF NOT EXISTS idx_wages_year ON wages(year);
CREATE INDEX IF NOT EXISTS idx_costs_region ON living_costs(region_id);
CREATE INDEX IF NOT EXISTS idx_costs_year ON living_costs(year);

-- Seed cost categories
INSERT INTO cost_categories (id, slug, name) VALUES
    (1, 'rent', 'Sewa/Kost'),
    (2, 'food', 'Makanan'),
    (3, 'transport', 'Transportasi'),
    (4, 'utilities', 'Listrik/Air/Internet'),
    (5, 'other', 'Lainnya')
ON CONFLICT DO NOTHING;
