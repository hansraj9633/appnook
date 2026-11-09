
-- AppNook initial database schema

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id INTEGER,
    version TEXT NOT NULL,
    size TEXT,
    icon_key TEXT,
    apk_key TEXT,
    screenshots TEXT DEFAULT '[]',
    features TEXT DEFAULT '[]',
    release_notes TEXT,
    android_version TEXT,
    downloads INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    published INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id);
CREATE INDEX IF NOT EXISTS idx_apps_published ON apps(published);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Initial categories
INSERT OR IGNORE INTO categories (name, slug) VALUES
('Education', 'education'),
('Productivity', 'productivity'),
('Utilities', 'utilities'),
('Developer Tools', 'developer-tools'),
('Lifestyle', 'lifestyle'),
('Entertainment', 'entertainment');
