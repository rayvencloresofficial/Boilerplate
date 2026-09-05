# Full-Stack Monorepo Boilerplate (BFF Architecture)

An enterprise-grade, production-ready Full-Stack Monorepo boilerplate architected using the **Backend-For-Frontend (BFF)** pattern. It features dual frontend portals (**Admin Console** and **Client Portal**) powered by **React 19, Joy UI, and Vite**, paired with dedicated **Express + TypeScript + Kysely** BFF gateways, a centralized **Authentication Microservice**, an isolated **PostgreSQL 17 Database Migration Engine**, and a comprehensive **Role-Based Access Control (RBAC)** security system.

---

## Table of Contents

- [System Architecture & Workspaces](#system-architecture--workspaces)
- [Workspace Topology & Responsibilities](#workspace-topology--responsibilities)
- [Quick Start: Step-by-Step Guide](#quick-start-step-by-step-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Decouple & Establish Standalone Identity](#step-2-decouple--establish-standalone-identity)
  - [Step 3: Prerequisites Verification](#step-3-prerequisites-verification)
  - [Step 4: Environment Variables Setup](#step-4-environment-variables-setup)
  - [Step 5: Database Provisioning & Seeding](#step-5-database-provisioning--seeding)
  - [Step 6: Install Dependencies & Run Development Servers](#step-6-install-dependencies--run-development-servers)
- [Service Topology & Port Matrix](#service-topology--port-matrix)
- [Pre-Configured Demo Accounts & Portal Rules](#pre-configured-demo-accounts--portal-rules)
- [Developer Workflow: Adding a New Feature Module](#developer-workflow-adding-a-new-feature-module)
  - [Phase 1: Database DDL & Permissions (`database/`)](#phase-1-database-ddl--permissions-database)
  - [Phase 2: Backend BFF Implementation (`[admin|client]/backend/`)](#phase-2-backend-bff-implementation-adminclientbackend)
  - [Phase 3: Frontend Joy UI Integration (`[admin|client]/frontend/`)](#phase-3-frontend-joy-ui-integration-adminclientfrontend)
- [Core Engineering Standards](#core-engineering-standards)
- [Monorepo Command Reference](#monorepo-command-reference)
- [Architecture & Developer Manuals](#architecture--developer-manuals)

---

## System Architecture & Workspaces

The repository is architected as an **npm workspaces monorepo** with strict architectural boundaries separating frontends, tailored BFFs, centralized authentication, and the database persistence layer:

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

## Workspace Topology & Responsibilities

```text
Boilerplate/
├── admin/
│   ├── frontend/             # Admin SPA (React 19, Joy UI, Vite) [Port 5173]
│   └── backend/              # Admin BFF API (Express, TypeScript, Kysely) [Port 3000]
├── client/
│   ├── frontend/             # Client SPA (React 19, Joy UI, Vite) [Port 5174]
│   └── backend/              # Client BFF API (Express, TypeScript, Kysely) [Port 4000]
├── services/
│   └── auth-service/         # Centralized Auth Microservice (JWT, Tokens) [Port 5000]
├── database/                 # Standalone PostgreSQL Package (DDL Migrations & Seeders)
├── docs/                     # System Architecture, RBAC & Developer Manuals
└── .agents/                  # AI Developer Personas & Workflows
```

### 1. `admin/` — Back-Office Administration

- **`admin/frontend`**: High-performance single page application built with React 19, Joy UI, and Vite. Contains back-office workflows, full user administration, system role configuration, security audit views, and settings controls.
- **`admin/backend`**: Dedicated Backend-For-Frontend (BFF) running Express and TypeScript. Exposes administrative endpoints (`/api/v1/users`, `/api/v1/roles`, `/api/v1/settings`), delegates credential verification to `auth-service`, and executes type-safe queries via Kysely.

### 2. `client/` — Consumer / End-User Portal

- **`client/frontend`**: Clean, accessible consumer portal powered by React 19, Joy UI, and Vite. Designed for customer self-service, user personal profiles, and client-facing features.
- **`client/backend`**: Dedicated Backend-For-Frontend (BFF) running Express and TypeScript. Exposes customer-facing endpoints (`/api/v1/users/me`), enforces client authorization, delegates auth to `auth-service`, and interfaces directly with PostgreSQL.

### 3. `services/auth-service/` — Centralized Authentication Authority

- Microservice responsible for:
  - User registration, password hashing (bcrypt), and credential verification.
  - Dual-token lifecycle: Access Token issuance (short-lived JWT) and Refresh Token rotation (stored as SHA-256 hashes).
  - Portal-based access validation (prevents regular users from logging into the Admin Portal and administrative accounts from the Client Portal).
  - Centralized session revocation and token verification endpoints (`/api/v1/auth/verify`).

### 4. `database/` — Standalone Database Engine

- **Single Source of Truth**: All PostgreSQL DDL schemas (`migrations/`) and data fixtures (`seeders/`) live exclusively here.
- **Strict Boundary**: Zero migration or seeder scripts inside BFF backends.
- **Atomic Execution**: All migrations and seeders execute within atomic SQL transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- **Auto Database Creation**: Connects to the default `postgres` database to create `boilerplate_db` if it does not yet exist.

---

## Quick Start: Step-by-Step Guide

Follow these steps to clone the boilerplate, decouple from the template repository, configure environments, run database migrations, and boot all services locally.

---

### Step 1: Clone the Repository

Clone the repository into your desired project directory:

```bash
git clone https://github.com/rayvencloresofficial/Boilerplate.git my-awesome-project
cd my-awesome-project
```

_(Replace `my-awesome-project` with your actual project or client name)._

---

### Step 2: Decouple & Establish Standalone Identity

To establish your new project as a clean, independent repository:

#### 2.1 Remove Existing Git History

- **On Windows (PowerShell):**
  ```powershell
  Remove-Item -Recurse -Force .git
  ```
- **On macOS / Linux / Git Bash:**
  ```bash
  rm -rf .git
  ```
- **On Windows (Command Prompt / CMD):**
  ```cmd
  rmdir /s /q .git
  ```

#### 2.2 Rename Project in `package.json` Files

Update the `"name"` field in your root and workspace package files to reflect your project naming:

1. **Root `package.json`**:
   ```json
   {
     "name": "my-awesome-project",
     "private": true
   }
   ```
2. **`admin/frontend/package.json`**: `"name": "my-awesome-project-admin-frontend"`
3. **`admin/backend/package.json`**: `"name": "my-awesome-project-admin-backend"`
4. **`client/frontend/package.json`**: `"name": "my-awesome-project-client-frontend"`
5. **`client/backend/package.json`**: `"name": "my-awesome-project-client-backend"`
6. **`services/auth-service/package.json`**: `"name": "my-awesome-project-auth-service"`
7. **`database/package.json`**: `"name": "my-awesome-project-database"`

#### 2.3 Initialize Fresh Git Repository & Commit

```bash
git init -b main
git add .
git commit -m "chore: initial commit from enterprise bff monorepo boilerplate"
```

#### 2.4 Link Remote Repository & Publish

```bash
git remote add origin https://github.com/<your-org-or-username>/my-awesome-project.git
git push -u origin main
```

---

### Step 3: Prerequisites Verification

Ensure the following tools are installed on your workstation:

- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v16+` (either locally installed or via Docker)
- **Docker & Docker Compose** (recommended for zero-config database startup)

---

### Step 4: Environment Variables Setup

The monorepo uses isolated environment files for each workspace. Copy the example `.env.example` templates for all 6 workspaces:

#### Windows PowerShell:

```powershell
Copy-Item services/auth-service/.env.example services/auth-service/.env
Copy-Item admin/backend/.env.example admin/backend/.env
Copy-Item admin/frontend/.env.example admin/frontend/.env
Copy-Item client/backend/.env.example client/backend/.env
Copy-Item client/frontend/.env.example client/frontend/.env
Copy-Item database/.env.example database/.env
```

#### macOS / Linux / Git Bash:

```bash
cp services/auth-service/.env.example services/auth-service/.env
cp admin/backend/.env.example admin/backend/.env
cp admin/frontend/.env.example admin/frontend/.env
cp client/backend/.env.example client/backend/.env
cp client/frontend/.env.example client/frontend/.env
cp database/.env.example database/.env
```

#### Windows CMD:

```cmd
copy services\auth-service\.env.example services\auth-service\.env
copy admin\backend\.env.example admin\backend\.env
copy admin\frontend\.env.example admin\frontend\.env
copy client\backend\.env.example client\backend\.env
copy client\frontend\.env.example client\frontend\.env
copy database\.env.example database\.env
```

#### Overview of Configuration Values:

| Workspace                        | Key Variables                                                       | Default / Example Value                                                                                                                          |
| :------------------------------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`services/auth-service/.env`** | `PORT`<br/>`DATABASE_URL`<br/>`JWT_SECRET`<br/>`JWT_REFRESH_SECRET` | `5000`<br/>`postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db`<br/>`secure-access-secret`<br/>`secure-refresh-secret`         |
| **`admin/backend/.env`**         | `PORT`<br/>`CLIENT_URL`<br/>`AUTH_SERVICE_URL`<br/>`DATABASE_URL`   | `3000`<br/>`http://localhost:5173`<br/>`http://localhost:5000/api/v1`<br/>`postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` |
| **`admin/frontend/.env`**        | `VITE_API_URL`                                                      | `http://localhost:3000/api/v1`                                                                                                                   |
| **`client/backend/.env`**        | `PORT`<br/>`CLIENT_URL`<br/>`AUTH_SERVICE_URL`<br/>`DATABASE_URL`   | `4000`<br/>`http://localhost:5174`<br/>`http://localhost:5000/api/v1`<br/>`postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` |
| **`client/frontend/.env`**       | `VITE_API_URL`                                                      | `http://localhost:4000/api/v1`                                                                                                                   |
| **`database/.env`**              | `DATABASE_URL`                                                      | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db`                                                                           |

---

### Step 5: Database Provisioning & Seeding

#### Option A: Docker Compose (Recommended)

Start the PostgreSQL 17 Alpine database in detached mode:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` with username `postgres`, password `postgrespassword`, and database `boilerplate_db`.

#### Option B: Local or Cloud PostgreSQL

If using an existing PostgreSQL instance, ensure the connection string in `database/.env`, `services/auth-service/.env`, `admin/backend/.env`, and `client/backend/.env` points to your database server.

#### Run Schema Migrations & Data Seeders:

From the repository root:

```bash
# Execute DDL schema migrations
npm run db:migrate

# Seed default RBAC roles, permissions, settings, and demo accounts
npm run db:seed
```

> [!TIP]
> **Full Database Reset**: If you need to drop all tables, re-run all migrations from scratch, and re-seed all default data:
>
> ```bash
> npm run db:reset
> ```

---

### Step 6: Install Dependencies & Run Development Servers

Install all dependencies across all monorepo workspaces in a single command from the project root:

```bash
npm install
```

#### Run the Complete Monorepo Stack

To spin up all 5 development services concurrently (**Auth Microservice**, **Admin BFF**, **Admin Frontend**, **Client BFF**, and **Client Frontend**):

```bash
npm run dev
```

#### Run Targeted Stacks

If you prefer running a specific portal during development:

> [!IMPORTANT]
> Both the **Admin Portal** and the **Client Portal** delegate authentication to `services/auth-service`. When developing with `dev:admin` or `dev:client`, ensure `npm run dev:auth` is also running.

- **Run Auth Microservice only**:
  ```bash
  npm run dev:auth
  ```
- **Run Admin Stack (Backend + Frontend)**:
  ```bash
  npm run dev:admin
  ```
- **Run Client Stack (Backend + Frontend)**:
  ```bash
  npm run dev:client
  ```

---

## Service Topology & Port Matrix

| Service               | Workspace               |  Port  | Local URL                                                              | Description                                |
| :-------------------- | :---------------------- | :----: | :--------------------------------------------------------------------- | :----------------------------------------- |
| **Admin Frontend**    | `admin/frontend`        | `5173` | [http://localhost:5173](http://localhost:5173)                         | Admin Console (Vite, React 19, Joy UI)     |
| **Admin Backend**     | `admin/backend`         | `3000` | [http://localhost:3000/api/v1](http://localhost:3000/api/v1)           | Admin BFF REST API (Express, Kysely)       |
| **Client Frontend**   | `client/frontend`       | `5174` | [http://localhost:5174](http://localhost:5174)                         | Client Web Portal (Vite, React 19, Joy UI) |
| **Client Backend**    | `client/backend`        | `4000` | [http://localhost:4000/api/v1](http://localhost:4000/api/v1)           | Client BFF REST API (Express, Kysely)      |
| **Auth Microservice** | `services/auth-service` | `5000` | [http://localhost:5000/api/v1/auth](http://localhost:5000/api/v1/auth) | Centralized JWT Auth & Token Authority     |
| **PostgreSQL**        | `database`              | `5432` | `localhost:5432`                                                       | PostgreSQL 17 Database (`boilerplate_db`)  |

---

## Pre-Configured Demo Accounts & Portal Rules

The database seeder provisions four pre-configured persona accounts to verify access control out-of-the-box.

**Default password for all accounts:** `Password123!`

| Role Persona         | Email                    |  Allowed Portal   | Access Scope                                                                             |
| :------------------- | :----------------------- | :---------------: | :--------------------------------------------------------------------------------------- |
| 👑 **Super Admin**   | `superadmin@example.com` | **Admin Portal**  | Master universal bypass. Unrestricted access to all modules, users, roles, and settings. |
| 🛡️ **Administrator** | `admin@example.com`      | **Admin Portal**  | User management (`users:*`), settings management, roles view, analytics view.            |
| 💼 **Manager**       | `manager@example.com`    | **Admin Portal**  | Operational lead with read access to users (`users:read`), analytics, and settings.      |
| 👤 **User**          | `user@example.com`       | **Client Portal** | Standard consumer identity with profile access and personal client settings.             |

### Portal Access Segregation:

- **Admin Portal (`http://localhost:5173`)**: Exclusively reserved for administrative personas (`super_admin`, `admin`, `manager`) and custom administrative roles. Regular users attempting to sign into the Admin Portal receive a `403 Forbidden` response.
- **Client Portal (`http://localhost:5174`)**: Exclusively reserved for end-users (`user` role). Administrative personas attempting to sign into the Client Portal receive a `403 Forbidden` response unless explicitly assigned the `user` role.
- **Interactive Persona Switcher**: Both frontends include a quick-switch persona dropdown in the user interface to test RBAC roles without manually typing credentials or logging out.

---

## Developer Workflow: Adding a New Feature Module

Follow this 3-phase workflow whenever creating a new feature in the boilerplate (e.g., adding a `documents` module).

```text
Phase 1: database/ (DDL migrations & seeders)
    ↓
Phase 2: [admin|client]/backend/ (Types → Repository → Service → Controller → Routes)
    ↓
Phase 3: [admin|client]/frontend/ (Types → API Client → Sidebar → Routes → Joy UI Page)
```

---

### Phase 1: Database DDL & Permissions (`database/`)

All database schema definitions and permission fixtures reside exclusively in `database/`.

#### 1.1 Create Migration Script

Create `database/migrations/003_create_documents_schema.sql`:

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

#### 1.2 Create Seeder Script

Create `database/seeders/003_seed_documents.sql`:

```sql
-- 1. Insert permissions for the new module
INSERT INTO permissions (id, slug, module, description) VALUES
    ('60000000-0000-0000-0000-000000000001', 'documents:read', 'documents', 'Can browse and view documents'),
    ('60000000-0000-0000-0000-000000000002', 'documents:create', 'documents', 'Can create and upload documents'),
    ('60000000-0000-0000-0000-000000000003', 'documents:delete', 'documents', 'Can archive and delete documents')
ON CONFLICT (slug) DO NOTHING;

-- 2. Map permissions to roles
-- Super Admin: receives all module permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions WHERE module = 'documents'
ON CONFLICT DO NOTHING;

-- Admin: receives read, create, delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE slug IN ('documents:read', 'documents:create', 'documents:delete')
ON CONFLICT DO NOTHING;
```

#### 1.3 Apply Database Changes

```bash
npm run db:migrate
npm run db:seed
```

---

### Phase 2: Backend BFF Implementation (`[admin|client]/backend/`)

Select the target BFF based on audience (`admin/backend` for administration, `client/backend` for consumers). Follow the **Controller $\rightarrow$ Service $\rightarrow$ Repository** layered architecture:

#### 2.1 Update Database Types

In `[admin|client]/backend/src/types/database.ts`:

```ts
import type { Generated } from "kysely";

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

#### 2.2 Repository Layer (`src/repositories/document.repository.ts`)

```ts
import { db } from "../config/database.js";

export const findDocuments = async () => {
  return await db
    .selectFrom("documents")
    .selectAll()
    .orderBy("created_at", "desc")
    .execute();
};

export const createDocument = async (
  title: string,
  content?: string,
  userId?: string,
) => {
  return await db
    .insertInto("documents")
    .values({ title, content: content ?? null, created_by: userId ?? null })
    .returningAll()
    .executeTakeFirstOrThrow();
};
```

#### 2.3 Service Layer (`src/services/document.service.ts`)

```ts
import * as docRepo from "../repositories/document.repository.js";

export const listDocuments = async () => {
  return await docRepo.findDocuments();
};

export const publishDocument = async (
  title: string,
  content?: string,
  userId?: string,
) => {
  return await docRepo.createDocument(title, content, userId);
};
```

#### 2.4 Controller Layer (`src/controllers/document.controller.ts`)

```ts
import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../types/auth.js";
import * as docService from "../services/document.service.js";

export const createDocSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().optional(),
});

export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createDocSchema.parse(req.body);
    const doc = await docService.publishDocument(
      body.title,
      body.content,
      req.user?.id,
    );
    res
      .status(201)
      .json({
        success: true,
        data: doc,
        message: "Document created successfully.",
      });
  } catch (err) {
    next(err);
  }
};
```

#### 2.5 Route Registration (`src/routes/document.routes.ts`)

```ts
import { Router } from "express";
import * as docController from "../controllers/document.controller.js";
import { authenticate } from "../middlewares/auth/authentication.middleware.js";
import { requirePermission } from "../middlewares/auth/authorization.middleware.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  requirePermission("documents:read"),
  docController.getDocuments,
);
router.post(
  "/",
  requirePermission("documents:create"),
  docController.createDocument,
);

export default router;
```

Mount inside `src/routes/index.ts`:

```ts
import documentRoutes from "./document.routes.js";
// ...
router.use("/documents", documentRoutes);
```

---

### Phase 3: Frontend Joy UI Integration (`[admin|client]/frontend/`)

#### 3.1 API Client Layer (`src/services/document.api.ts`)

Never make raw `fetch` calls in React components. Encapsulate all communication in an API service wrapper:

```ts
const API_BASE = import.meta.env.VITE_API_URL;

export const getDocumentsApi = async () => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch documents.");
  const json = await res.json();
  return json.data;
};
```

#### 3.2 Sidebar Navigation Link (`src/components/ui/Sidebar.tsx`)

Register the module with permission awareness:

```tsx
{
  title: 'Documents',
  path: '/documents',
  icon: <FileText size={18} />,
  requiredPermission: 'documents:read', // Automatically hidden if user lacks permission
}
```

#### 3.3 Protected Route (`src/routes/AppRoutes.tsx`)

Mount the page wrapped in `ProtectedRoute`:

```tsx
<Route
  path="documents"
  element={
    <ProtectedRoute requiredPermission="documents:read">
      <DocumentsPage />
    </ProtectedRoute>
  }
/>
```

#### 3.4 Page View with Local UI Wrappers & Joy UI

Build the UI adhering to the **Component Priority Order**:

1. **Local UI Wrappers** (`@/components/ui/Container`, `@/components/ui/Button`, `@/components/ui/Typography`). **Use `Container` instead of Joy/MUI `Card`**.
2. **Joy UI (`@mui/joy`)** components for forms, inputs, and layout.
3. **`PermissionGate`** to guard action buttons.

```tsx
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PermissionGate from "@/components/auth/PermissionGate";

export default function DocumentsPage() {
  return (
    <Container
      elevation={1}
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Typography variant="title" size="md" bold>
        Documents Repository
      </Typography>
      <PermissionGate
        permission="documents:create"
        disableOnly
        tooltipTitle="Requires documents:create permission"
      >
        <Button colorScheme="primary" onClick={() => console.log("Create")}>
          New Document
        </Button>
      </PermissionGate>
    </Container>
  );
}
```

---

## Core Engineering Standards

1. **Strict TypeScript (Zero `any`)**:
   - Every interface, DTO, and database entity must be strictly typed. Use discriminated unions for complex states.
2. **Clean 3-Tier Layered Architecture**:
   - **Controllers**: Transport layer, query/body parsing, status codes, RFC 7807 problem details.
   - **Services**: Pure business domain logic, orchestration, and atomic transactions (`db.transaction().execute(...)`).
   - **Repositories**: Isolated data access using Kysely typed query builder.
3. **Frontend Component Priority Order**:
   - Priority 1: Local UI wrappers (`@/components/ui/*`). Always use custom `Container` rather than `Card`.
   - Priority 2: Joy UI (`@mui/joy`) using semantic design tokens (`variant`, `color`, `sx`).
   - Priority 3: Material UI (`@mui/material`) strictly as fallback for specialized widgets Joy UI does not provide.
4. **Fast Refresh Hygiene**:
   - Files exporting React components must **only** export React components (`react-refresh/only-export-components`).
   - Hooks reside in `src/hooks/`, constants in `src/constants/`, context types in `src/context/*.ts`, and providers in `src/context/*Provider.tsx`.
5. **Security & RBAC Enforcement**:
   - Defense-in-depth: Frontends hide/disable UI via `PermissionGate` and `ProtectedRoute`; BFFs enforce clearance via `authenticate`, `requireRole`, and `requirePermission`.
   - Passwords hashed via bcrypt. Tokens signed with HMAC SHA-256 with stored refresh token hashes.

---

## Monorepo Command Reference

### Root Scripts

| Command                | Action                                                                               |
| :--------------------- | :----------------------------------------------------------------------------------- |
| `npm run dev`          | Boots all 5 services concurrently (Auth, Admin BFF, Admin FE, Client BFF, Client FE) |
| `npm run dev:admin`    | Runs Admin BFF and Admin Frontend concurrently                                       |
| `npm run dev:client`   | Runs Client BFF and Client Frontend concurrently                                     |
| `npm run dev:auth`     | Runs Centralized Auth Microservice development server                                |
| `npm run build`        | Compiles all packages for production (`tsc` + `vite build`)                          |
| `npm run build:admin`  | Compiles Admin BFF and Admin Frontend                                                |
| `npm run build:client` | Compiles Client BFF and Client Frontend                                              |
| `npm run build:auth`   | Compiles Centralized Auth Microservice                                               |
| `npm run db:migrate`   | Runs all pending SQL migrations in `database/migrations/`                            |
| `npm run db:seed`      | Runs all SQL seeders in `database/seeders/`                                          |
| `npm run db:reset`     | Drops and re-executes all migrations and seeders                                     |

### Individual Workspace Commands

- **Database**:
  - `npm run migrate -w database` — Run migrations
  - `npm run seed -w database` — Run seeders
  - `npm run reset -w database` — Full teardown, migration, and re-seed
- **Auth Microservice**:
  - `npm run dev -w auth-service` — Run auth service with hot-reload (`tsx watch`)
  - `npm run build -w auth-service` — Compile TypeScript
  - `npm run start -w auth-service` — Run compiled production server
- **Admin Stack**:
  - `npm run dev -w admin-backend` — Run Admin BFF with hot-reload
  - `npm run dev -w admin-frontend` — Run Admin Vite dev server
- **Client Stack**:
  - `npm run dev -w client-backend` — Run Client BFF with hot-reload
  - `npm run dev -w client-frontend` — Run Client Vite dev server

---

## Architecture & Developer Manuals

- 📘 **[Boilerplate Developer Manual](docs/BOILERPLATE_MANUAL.md)**: In-depth technical architecture manual covering 3-tier patterns, transaction management, error handling, and deployment protocols.
- 🛡️ **[RBAC Security & Architecture Guide](docs/RBAC_GUIDE.md)**: Deep dive into the Role-Based Access Control matrix, JWT authentication lifecycle, token revocation, route guards, and UI permission gates.
- 🤖 **Developer Workflows**:
  - [01 Database Workflow](.agents/workflows/01_database_workflow.md)
  - [02 Backend Workflow](.agents/workflows/02_backend_workflow.md)
  - [03 Frontend Workflow](.agents/workflows/03_frontend_workflow.md)
