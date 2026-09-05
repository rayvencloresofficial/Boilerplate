-- ==============================================================================
-- 001_seed_rbac.sql
-- Default Roles, Permissions, and Initial Demo Accounts
-- Default password for all demo accounts: Password123!
-- Bcrypt hash: $2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am
-- ==============================================================================

-- 1. Insert Base Permissions
INSERT INTO permissions (id, slug, module, description) VALUES
    -- Users Module
    ('10000000-0000-0000-0000-000000000001', 'users:read', 'users', 'Can view user lists and user profiles'),
    ('10000000-0000-0000-0000-000000000002', 'users:create', 'users', 'Can register and create new user accounts'),
    ('10000000-0000-0000-0000-000000000003', 'users:update', 'users', 'Can edit user details and assigned roles'),
    ('10000000-0000-0000-0000-000000000004', 'users:delete', 'users', 'Can deactivate or permanently delete users'),

    -- Roles Module
    ('20000000-0000-0000-0000-000000000001', 'roles:read', 'roles', 'Can view system roles and their permissions'),
    ('20000000-0000-0000-0000-000000000002', 'roles:manage', 'roles', 'Can create, edit, or adjust permissions on roles'),

    -- Analytics & Reporting Module
    ('30000000-0000-0000-0000-000000000001', 'analytics:read', 'analytics', 'Can view business metrics and audit telemetry'),

    -- Settings Module
    ('40000000-0000-0000-0000-000000000001', 'settings:read', 'settings', 'Can read global application settings'),
    ('40000000-0000-0000-0000-000000000002', 'settings:manage', 'settings', 'Can modify system security and runtime settings')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Core System Roles
INSERT INTO roles (id, name, description, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Full unrestricted master access across all system resources', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'admin', 'Administrative privileges for user and role management', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'manager', 'Operational lead with read access to users and analytics', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'user', 'Standard user with base profile access', TRUE)
ON CONFLICT DO NOTHING;

-- 3. Map Permissions to Roles
-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin: users:* , roles:read, analytics:read, settings:read
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE slug IN ('users:read', 'users:create', 'users:update', 'users:delete', 'roles:read', 'analytics:read', 'settings:read')
ON CONFLICT DO NOTHING;

-- Manager: users:read, analytics:read, settings:read
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE slug IN ('users:read', 'analytics:read', 'settings:read')
ON CONFLICT DO NOTHING;

-- User: base profile permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE slug IN ('settings:read')
ON CONFLICT DO NOTHING;

-- 4. Seed Demo Users (Password: Password123!)
-- Hash generated via bcrypt: $2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am
-- Phone numbers encrypted via AES-256-GCM dynamically at seed time
INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, phone_number) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'superadmin@example.com', '$2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am', 'Sarah', 'Vance', TRUE, '{{ENCRYPT:+1-555-019-2834}}'),
    ('a0000000-0000-0000-0000-000000000002', 'admin@example.com', '$2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am', 'Alex', 'Rivera', TRUE, '{{ENCRYPT:+1-555-019-5847}}'),
    ('a0000000-0000-0000-0000-000000000003', 'manager@example.com', '$2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am', 'Marcus', 'Chen', TRUE, '{{ENCRYPT:+1-555-019-9182}}'),
    ('a0000000-0000-0000-0000-000000000004', 'user@example.com', '$2b$10$03tdEs/QHIl1bgMbsxbfmOS2HBG0nIxU2AvooyHswsvHylfWAQ0am', 'Elena', 'Rostova', TRUE, '{{ENCRYPT:+1-555-019-3341}}')
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    phone_number = EXCLUDED.phone_number;

-- 5. Assign Roles to Demo Users
INSERT INTO user_roles (user_id, role_id) VALUES
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'), -- super_admin
    ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'), -- admin
    ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003'), -- manager
    ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004')  -- user
ON CONFLICT DO NOTHING;
