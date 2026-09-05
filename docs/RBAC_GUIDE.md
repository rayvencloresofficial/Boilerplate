# Production-Ready RBAC Boilerplate Documentation (BFF Architecture)

An enterprise-grade Role-Based Access Control (RBAC) architecture built with **Node.js, Express, TypeScript, Kysely, and PostgreSQL 17** across a **Backend-For-Frontend (BFF)** monorepo, paired with dual **React 19 + Joy UI** frontend portals.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema & Entity Relationship Diagram (ERD)](#2-database-schema--entity-relationship-diagram-erd)
3. [Seeded Default Roles & Permissions Matrix](#3-seeded-default-roles--permissions-matrix)
4. [Pre-Configured Demo Accounts & Portal Rules](#4-pre-configured-demo-accounts--portal-rules)
5. [Quickstart Execution Guide](#5-quickstart-execution-guide)
6. [Developer Integration & Enforcement Guide](#6-developer-integration--enforcement-guide)
   - [Backend BFF Route Guards](#guarding-backend-bff-routes-express)
   - [Frontend UI Component & Route Guards](#guarding-frontend-ui-elements--routes-react)

---

## 1. System Architecture Overview

The RBAC security system is organized around dedicated Backend-For-Frontend gateways (`admin/backend` and `client/backend`), a centralized identity and token authority (`services/auth-service`), and an isolated PostgreSQL persistence engine (`database/`).

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

---

## 2. Database Schema & Entity Relationship Diagram (ERD)

The relational schema implements a canonical RBAC model with junction tables supporting **Many-to-Many ($M:N$)** relationships between users, roles, and granular permissions, alongside secure refresh token rotation and system settings.

```text
┌──────────────────────────────────────────────────────────────┐         ┌──────────────────────────────┐
│                            USERS                             │         │            ROLES             │
├──────────────────────────────────────────────────────────────┤         ├──────────────────────────────┤
│ PK  id             UUID                                      │         │ PK  id          UUID         │
│ UK  email          VARCHAR(255)                              │         │ UK  name        VARCHAR(50)  │
│     password  VARCHAR(255)                              │         │     description TEXT         │
│     first_name     VARCHAR(100)                              │         │     is_system   BOOLEAN      │
│     last_name      VARCHAR(100)                              │         │     created_at  TIMESTAMPTZ  │
│     is_active      BOOLEAN                                   │         │     updated_at  TIMESTAMPTZ  │
│     created_at     TIMESTAMPTZ                               │         └──────────────┬───────────────┘
│     updated_at     TIMESTAMPTZ                               │                        │
└──────────────┬───────────────────────────────┬───────────────┘                        │ 1
               │ 1                             │ 1                                      │
               │ owns                          │ assigned                               │ granted_to
               ▼ N                             ▼ N                                      ▼ N
┌──────────────────────────────┐   ┌───────────────────────────┐         ┌──────────────────────────────┐
│        REFRESH_TOKENS        │   │        USER_ROLES         │         │       ROLE_PERMISSIONS       │
├──────────────────────────────┤   ├───────────────────────────┤         ├──────────────────────────────┤
│ PK  id          UUID         │   │ PK,FK user_id    UUID     │         │ PK,FK role_id     UUID       │
│ FK  user_id     UUID         │   │ PK,FK role_id    UUID     │         │ PK,FK perm_id     UUID       │
│     token_hash  VARCHAR(255) │   │       assigned_at TSTZ    │         │        assigned_at TSTZ       │
│     expires_at  TIMESTAMPTZ  │   └───────────────────────────┘         └──────────────┬───────────────┘
│     revoked_at  TIMESTAMPTZ  │                                                        │ N
│     created_at  TIMESTAMPTZ  │                                                        │ assigned
└──────────────────────────────┘                                                        │
                                                                                        ▼ 1
┌──────────────────────────────┐                                         ┌──────────────────────────────┐
│           SETTINGS           │                                         │         PERMISSIONS          │
├──────────────────────────────┤                                         ├──────────────────────────────┤
│ PK  id          UUID         │                                         │ PK  id          UUID         │
│ UK  key         VARCHAR(100) │                                         │ UK  slug        VARCHAR(100) │
│     value       JSONB        │                                         │     module      VARCHAR(50)  │
│     category    VARCHAR(50)  │                                         │     description TEXT         │
│     description TEXT         │                                         │     created_at  TIMESTAMPTZ  │
│     is_public   BOOLEAN      │                                         └──────────────────────────────┘
│     created_at  TIMESTAMPTZ  │
│     updated_at  TIMESTAMPTZ  │
└──────────────────────────────┘
```

### Relational Cardinality & Integrity Rules:

1. **`users` $\leftrightarrow$ `roles` ($M:N$)**:
   - Resolved via `user_roles` junction table.
   - Foreign keys cascade on delete (`ON DELETE CASCADE`), ensuring no orphaned assignments.
   - Composite Primary Key: `(user_id, role_id)`.
2. **`roles` $\leftrightarrow$ `permissions` ($M:N$)**:
   - Resolved via `role_permissions` junction table.
   - Composite Primary Key: `(role_id, permission_id)`.
   - Indexed for bidirectional querying: querying all permissions for a role, or all roles possessing a permission.
3. **`users` $\leftrightarrow$ `refresh_tokens` ($1:N$)**:
   - One user can have multiple active devices/sessions.
   - Refresh tokens are hashed using SHA-256 before insertion into `token_hash`.
   - Explicit revocation tracked via `revoked_at`.
4. **`settings` (Isolated Key-Value Store)**:
   - Configurable JSONB values with uniqueness on `key`.

---

## 3. Seeded Default Roles & Permissions Matrix

| Permission Slug   | Module    |   Super Admin    | Admin | Manager | User | Description                           |
| :---------------- | :-------- | :--------------: | :---: | :-----: | :--: | :------------------------------------ |
| `users:read`      | Users     | ✅ _(Universal)_ |  ✅   |   ✅    |  ❌  | View user list & profiles             |
| `users:create`    | Users     | ✅ _(Universal)_ |  ✅   |   ❌    |  ❌  | Create new user accounts              |
| `users:update`    | Users     | ✅ _(Universal)_ |  ✅   |   ❌    |  ❌  | Edit user details & assigned roles    |
| `users:delete`    | Users     | ✅ _(Universal)_ |  ✅   |   ❌    |  ❌  | Deactivate or delete accounts         |
| `roles:read`      | Roles     | ✅ _(Universal)_ |  ✅   |   ❌    |  ❌  | View roles and assigned permissions   |
| `roles:manage`    | Roles     | ✅ _(Universal)_ |  ❌   |   ❌    |  ❌  | Modify permissions on roles           |
| `analytics:read`  | Analytics | ✅ _(Universal)_ |  ✅   |   ✅    |  ❌  | View system metrics & audit telemetry |
| `settings:read`   | Settings  | ✅ _(Universal)_ |  ✅   |   ✅    |  ✅  | View application settings             |
| `settings:manage` | Settings  | ✅ _(Universal)_ |  ❌   |   ❌    |  ❌  | Mutate system runtime parameters      |

> **Universal Bypass**: `super_admin` has universal bypass hardcoded into backend authorization middlewares and frontend guards. It will automatically authorize all operations, including newly created modules.

---

## 4. Pre-Configured Demo Accounts & Portal Rules

All default demo accounts share the password: `Password123!`

| Role Persona         | Email                    |  Allowed Portal   | Access Scope                                                              |
| :------------------- | :----------------------- | :---------------: | :------------------------------------------------------------------------ |
| 👑 **Super Admin**   | `superadmin@example.com` | **Admin Portal**  | Master universal bypass across all routes and resources.                  |
| 🛡️ **Administrator** | `admin@example.com`      | **Admin Portal**  | User management (`users:*`), settings, role viewing, analytics.           |
| 💼 **Manager**       | `manager@example.com`    | **Admin Portal**  | User reading (`users:read`), analytics (`analytics:read`), settings read. |
| 👤 **User**          | `user@example.com`       | **Client Portal** | Base authenticated consumer identity (`settings:read` only).              |

### Portal Access Enforcement:

- **Admin Portal (`http://localhost:5173`)**: Reserved for administrative roles (`super_admin`, `admin`, `manager`, and custom back-office roles). Standard consumer accounts trying to log in will be rejected with `403 Forbidden: Administrative privileges required`.
- **Client Portal (`http://localhost:5174`)**: Reserved for consumer accounts (`user` role). Administrative accounts cannot sign into the client portal unless explicitly granted the `user` role.

---

## 5. Quickstart Execution Guide

### Step 1: Start PostgreSQL Container

```bash
docker compose up -d
```

### Step 2: Migrate & Seed RBAC Schema

From the repository root:

```bash
# Execute schema migrations (DDL)
npm run db:migrate

# Seed default roles, permissions, settings, and demo accounts
npm run db:seed
```

> **Full Reset**: Drop all tables, re-run all migrations, and re-seed with `npm run db:reset`.

### Step 3: Start Development Servers

From the repository root:

```bash
# Start all 5 services concurrently (Auth, Admin BFF + FE, Client BFF + FE)
npm run dev
```

Or run targeted services:

```bash
# Always keep Auth Microservice running:
npm run dev:auth

# In a separate terminal, run Admin or Client stack:
npm run dev:admin    # Admin BFF (3000) + Admin Frontend (5173)
npm run dev:client   # Client BFF (4000) + Client Frontend (5174)
```

---

## 6. Developer Integration & Enforcement Guide

### Guarding Backend BFF Routes (Express)

In your BFF routes (`[admin|client]/backend/src/routes/*.routes.ts`):

#### 1. Enforce Authentication Across Route Group:

```typescript
import { Router } from "express";
import { authenticate } from "../middlewares/auth/authentication.middleware.js";

const router = Router();
router.use(authenticate); // Injects req.user (userId, email, roles, portal)
```

#### 2. Enforce Role Possession:

```typescript
import { requireRole } from "../middlewares/auth/authorization.middleware.js";

// Accessible only by users holding super_admin or admin roles
router.get(
  "/audit",
  requireRole("super_admin", "admin"),
  auditController.getLogs,
);
```

#### 3. Enforce Fine-Grained Permissions:

```typescript
import { requirePermission } from "../middlewares/auth/authorization.middleware.js";

// Accessible only by users possessing the 'users:create' permission
router.post(
  "/users",
  requirePermission("users:create"),
  userController.createUser,
);
```

---

### Guarding Frontend UI Elements & Routes (React)

In your React applications (`[admin|client]/frontend/src/`):

#### 1. Route Guarding with `ProtectedRoute`:

In `src/routes/AppRoutes.tsx`:

```tsx
<Route
  path="users"
  element={
    <ProtectedRoute requiredPermission="users:read">
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

#### 2. Declarative Component Protection with `PermissionGate`:

In any page or view component:

```tsx
import PermissionGate from "@/components/auth/PermissionGate";
import Button from "@/components/ui/Button";

// Conditionally disables action button with tooltip explanation
<PermissionGate
  permission="users:delete"
  disableOnly
  tooltipTitle="Requires users:delete clearance"
>
  <Button colorScheme="error" onClick={handleDelete}>
    Delete User
  </Button>
</PermissionGate>;
```

#### 3. Programmatic Evaluation with `useAuth`:

```tsx
import { useAuth } from "@/hooks/useAuth";

export default function AnalyticsWidget() {
  const { hasPermission, hasRole } = useAuth();

  if (!hasPermission("analytics:read")) {
    return null; // Do not render telemetry view
  }

  return <div>System Metrics Dashboard</div>;
}
```
