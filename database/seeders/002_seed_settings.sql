-- ==============================================================================
-- 002_seed_settings.sql
-- Default System Settings Seed Data
-- ==============================================================================

INSERT INTO settings (id, key, value, category, description, is_public) VALUES
    ('50000000-0000-0000-0000-000000000001', 'app.name', '"RBAC Core"'::jsonb, 'general', 'Primary application display title', TRUE),
    ('50000000-0000-0000-0000-000000000002', 'app.description', '"Enterprise Role-Based Access Control Console"'::jsonb, 'general', 'Workspace subtitle and meta description', TRUE),
    ('50000000-0000-0000-0000-000000000003', 'security.session_timeout_minutes', '60'::jsonb, 'security', 'JWT session duration before token refresh', FALSE),
    ('50000000-0000-0000-0000-000000000004', 'security.mfa_enforced', 'false'::jsonb, 'security', 'Enforce multi-factor authentication for administrative users', FALSE),
    ('50000000-0000-0000-0000-000000000005', 'security.max_login_attempts', '5'::jsonb, 'security', 'Maximum failed login attempts before account lockout', FALSE),
    ('50000000-0000-0000-0000-000000000006', 'appearance.brand_color', '"#185ee0"'::jsonb, 'appearance', 'Global primary accent color', TRUE),
    ('50000000-0000-0000-0000-000000000007', 'appearance.default_theme', '"dark"'::jsonb, 'appearance', 'Default color scheme for new visitors', TRUE),
    ('50000000-0000-0000-0000-000000000008', 'system.maintenance_mode', 'false'::jsonb, 'system', 'Flag to put application into maintenance mode', TRUE),
    ('50000000-0000-0000-0000-000000000009', 'system.audit_logging', 'true'::jsonb, 'system', 'Persist telemetry and RFC 7807 access audit logs', FALSE),
    ('50000000-0000-0000-0000-000000000010', 'appearance.font_family', '"Plus Jakarta Sans"'::jsonb, 'appearance', 'Global primary UI typography font family', TRUE),
    ('50000000-0000-0000-0000-000000000011', 'appearance.heading_font_family', '"Plus Jakarta Sans"'::jsonb, 'appearance', 'Global heading and title typography font family', TRUE)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_public = EXCLUDED.is_public,
    updated_at = NOW();
