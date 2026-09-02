-- ==============================================================================
-- 003_seed_example_module.sql
-- Example Module: Documents & Records Management
-- Demonstrates dynamic module registration in RBAC Access Control Matrix & Test Portal
-- ==============================================================================

-- 1. Insert Example Module Permissions
INSERT INTO permissions (id, slug, module, description) VALUES
    ('60000000-0000-0000-0000-000000000001', 'documents:read', 'documents', 'Can browse, view, and inspect company documents and archives'),
    ('60000000-0000-0000-0000-000000000002', 'documents:create', 'documents', 'Can draft, upload, and publish new business documents'),
    ('60000000-0000-0000-0000-000000000003', 'documents:delete', 'documents', 'Can archive or purge document records from repository')
ON CONFLICT (slug) DO UPDATE SET
    module = EXCLUDED.module,
    description = EXCLUDED.description;

-- 2. Map Permissions to Roles:
-- Super Admin: gets all permissions (via direct query)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module = 'documents'
ON CONFLICT DO NOTHING;

-- Admin: gets documents:read, documents:create, documents:delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE slug IN ('documents:read', 'documents:create', 'documents:delete')
ON CONFLICT DO NOTHING;

-- Manager: gets documents:read, documents:create
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE slug IN ('documents:read', 'documents:create')
ON CONFLICT DO NOTHING;

-- User: gets documents:read
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE slug = 'documents:read'
ON CONFLICT DO NOTHING;

-- 3. Seed Initial Documents Fixtures
INSERT INTO documents (id, title, content, category, status, created_by, created_at, updated_at) VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'Q3 Financial Audit & Compliance Review',
        'Comprehensive review of Q3 operational and financial audit findings across all business units. Includes balance sheets, EBITDA margins, and statutory compliance status.',
        'financial',
        'published',
        'a0000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '14 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'Enterprise Security & Access Control Policy',
        'Mandatory guidelines on role-based access control, cryptographic key storage, session revocation mechanics, and zero-trust authentication across all engineering stacks.',
        'security',
        'published',
        'a0000000-0000-0000-0000-000000000002',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'Cloud Infrastructure Disaster Recovery Plan',
        'Standard operating procedure detailing failover workflows, automated snapshot restoration, DNS cutover triggers, and recovery time objectives (RTO < 15 mins).',
        'operations',
        'published',
        'a0000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'Product Roadmap & Architecture RFC 2026',
        'Architecture proposal and milestones for micro-frontend adoption, distributed query caching, real-time telemetry metrics, and multi-region read replicas.',
        'product',
        'draft',
        'a0000000-0000-0000-0000-000000000003',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;
