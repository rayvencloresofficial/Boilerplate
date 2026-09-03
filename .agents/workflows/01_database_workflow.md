---
description: Database table creation and permission seeding workflow
---

# Full-Stack Module Creation Workflow (BFF Architecture)

Follow this step-by-step workflow to introduce a new feature module into the repository. It enforces the project's architectural standards across the **Database Single Source of Truth**, the **BFF Backend Layer** (`admin/backend` and/or `client/backend`), and the **Frontend Applications** (`admin/frontend` and/or `client/frontend`).

---

## Architecture Overview of a Module in BFF Monorepo

A complete module spans the database and its designated BFF stack:

```
database/migrations/              --> DDL Table Schema (PostgreSQL 17+)
database/seeders/                 --> Module Permissions & Role Mappings

admin/backend/ & client/backend/  --> BFF Tier (Controller -> Service -> Repository)
  ├── src/types/database.ts       --> Kysely Table Interface
  ├── src/repositories/           --> Type-Safe Database Queries
  ├── src/services/               --> BFF Domain & Business Logic
  ├── src/controllers/            --> Zod Request Validation & Response Formatting
  └── src/routes/                 --> Auth & Permission Guards (requirePermission)

admin/frontend/ & client/frontend/ --> Frontend Tier (React 19, Joy UI, Vite)
  ├── src/types/                  --> TypeScript Data & Payload Contracts
  ├── src/services/               --> BFF API Client Functions (Fetch Wrappers)
  ├── src/pages/[module]/         --> Joy UI Views & PermissionGate Actions
  ├── src/routes/                 --> ProtectedRoute Registration
  └── src/components/ui/          --> Sidebar Navigation Links
```

---

## Step 1: Database Schema & Permissions (`database/`)

All schema definitions and seed data live **exclusively** in the `database/` package. Never place migration or seed scripts inside `admin/backend/` or `client/backend/`.

### 1.1 Schema Migration (`database/migrations/`)

If the module introduces new tables, create an atomic SQL migration file (e.g., `database/migrations/003_create_documents_schema.sql`):

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

Create a corresponding seeder file (e.g., `database/seeders/003_seed_documents.sql`):

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
   -- Super Admin: gets all module permissions
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

Execute the database runners from the project root:

```bash
npm run db:migrate
npm run db:seed
```

Or for a full rebuild:
```bash
npm run db:reset
```
