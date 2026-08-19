-- Mirador local-first schema (v1)
-- Reference tables are read-mostly (seeded later). User tables are read-write.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reference: airports
CREATE TABLE IF NOT EXISTS airports (
  id TEXT PRIMARY KEY,
  icao TEXT,
  iata TEXT,
  name TEXT NOT NULL,
  type TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  elev_ft INTEGER,
  country TEXT,
  municipality TEXT
);

CREATE INDEX IF NOT EXISTS idx_airports_icao ON airports(icao);
CREATE INDEX IF NOT EXISTS idx_airports_bbox ON airports(lat, lon);

CREATE TABLE IF NOT EXISTS runways (
  id TEXT PRIMARY KEY,
  airport_id TEXT NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  designator TEXT,
  length_ft INTEGER,
  width_ft INTEGER,
  surface TEXT,
  heading_true REAL,
  lat_le REAL,
  lon_le REAL,
  lat_he REAL,
  lon_he REAL
);

CREATE INDEX IF NOT EXISTS idx_runways_airport ON runways(airport_id);

CREATE TABLE IF NOT EXISTS frequencies (
  id TEXT PRIMARY KEY,
  airport_id TEXT REFERENCES airports(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  mhz REAL NOT NULL,
  name TEXT,
  stream_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_frequencies_airport ON frequencies(airport_id);

CREATE TABLE IF NOT EXISTS navaids (
  id TEXT PRIMARY KEY,
  ident TEXT,
  name TEXT,
  type TEXT NOT NULL,
  freq_mhz REAL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  elev_ft INTEGER,
  country TEXT
);

CREATE INDEX IF NOT EXISTS idx_navaids_bbox ON navaids(lat, lon);
CREATE INDEX IF NOT EXISTS idx_navaids_ident ON navaids(ident);

CREATE TABLE IF NOT EXISTS airspaces (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT NOT NULL,
  class TEXT,
  lower_raw TEXT,
  upper_raw TEXT,
  country TEXT,
  geojson TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_airspaces_type ON airspaces(type);

CREATE TABLE IF NOT EXISTS waypoints (
  id TEXT PRIMARY KEY,
  ident TEXT,
  name TEXT,
  type TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  user_owned INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_waypoints_bbox ON waypoints(lat, lon);

-- User: track logging
CREATE TABLE IF NOT EXISTS track_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  label TEXT
);

CREATE TABLE IF NOT EXISTS track_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES track_sessions(id) ON DELETE CASCADE,
  ts TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  alt_ft REAL,
  gs_kt REAL,
  heading_deg REAL,
  source TEXT
);

CREATE INDEX IF NOT EXISTS idx_track_points_session ON track_points(session_id, ts);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_artifacts (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  label TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Optional bbox helper for point features (airports / navaids / waypoints).
-- Populated by import tooling later (empty in foundation).
CREATE VIRTUAL TABLE IF NOT EXISTS feature_rtree USING rtree(
  id,
  min_lat,
  max_lat,
  min_lon,
  max_lon
);
