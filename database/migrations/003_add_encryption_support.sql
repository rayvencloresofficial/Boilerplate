-- ==============================================================================
-- 003_add_encryption_support.sql
-- Add encryption support for sensitive settings and user phone numbers
-- ==============================================================================

-- 1. Add is_encrypted column to settings table if not exists
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_settings_is_encrypted ON settings (is_encrypted);

-- 2. Add phone_number column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(255) NULL;
