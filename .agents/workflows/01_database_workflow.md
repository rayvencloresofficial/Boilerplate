---
description: Database table creation and permission seeding workflow
---

# Full-Stack Module Creation Workflow

Follow this step-by-step workflow to introduce a new feature module into the repository. It enforces the project's architectural standards across **Database**, **Backend**, **Frontend**, and **RBAC Access Control**.

---

## Architecture Overview of a Module

A complete module spans 4 layers across the monorepo:

```
database/migrations/      --> DDL Table Schema (PostgreSQL)
database/seeders/         --> Module Permissions & Role Mappings
backend/src/
  ├── types/database.ts   --> Kysely Table Interface
  ├── repositories/       --> Type-Safe Database Queries
  ├── services/           --> Domain & Business Logic
  ├── controllers/        --> Zod Request Validation & Response
  └── routes/             --> Auth & Permission Guards (requirePermission)
frontend/src/
  ├── types/              --> TypeScript Data & Payload Contracts
  ├── services/           --> API Client Functions (Fetch Wrappers)
  ├── pages/[module]/     --> Joy UI Views & PermissionGate Actions
  ├── routes/             --> ProtectedRoute Registration
  └── components/ui/      --> Sidebar Navigation Links
```

---

## Step 1: Database Schema & Permissions (`database/`)

All schema definitions and seed data live **exclusively** in the `database/` package. Never place migration or seed scripts inside `backend/`.

### 1.1 Schema Migration (`database/migrations/`)

If the module introduces new tables, create a sequential SQL migration file (e.g., `database/migrations/003_create_documents_schema.sql`):

```sql
-- 003_create_documents_schema.sql
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
```

### 1.2 Seed Permissions & Role Mappings (`database/seeders/`)

Create a seeder file (e.g., `database/seeders/003_seed_documents.sql`):

1. **Insert permissions** with the new `module` name:

   ```sql
   INSERT INTO permissions (id, slug, module, description) VALUES
       ('60000000-0000-0000-0000-000000000001', 'documents:read', 'documents', 'Can browse and view documents'),
       ('60000000-0000-0000-0000-000000000002', 'documents:create', 'documents', 'Can draft and upload new documents'),
       ('60000000-0000-0000-0000-000000000003', 'documents:delete', 'documents', 'Can archive or delete documents')
   ON CONFLICT (slug) DO UPDATE SET
       module = EXCLUDED.module,
       description = EXCLUDED.description;
   ```

2. **Map initial permissions to roles**:

   ```sql
   -- Super Admin: gets all permissions
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
   WHERE module = 'documents'
   ON CONFLICT DO NOTHING;

   -- Admin: gets read, create, delete
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
   WHERE slug IN ('documents:read', 'documents:create', 'documents:delete')
   ON CONFLICT DO NOTHING;

   -- Manager: gets read, create
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
   WHERE slug IN ('documents:read', 'documents:create')
   ON CONFLICT DO NOTHING;

   -- User: gets read only
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
   WHERE slug = 'documents:read'
   ON CONFLICT DO NOTHING;
   ```

### 1.3 Apply Changes

Run migrations and seeders from the project root:

```bash
npm run db:migrate
npm run db:seed
```
