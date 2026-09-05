# Full-Stack Boilerplate Manual (BFF Architecture)

A comprehensive developer, operator, and architecture manual for building, extending, and scaling applications with this Backend-For-Frontend (BFF) monorepo.

---

## Table of Contents

1. [Architectural Principles & Monorepo Structure](#1-architectural-principles--monorepo-structure)
2. [Monorepo Directory Layout](#2-monorepo-directory-layout)
3. [Configuration & Environment Variables](#3-configuration--environment-variables)
4. [Database & Migration Engine Guide](#4-database--migration-engine-guide)
5. [Authentication & RBAC Security Engine](#5-authentication--rbac-security-engine)
6. [Step-by-Step Tutorial: Adding a New Feature Module](#6-step-by-step-tutorial-adding-a-new-feature-module)
   - [Phase 1: Database Migration & Seeder (`database/`)](#phase-1-database-migration--seeder-database)
   - [Phase 2: Backend 3-Tier BFF Implementation (`[admin|client]/backend/`)](#phase-2-backend-3-tier-bff-implementation-adminclientbackend)
   - [Phase 3: Frontend Joy UI Integration (`[admin|client]/frontend/`)](#phase-3-frontend-joy-ui-integration-adminclientfrontend)
7. [Frontend Design System & Styling Conventions](#7-frontend-design-system--styling-conventions)
8. [Backend Engineering Standards & API Protocols](#8-backend-engineering-standards--api-protocols)
9. [Production Build & Deployment Guide](#9-production-build--deployment-guide)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Architectural Principles & Monorepo Structure

This repository is architected as a **Backend-For-Frontend (BFF)** monorepo, pairing dedicated frontends with tailored backend gateways, backed by a centralized authentication microservice and an isolated database workspace.

```text
┌──────────────────────────────────────────┐            ┌──────────────────────────────────────────┐
│          ADMIN PORTAL (PORT 5173)        │            │         CLIENT PORTAL (PORT 5174)        │
│  Admin Frontend (React 19 + Joy UI)      │            │  Client Frontend (React 19 + Joy UI)     │
│  http://localhost:5173                   │            │  http://localhost:5174                   │
└────────────────────┬─────────────────────┘            └────────────────────┬─────────────────────┘
                     │ REST API Requests                                     │ REST API Requests    
                     ▼                                                       ▼                      
┌──────────────────────────────────────────┐            ┌──────────────────────────────────────────┐
│          ADMIN BFF (PORT 3000)           │            │         CLIENT BFF (PORT 4000)           │
│  Express + TypeScript + Kysely           │            │  Express + TypeScript + Kysely           │
│  http://localhost:3000/api/v1            │            │  http://localhost:4000/api/v1            │
└──────────┬───────────────────┬───────────┘            └───────────┬──────────────────┬───────────┘
           │                   │ Auth Delegation                    │                  │            
           │                   │ (/api/v1/auth/*)                   │ Auth Delegation  │            
           │                   └───────────────┐    ┌───────────────┘ (/api/v1/auth/*) │            
           │                                   ▼    ▼                                  │            
           │                     ┌──────────────────────────────┐                      │            
           │                     │   AUTH SERVICE (PORT 5000)   │                      │            
           │                     │  Centralized Authentication  │                      │            
           │                     │  JWT Tokens & Refresh Rot.   │                      │            
           │                     │  http://localhost:5000       │                      │            
           │                     └──────────────┬───────────────┘                      │            
           │                                    │ User Credentials &                   │            
           │ Kysely SQL                         │ Session Storage                      │ Kysely SQL 
           │ Queries                            ▼ Queries                              │ Queries    
           ▼                                                                           ▼            
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               POSTGRESQL 17+ DATABASE (PORT 5432)                                │
│                                         boilerplate_db                                           │
│  • users               • roles                 • permissions          • user_roles               │
│  • refresh_tokens      • role_permissions      • settings             • (domain feature tables)  │
└────────────────────────────────────────────────▲─────────────────────────────────────────────────┘
                                                 │ DDL Schema Migrations & Seeders                  
                                                 │ (Atomic Transactions)                            
                                  ┌──────────────┴───────────────┐                                  
                                  │  DATABASE ENGINE (database/) │                                  
                                  │  Standalone Kysely Runner    │                                  
                                  │  • migrations/*.sql          │                                  
                                  │  • seeders/*.sql             │                                  
                                  └──────────────────────────────┘                                  
```

### Core Architecture Principles

1. **Dedicated BFF Gateways**:
   - `admin/frontend` exclusively consumes `admin/backend` (`http://localhost:3000/api/v1`).
   - `client/frontend` exclusively consumes `client/backend` (`http://localhost:4000/api/v1`).
   - Each BFF shapes data models specifically for its frontend interface, avoiding over-fetching and minimizing client payload processing.

2. **Centralized Authentication Authority (`services/auth-service`)**:
   - Manages user identities, bcrypt credential hashing, JWT token generation, refresh token rotation (SHA-256 stored in DB), and session revocations.
   - Enforces portal access segregation:
     - **Admin Portal (`port 5173`)**: Exclusively reserved for administrative roles (`super_admin`, `admin`, `manager`, and custom back-office roles).
     - **Client Portal (`port 5174`)**: Exclusively reserved for standard users (`user` role).

3. **Database Isolation & Single Source of Truth (`database/`)**:
   - **Zero Migrations in BFFs**: All DDL schemas (`migrations/`), data fixtures (`seeders/`), and runner scripts reside exclusively in `database/`.
   - **Strict Boundary**: BFF backends never manage schema definitions or seeds. They execute parameterized runtime queries via Kysely.
   - **Atomic Transaction Execution**: Every migration and seeder executes inside an atomic SQL transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
   - **Auto-Database Creation**: Connects to the default `postgres` database and creates `boilerplate_db` if it does not exist.

4. **Component Priority Order on Frontend**:
   - **Priority 1**: Local UI Wrappers (`@/components/ui/` - `Container`, `Button`, `Typography`). **Use `Container` instead of Joy/MUI `Card`**.
   - **Priority 2**: Joy UI (`@mui/joy`) as the primary design system using semantic tokens and `sx` props.
   - **Priority 3**: MUI Material (`@mui/material`) strictly as fallback when Joy UI lacks an equivalent widget.

---

## 2. Monorepo Directory Layout

```text
Boilerplate/
├── .agents/                      # AI Engineer personas, workflows & guidelines
│   ├── Senior_Backend.md
│   ├── Senior_Frontend.md
│   ├── rules/
│   │   └── instructions.md       # Global architectural rules and BFF boundaries
│   └── workflows/
│       ├── 01_database_workflow.md
│       ├── 02_backend_workflow.md
│       └── 03_frontend_workflow.md
├── admin/                        # Admin Workspace (Back-Office Administration)
│   ├── backend/                  # Admin BFF API (Express, TypeScript, Kysely) [Port 3000]
│   │   ├── src/
│   │   │   ├── config/           # Database pool & environment loader
│   │   │   ├── controllers/      # HTTP request handlers & Zod body parsers
│   │   │   ├── errors/           # Custom AppError & RFC 7807 problem classes
│   │   │   ├── middlewares/      # Authentication, RBAC, Validation, Error Handler
│   │   │   ├── repositories/     # Kysely database query access
│   │   │   ├── routes/           # Express routes with requirePermission guards
│   │   │   ├── services/         # Business logic & auth-service delegation
│   │   │   ├── types/            # Database interface & DTO contracts
│   │   │   ├── validations/      # Zod validation schemas
│   │   │   ├── app.ts            # Express application setup
│   │   │   └── server.ts         # Server bootloader & port listener
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                 # Admin SPA (React 19, Joy UI, Vite) [Port 5173]
│       ├── src/
│       │   ├── components/       # UI wrappers, Layout, PermissionGate, Modals
│       │   ├── constants/        # Application constants & navigation items
│       │   ├── context/          # AuthContext & AuthProvider
│       │   ├── hooks/            # useAuth, useThemeColors
│       │   ├── pages/            # Admin pages (Users, Roles, Settings, Dashboard)
│       │   ├── routes/           # ProtectedRoute & AppRoutes
│       │   ├── services/         # Type-safe API client wrappers
│       │   ├── types/            # TypeScript interfaces & API contracts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── .env.example
│       ├── package.json
│       └── vite.config.ts
├── client/                       # Client Workspace (Consumer / End-User Portal)
│   ├── backend/                  # Client BFF API (Express, TypeScript, Kysely) [Port 4000]
│   │   ├── src/                  # Controller -> Service -> Repository 3-Tier Layer
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                 # Client SPA (React 19, Joy UI, Vite) [Port 5174]
│       ├── src/                  # Client portal pages, components & API services
│       ├── .env.example
│       ├── package.json
│       └── vite.config.ts
├── services/
│   └── auth-service/             # Centralized Auth Microservice [Port 5000]
│       ├── src/
│       │   ├── config/           # Database pool & JWT environment configs
│       │   ├── controllers/      # Login, register, refresh, demoLogin, verifyToken
│       │   ├── middlewares/      # Auth validation & rate limiting
│       │   ├── repositories/     # User, role, and refresh_token database queries
│       │   ├── routes/           # /api/v1/auth routes
│       │   ├── services/         # Token issuance, bcrypt hashing, portal checks
│       │   └── server.ts
│       ├── .env.example
│       ├── package.json
│       └── tsconfig.json
├── database/                     # Standalone Database Package (DDL & Seeders)
│   ├── migrations/               # Sequential DDL files (e.g. 001_create_rbac_schema.sql)
│   ├── seeders/                  # Sequential seeder files (e.g. 001_seed_rbac.sql)
│   ├── src/
│   │   ├── client.ts             # Connection pool & auto-db creation
│   │   ├── migrate.ts            # Migration execution runner
│   │   ├── seed.ts               # Seeder execution runner
│   │   └── reset.ts              # Combined drop, migration & seeder runner
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Architecture, guides & API specifications
│   ├── BOILERPLATE_MANUAL.md
│   └── RBAC_GUIDE.md
├── docker-compose.yml            # PostgreSQL 17 Alpine container definition
└── package.json                  # Root monorepo workspace configuration
```

---

## 3. Configuration & Environment Variables

The monorepo uses isolated environment files configured per workspace:

### 3.1 Auth Microservice Configuration (`services/auth-service/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `5000` | Port where the centralized auth microservice listens |
| `NODE_ENV` | `string` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string |
| `JWT_SECRET` | `string` | _secure-random-secret_ | Key used to sign and verify Access Tokens |
| `JWT_EXPIRES_IN` | `string` | `1h` | Access Token lifetime |
| `JWT_REFRESH_SECRET` | `string` | _secure-refresh-secret_ | Key used to sign and verify Refresh Tokens |
| `JWT_REFRESH_EXPIRES_IN` | `string` | `7d` | Refresh Token lifetime |

### 3.2 Admin BFF Configuration (`admin/backend/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `3000` | Port where Admin BFF Express API listens |
| `NODE_ENV` | `string` | `development` | Runtime environment |
| `CLIENT_URL` | `string` | `http://localhost:5173` | Allowed CORS origin (Admin Frontend) |
| `AUTH_SERVICE_URL` | `string` | `http://localhost:5000/api/v1` | URL of the central Auth Microservice |
| `CLIENT_BACKEND_API` | `string` | `http://localhost:4000/api/v1` | Optional Client BFF endpoint for inter-BFF communication |
| `DATABASE_URL` | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string |
| `JWT_SECRET` | `string` | _secure-random-secret_ | Shared secret to verify access tokens locally |
| `JWT_REFRESH_SECRET` | `string` | _secure-refresh-secret_ | Shared secret for refresh verification |

### 3.3 Admin Frontend Configuration (`admin/frontend/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `string` | `http://localhost:3000/api/v1` | Base API URL pointing to the Admin BFF |

### 3.4 Client BFF Configuration (`client/backend/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `4000` | Port where Client BFF Express API listens |
| `NODE_ENV` | `string` | `development` | Runtime environment |
| `CLIENT_URL` | `string` | `http://localhost:5174` | Allowed CORS origin (Client Frontend) |
| `AUTH_SERVICE_URL` | `string` | `http://localhost:5000/api/v1` | URL of the central Auth Microservice |
| `DATABASE_URL` | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string |
| `JWT_SECRET` | `string` | _secure-random-secret_ | Shared secret to verify access tokens locally |
| `JWT_REFRESH_SECRET` | `string` | _secure-refresh-secret_ | Shared secret for refresh verification |

### 3.5 Client Frontend Configuration (`client/frontend/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `string` | `http://localhost:4000/api/v1` | Base API URL pointing to the Client BFF |

### 3.6 Database Engine Configuration (`database/.env`)

| Variable | Type | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string for migration runner |

---

## 4. Database & Migration Engine Guide

All schema DDL and seeder state is managed inside `database/` using raw SQL files executed by a TypeScript runner with atomic SQL transactions.

### How Migrations Work

1. The runner inspects `database/migrations/*.sql` in ascending alphanumeric order.
2. It queries the `_migrations` tracking table in PostgreSQL.
3. If an unapplied migration is discovered:
   - It begins an atomic transaction (`BEGIN`).
   - Executes all statements inside the SQL file.
   - Records the filename in `_migrations`.
   - Commits the transaction (`COMMIT`).
4. If any error occurs, the runner executes a `ROLLBACK`, leaving the database clean and reporting the exact line and error.

### Automatic Database Creation

When you run `npm run db:migrate`, `database/src/client.ts` attempts to connect to `boilerplate_db`. If the database does not yet exist:

1. It catches error code `3D000` (`database does not exist`).
2. Temporarily connects to the default `postgres` administrative database.
3. Issues `CREATE DATABASE boilerplate_db;`.
4. Reconnects to the newly created `boilerplate_db` and executes all migrations.

### How to Add a New Migration

1. Create a sequentially numbered SQL file in `database/migrations/`:
   ```text
   database/migrations/003_create_documents_schema.sql
   ```
2. Write idempotent SQL DDL statements:

   ```sql
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

3. Apply the migration:
   ```bash
   npm run db:migrate
   ```

### How to Add a New Seeder

1. Create a sequentially numbered SQL file in `database/seeders/`:
   ```text
   database/seeders/003_seed_documents.sql
   ```
2. Insert permissions and assign them to roles:

   ```sql
   -- 1. Register permissions
   INSERT INTO permissions (id, slug, module, description) VALUES
       ('60000000-0000-0000-0000-000000000001', 'documents:read', 'documents', 'Can browse and view documents'),
       ('60000000-0000-0000-0000-000000000002', 'documents:create', 'documents', 'Can create and upload documents'),
       ('60000000-0000-0000-0000-000000000003', 'documents:delete', 'documents', 'Can archive or delete documents')
   ON CONFLICT (slug) DO NOTHING;

   -- 2. Associate with Super Admin (all)
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions WHERE module = 'documents'
   ON CONFLICT DO NOTHING;

   -- 3. Associate with Admin (read, create, delete)
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
   WHERE slug IN ('documents:read', 'documents:create', 'documents:delete')
   ON CONFLICT DO NOTHING;
   ```

3. Execute the seeders:
   ```bash
   npm run db:seed
   ```

---

## 5. Authentication & RBAC Security Engine

### Database Entity Relationship Model

```text
  users ─────────< user_roles >───────── roles
    │                                      │
    │ owns                                 │ contains
    ▼                                      ▼
refresh_tokens                    role_permissions
                                           │
                                           │ granted_to
                                           ▼
                                      permissions
```

### Key Components

- **`users`**: User identity, email, password hash (bcrypt), full name, `is_active` status, and timestamps.
- **`roles`**: System roles (`super_admin`, `admin`, `manager`, `user`) and custom administrator-created roles.
- **`permissions`**: Granular permission identifiers formatted as `module:action` (e.g., `users:read`, `settings:manage`).
- **`refresh_tokens`**: Stores SHA-256 hashed refresh tokens along with expiration and revocation timestamps.

### Portal Access Segregation & Validation

The Auth Microservice enforces portal restrictions during login:

```typescript
// services/auth-service/src/services/auth.service.ts
export const validatePortalAccess = (roles: string[], portal?: PortalType): void => {
  if (!portal) return;

  const hasAdminOrCustomRole = roles.some((role) => role !== 'user');
  const hasUserRole = roles.includes('user');

  if (portal === 'client') {
    if (hasAdminOrCustomRole && !hasUserRole) {
      throw new ForbiddenError(
        'Access denied: The Client Portal is reserved for regular users. Administrative users must sign in via the Admin Portal.'
      );
    }
    if (!hasUserRole) {
      throw new ForbiddenError('Access denied: You do not have permission to access the Client Portal.');
    }
  } else if (portal === 'admin') {
    if (!hasAdminOrCustomRole) {
      throw new ForbiddenError(
        'Access denied: Administrative privileges required. Regular users must sign in via the Client Portal.'
      );
    }
  }
};
```

### Super Admin Universal Bypass

The `super_admin` role has unconditional master bypass. In backend authorization middlewares:

```typescript
if (req.user?.roles.includes('super_admin')) {
  return next(); // Unconditionally bypasses granular permission checks
}
```

The frontend `ProtectedRoute` and `PermissionGate` components mirror this behavior.

### Protecting Backend BFF Endpoints

In your Express routes (`[admin|client]/backend/src/routes/*.routes.ts`):

```typescript
import { Router } from 'express';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission, requireRole } from '../middlewares/auth/authorization.middleware.js';
import * as docController from '../controllers/document.controller.js';

const router = Router();

// 1. Enforce authentication across all routes
router.use(authenticate);

// 2. Guard route by granular permission slug
router.post('/', requirePermission('documents:create'), docController.createDocument);

// 3. Guard route by specific role
router.delete('/:id', requireRole('super_admin', 'admin'), docController.deleteDocument);

export default router;
```

### Protecting Frontend UI Components & Routes

In your React client:

```tsx
import ProtectedRoute from '@/routes/ProtectedRoute';
import PermissionGate from '@/components/auth/PermissionGate';
import { useAuth } from '@/hooks/useAuth';

// 1. Guard an entire page route in React Router:
<Route
  path="documents"
  element={
    <ProtectedRoute requiredPermission="documents:read">
      <DocumentsPage />
    </ProtectedRoute>
  }
/>

// 2. Conditionally render or disable an action button:
<PermissionGate
  permission="documents:create"
  disableOnly
  tooltipTitle="Requires documents:create clearance"
>
  <Button colorScheme="primary" onClick={handleCreate}>
    New Document
  </Button>
</PermissionGate>

// 3. Programmatic permission checking via hook:
const { hasPermission, hasRole } = useAuth();
if (hasPermission('documents:delete')) {
  // Render destructive actions
}
```

---

## 6. Step-by-Step Tutorial: Adding a New Feature Module

This tutorial demonstrates how to implement a complete end-to-end **Documents** module following the BFF monorepo standards.

---

### Phase 1: Database Migration & Seeder (`database/`)

#### 1. Create Migration File: `database/migrations/003_create_documents_schema.sql`

```sql
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

#### 2. Create Seeder File: `database/seeders/003_seed_documents.sql`

```sql
-- Register Permissions
INSERT INTO permissions (id, slug, module, description) VALUES
    ('60000000-0000-0000-0000-000000000001', 'documents:read', 'documents', 'Can view documents'),
    ('60000000-0000-0000-0000-000000000002', 'documents:create', 'documents', 'Can create and upload documents'),
    ('60000000-0000-0000-0000-000000000003', 'documents:delete', 'documents', 'Can delete documents')
ON CONFLICT (slug) DO NOTHING;

-- Grant to Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions WHERE module = 'documents'
ON CONFLICT DO NOTHING;

-- Grant to Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE slug IN ('documents:read', 'documents:create', 'documents:delete')
ON CONFLICT DO NOTHING;

-- Grant to Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE slug IN ('documents:read', 'documents:create')
ON CONFLICT DO NOTHING;
```

#### 3. Execute Migration & Seeder

```bash
npm run db:migrate
npm run db:seed
```

---

### Phase 2: Backend 3-Tier BFF Implementation (`[admin|client]/backend/`)

Select the target BFF based on the intended portal (`admin/backend` for administration, `client/backend` for client portal).

#### 1. Register Table in `src/types/database.ts`

```typescript
import type { Generated } from 'kysely';

export interface DocumentTable {
  id: Generated<string>;
  title: string;
  content: string | null;
  created_by: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Database {
  // ... existing tables
  documents: DocumentTable;
}
```

#### 2. Create Zod Validation Schemas in `src/validations/document.validation.ts`

```typescript
import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  content: z.string().trim().optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document UUID'),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
```

#### 3. Create Repository in `src/repositories/document.repository.ts`

```typescript
import { db } from '../config/database.js';
import type { CreateDocumentInput } from '../validations/document.validation.js';

export const findDocuments = async () => {
  return await db
    .selectFrom('documents')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute();
};

export const findDocumentById = async (id: string) => {
  return await db
    .selectFrom('documents')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
};

export const insertDocument = async (data: CreateDocumentInput, userId?: string) => {
  return await db
    .insertInto('documents')
    .values({
      title: data.title,
      content: data.content ?? null,
      created_by: userId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export const deleteDocumentById = async (id: string) => {
  return await db
    .deleteFrom('documents')
    .where('id', '=', id)
    .returning(['id'])
    .executeTakeFirst();
};
```

#### 4. Create Service in `src/services/document.service.ts`

```typescript
import * as docRepo from '../repositories/document.repository.js';
import type { CreateDocumentInput } from '../validations/document.validation.js';
import { NotFoundError } from '../errors/AppError.js';

export const listDocuments = async () => {
  return await docRepo.findDocuments();
};

export const getDocument = async (id: string) => {
  const doc = await docRepo.findDocumentById(id);
  if (!doc) throw new NotFoundError(`Document with ID ${id} was not found`);
  return doc;
};

export const createDocument = async (data: CreateDocumentInput, userId?: string) => {
  return await docRepo.insertDocument(data, userId);
};

export const removeDocument = async (id: string) => {
  const deleted = await docRepo.deleteDocumentById(id);
  if (!deleted) throw new NotFoundError(`Document with ID ${id} was not found`);
  return deleted;
};
```

#### 5. Create Controller in `src/controllers/document.controller.ts`

```typescript
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import * as docService from '../services/document.service.js';

export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const docs = await docService.listDocuments();
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
};

export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doc = await docService.createDocument(req.body, req.user?.id);
    res.status(201).json({ success: true, data: doc, message: 'Document created successfully.' });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await docService.removeDocument(req.params.id);
    res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
```

#### 6. Register Routes in `src/routes/document.routes.ts`

```typescript
import { Router } from 'express';
import * as docController from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createDocumentSchema,
  documentIdParamSchema,
} from '../validations/document.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('documents:read'), docController.getDocuments);
router.post(
  '/',
  requirePermission('documents:create'),
  validateRequest({ body: createDocumentSchema }),
  docController.createDocument
);
router.delete(
  '/:id',
  requirePermission('documents:delete'),
  validateRequest({ params: documentIdParamSchema }),
  docController.deleteDocument
);

export default router;
```

Mount inside `src/routes/index.ts`:
```typescript
import documentRoutes from './document.routes.js';
// ...
router.use('/documents', documentRoutes);
```

---

### Phase 3: Frontend Joy UI Integration (`[admin|client]/frontend/`)

#### 1. Define Data Contracts in `src/types/document.ts`

```typescript
export interface DocumentItem {
  id: string;
  title: string;
  content: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentDto {
  title: string;
  content?: string;
}
```

#### 2. Create API Service in `src/services/document.api.ts`

Never make raw `fetch` calls directly inside React components:

```typescript
import type { DocumentItem, CreateDocumentDto } from '../types/document';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/documents`;

export const getDocumentsApi = async (): Promise<DocumentItem[]> => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch documents.');
  const json = await res.json();
  return json.data;
};

export const createDocumentApi = async (payload: CreateDocumentDto): Promise<DocumentItem> => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create document.');
  const json = await res.json();
  return json.data;
};
```

#### 3. Add to Sidebar Navigation in `src/components/ui/Sidebar.tsx`

```tsx
import { FileText } from 'lucide-react';

// Add to navigation items:
{
  title: 'Documents',
  path: '/documents',
  icon: <FileText size={18} />,
  requiredPermission: 'documents:read', // Automatically hidden if user lacks permission
}
```

#### 4. Register Protected Route in `src/routes/AppRoutes.tsx`

```tsx
import DocumentsPage from '../pages/documents/DocumentsPage';

<Route
  path="documents"
  element={
    <ProtectedRoute requiredPermission="documents:read">
      <DocumentsPage />
    </ProtectedRoute>
  }
/>
```

#### 5. Build Page View in `src/pages/documents/DocumentsPage.tsx`

Adhere strictly to the **Component Priority Order**: use local wrappers (`Container`, `Button`, `Typography`) and Joy UI tokens:

```tsx
import React, { useEffect, useState } from 'react';
import { Box, Stack, CircularProgress } from '@mui/joy';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import PermissionGate from '@/components/auth/PermissionGate';
import { getDocumentsApi, createDocumentApi } from '@/services/document.api';
import type { DocumentItem } from '@/types/document';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getDocumentsApi();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreate = async () => {
    const title = prompt('Enter document title:');
    if (!title) return;
    await createDocumentApi({ title });
    fetchDocs();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="title" size="lg" bold>
          Documents Repository
        </Typography>

        <PermissionGate
          permission="documents:create"
          disableOnly
          tooltipTitle="Requires documents:create clearance"
        >
          <Button colorScheme="primary" onClick={handleCreate}>
            New Document
          </Button>
        </PermissionGate>
      </Stack>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <Stack spacing={2}>
          {documents.map((doc) => (
            <Container key={doc.id} elevation={1} style={{ padding: '16px' }}>
              <Typography variant="title" size="sm" bold>
                {doc.title}
              </Typography>
              <Typography variant="body" size="xs" color="#666" style={{ marginTop: '4px' }}>
                Created: {new Date(doc.created_at).toLocaleDateString()}
              </Typography>
            </Container>
          ))}
        </Stack>
      )}
    </Box>
  );
}
```

---

## 7. Frontend Design System & Styling Conventions

### Component Priority Order

1. **Local UI Wrappers** (`src/components/ui/`):
   - Always prefer local custom wrappers: `Container`, `Button`, `Typography`, `Modal`, `Calendar`.
   - **Crucial Rule**: Use custom `Container` instead of Joy UI or MUI `Card`.
2. **Joy UI (`@mui/joy`)**:
   - Primary design system for standard elements: `Box`, `Stack`, `Sheet`, `Input`, `Select`, `Table`.
3. **MUI Material (`@mui/material`)**:
   - Strictly reserved as a fallback when Joy UI lacks a component (e.g., specialized pickers).

### Fast Refresh Strict Hygiene

To maintain Vite Hot Module Replacement (HMR) reliability:

- Files exporting React components **must only export React components** (`react-refresh/only-export-components`).
- Never export helper functions, constants, or types from the same file as a React component.
- Organize types into `src/types/`, constants into `src/constants/`, and context providers cleanly separated into `src/context/*Provider.tsx` and types in `src/context/*.ts`.

---

## 8. Backend Engineering Standards & API Protocols

### Strict TypeScript Rules

- **Zero `any`**: Explicitly define types for request parameters, bodies, responses, and database rows.
- **Discriminated Unions**: Model multiple states with tagged unions for complete type safety.
- **Kysely Queries**: Always execute parameterized, type-safe queries using the Kysely query builder.

### RFC 7807 Problem Details Standard

All error responses adhere to the RFC 7807 problem details specification:

```json
{
  "type": "https://errors.example.com/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Document with ID 60000000-0000-0000-0000-000000000001 was not found.",
  "instance": "/api/v1/documents/60000000-0000-0000-0000-000000000001",
  "errors": []
}
```

The central error handling middleware (`src/middlewares/error.middleware.ts`) automatically serializes `AppError`, `ZodError`, and unexpected errors into RFC 7807 responses.

### Atomic Kysely Transactions

For multi-step database mutations, wrap queries inside an atomic transaction:

```typescript
import { db } from '../config/database.js';

export const archiveDocumentWithAudit = async (docId: string, userId: string) => {
  return await db.transaction().execute(async (trx) => {
    // 1. Mark document as archived
    const updated = await trx
      .updateTable('documents')
      .set({ content: '[ARCHIVED]', updated_at: new Date() })
      .where('id', '=', docId)
      .returningAll()
      .executeTakeFirstOrThrow();

    // 2. Insert audit log entry
    await trx
      .insertInto('audit_logs')
      .values({
        action: 'archive_document',
        entity_id: docId,
        performed_by: userId,
      })
      .execute();

    return updated;
  });
};
```

---

## 9. Production Build & Deployment Guide

### Monorepo Build Commands

From the repository root:

```bash
# Build all 5 workspaces for production
npm run build

# Targeted package builds
npm run build:admin    # Compiles admin-backend (tsc) and admin-frontend (vite build)
npm run build:client   # Compiles client-backend (tsc) and client-frontend (vite build)
npm run build:auth     # Compiles auth-service (tsc)
```

### Running Production Services

```bash
# Auth Microservice (Port 5000)
npm run start -w auth-service

# Admin BFF (Port 3000)
npm run start -w admin-backend

# Client BFF (Port 4000)
npm run start -w client-backend
```

### Static Frontend Production Serving (Vite Preview / Nginx)

The frontend builds output static bundles to `admin/frontend/dist` and `client/frontend/dist`.

**Sample Nginx Reverse Proxy & Static Host Configuration:**

```nginx
# Admin Portal (Port 80 -> Reverse Proxy)
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/boilerplate/admin/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Client Portal
server {
    listen 80;
    server_name portal.yourdomain.com;
    root /var/www/boilerplate/client/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security & Production Checklist

1. **Cryptographic JWT Secrets**: Generate unique secrets using `openssl rand -base64 64` for `JWT_SECRET` and `JWT_REFRESH_SECRET` across all `.env` files.
2. **Restrict CORS**: Configure `CLIENT_URL` in `admin/backend/.env` and `client/backend/.env` to match exact production domain URLs.
3. **PostgreSQL Access**: Change the default database credentials and restrict port `5432` to the internal private network.
4. **Rotate Demo Passwords**: Deactivate or update the password for seeded demo accounts (`Password123!`) before deploying to production.

---

## 10. Troubleshooting & FAQ

### Q1: `ECONNREFUSED 127.0.0.1:5432` during migration or server start
- **Cause**: PostgreSQL is not running or listening on port 5432.
- **Solution**: Run `docker compose up -d` or verify that your local PostgreSQL service is running.

### Q2: Authentication fails with "Auth service is temporarily unavailable" (503)
- **Cause**: The centralized Auth Microservice (`services/auth-service` on port 5000) is not running.
- **Solution**: Ensure `npm run dev:auth` is running whenever testing the Admin or Client stack individually. Running `npm run dev` boots all services concurrently.

### Q3: `403 Forbidden: Access denied: Administrative privileges required`
- **Cause**: Attempting to log into the Admin Portal (`http://localhost:5173`) with a standard consumer account (`user@example.com`).
- **Solution**: Sign in with an administrative persona (`superadmin@example.com`, `admin@example.com`, or `manager@example.com`). Standard users must sign into the Client Portal (`http://localhost:5174`).

### Q4: CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Cause**: `CLIENT_URL` in the BFF `.env` does not match the frontend's origin URL.
- **Solution**: Verify that `admin/backend/.env` has `CLIENT_URL=http://localhost:5173` and `client/backend/.env` has `CLIENT_URL=http://localhost:5174`.

### Q5: How do I completely wipe and recreate the database?
- **Solution**: Run from the root directory:
  ```bash
  npm run db:reset
  ```
  This drops all tables, applies all migrations in `database/migrations/`, and executes all seeders in `database/seeders/`.
