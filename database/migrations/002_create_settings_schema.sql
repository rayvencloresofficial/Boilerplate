-- ==============================================================================
-- 002_create_settings_schema.sql
-- System Settings & Configuration Schema with Categorization & JSONB Support
-- ==============================================================================

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON settings (key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings (category);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON settings (is_public);
