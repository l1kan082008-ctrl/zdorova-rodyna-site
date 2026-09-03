CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INTEGER,
  branch TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  biography TEXT NOT NULL DEFAULT '',
  patient_groups TEXT NOT NULL DEFAULT '[]',
  schedule TEXT NOT NULL DEFAULT '{}',
  photo_key TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_banners (
  id TEXT PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  body_text TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  accent TEXT,
  action_label TEXT NOT NULL,
  href TEXT NOT NULL,
  theme TEXT NOT NULL,
  image_key TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS managed_services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  short_title TEXT NOT NULL,
  card_description TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL,
  image_key TEXT,
  image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  show_on_services_page INTEGER NOT NULL DEFAULT 1,
  show_on_home INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS center_locations (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  full_address TEXT NOT NULL,
  landmark TEXT,
  description TEXT NOT NULL DEFAULT '',
  hours_json TEXT NOT NULL DEFAULT '[]',
  phone TEXT NOT NULL DEFAULT '',
  services_json TEXT NOT NULL DEFAULT '[]',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  gallery_json TEXT NOT NULL DEFAULT '[]',
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branch_services (
  location_id TEXT PRIMARY KEY,
  service_ids TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  amount INTEGER NOT NULL,
  turnaround TEXT NOT NULL DEFAULT 'Уточнюйте',
  cito_available INTEGER NOT NULL DEFAULT 0,
  cito_surcharge INTEGER NOT NULL DEFAULT 0,
  aliases TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_catalog_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  doctor TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'legacy',
  consent_version TEXT NOT NULL DEFAULT '',
  consent_at TEXT NOT NULL DEFAULT '',
  retention_until TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at BIGINT NOT NULL,
  idle_expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  last_seen_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  fingerprint TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started_at BIGINT NOT NULL,
  blocked_until BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_submission_attempts (
  fingerprint TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started_at BIGINT NOT NULL,
  blocked_until BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_content_revisions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_label TEXT NOT NULL,
  action TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  changed_fields_json TEXT NOT NULL DEFAULT '[]',
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS doctors_name_idx ON doctors (name);
CREATE INDEX IF NOT EXISTS home_banners_sort_idx ON home_banners (sort_order, updated_at);
CREATE INDEX IF NOT EXISTS managed_services_sort_idx ON managed_services (sort_order, short_title);
CREATE INDEX IF NOT EXISTS center_locations_sort_idx ON center_locations (sort_order, city, address);
CREATE INDEX IF NOT EXISTS price_items_category_idx ON price_items (category, sort_order, name);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_retention_idx ON bookings (retention_until);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS admin_login_attempts_updated_idx ON admin_login_attempts (updated_at);
CREATE INDEX IF NOT EXISTS public_submission_attempts_updated_idx ON public_submission_attempts (updated_at);
CREATE INDEX IF NOT EXISTS admin_content_revisions_entity_idx
  ON admin_content_revisions (entity_type, entity_id, created_at DESC);
