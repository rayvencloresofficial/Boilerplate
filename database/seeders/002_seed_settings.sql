-- ==============================================================================
-- 002_seed_settings.sql
-- Default System Settings Seed Data
-- ==============================================================================

INSERT INTO settings (id, key, value, category, description, is_public, is_encrypted) VALUES
    ('50000000-0000-0000-0000-000000000001', 'app.name', '"RBAC Core"'::jsonb, 'general', 'Primary application display title', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000002', 'app.description', '"Enterprise Role-Based Access Control Console"'::jsonb, 'general', 'Workspace subtitle and meta description', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000003', 'security.session_timeout_minutes', '60'::jsonb, 'security', 'JWT session duration before token refresh', FALSE, FALSE),
    ('50000000-0000-0000-0000-000000000004', 'security.mfa_enforced', 'false'::jsonb, 'security', 'Enforce multi-factor authentication for administrative users', FALSE, FALSE),
    ('50000000-0000-0000-0000-000000000005', 'security.max_login_attempts', '5'::jsonb, 'security', 'Maximum failed login attempts before account lockout', FALSE, FALSE),
    ('50000000-0000-0000-0000-000000000006', 'appearance.brand_color', '"#185ee0"'::jsonb, 'appearance', 'Global primary accent color', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000007', 'appearance.default_theme', '"dark"'::jsonb, 'appearance', 'Default color scheme for new visitors', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000008', 'system.maintenance_mode', 'false'::jsonb, 'system', 'Flag to put application into maintenance mode', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000009', 'system.audit_logging', 'true'::jsonb, 'system', 'Persist telemetry and RFC 7807 access audit logs', FALSE, FALSE),
    ('50000000-0000-0000-0000-000000000010', 'appearance.font_family', '"Plus Jakarta Sans"'::jsonb, 'appearance', 'Global primary UI typography font family', TRUE, FALSE),
    ('50000000-0000-0000-0000-000000000011', 'appearance.heading_font_family', '"Plus Jakarta Sans"'::jsonb, 'appearance', 'Global heading and title typography font family', TRUE, FALSE),

    -- Encrypted Secrets & System Credentials (dynamically encrypted at seed time via AES-256-GCM)
    ('50000000-0000-0000-0000-000000000020', 'secrets.smtp_password', '"{{ENCRYPT:smtp-super-secret-password-123}}"'::jsonb, 'secrets', 'Encrypted SMTP password for transactional mailer', FALSE, TRUE),
    ('50000000-0000-0000-0000-000000000021', 'secrets.payment_webhook_secret', '"{{ENCRYPT:whsec_9b8c7d6e5f4a3b2c1d0e}}"'::jsonb, 'secrets', 'Encrypted webhook signing secret for payment provider', FALSE, TRUE),
    ('50000000-0000-0000-0000-000000000022', 'secrets.external_api_token', '"{{ENCRYPT:tok_live_77112233445566}}"'::jsonb, 'secrets', 'Encrypted third-party API integration bearer token', FALSE, TRUE)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public,
    is_encrypted = EXCLUDED.is_encrypted,
    updated_at = NOW();
