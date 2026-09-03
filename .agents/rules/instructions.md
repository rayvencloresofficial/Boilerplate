---
trigger: always_on
---

# General Project Instructions & BFF Architecture Guidelines

You are an expert AI Full-Stack Software Engineer and System Architect assisting in this repository. Follow these global standards for all planning, architecture, code generation, and debugging tasks.

---

## 1. Project Monorepo & BFF Architecture

The repository is architected as a **Backend-For-Frontend (BFF)** monorepo, pairing dedicated frontends with tailored backend gateways, backed by a centralized authentication microservice and an isolated database workspace.

```
Boilerplate/
├── admin/
│   ├── frontend/         --> Admin SPA (React 19, Joy UI, Vite) [Port 5173]
│   └── backend/          --> Admin BFF API (Express, TypeScript, Kysely) [Port 3000]
├── client/
│   ├── frontend/         --> Client SPA (React 19, Joy UI, Vite) [Port 5174]
│   └── backend/          --> Client BFF API (Express, TypeScript, Kysely) [Port 4000]
├── services/
│   └── auth-service/     --> Centralized Auth Microservice (JWT, Token Issuance) [Port 5000]
├── database/             --> Standalone PostgreSQL package (DDL migrations & seeders)
└── docs/                 --> Architecture, manuals, and API specifications
```

### BFF Principles & Workspace Boundaries:
- **Dedicated BFF Pairs**:
  - `admin/frontend` exclusively consumes `admin/backend` (`http://localhost:3000/api/v1`).
  - `client/frontend` exclusively consumes `client/backend` (`http://localhost:4000/api/v1`).
- **Tailored Responsibilities**:
  - `admin/backend`: BFF providing admin console operations, back-office workflows, full user/role management, system configurations, and RBAC control.
  - `client/backend`: BFF providing consumer/client operations, personal profile management, user self-service, and user-facing features.
  - `services/auth-service`: Centralized authority for authentication, token lifecycles, and credential verification. Both BFFs delegate authentication requests to this service.
- **Database Isolation**:
  - **Single Source of Truth**: All PostgreSQL DDL schemas (`migrations/`), data fixtures (`seeders/`), and runner scripts (`src/client.ts`, `src/migrate.ts`, `src/seed.ts`, `src/reset.ts`) reside **exclusively** within `database/`.
  - **Strict Boundary**: **Zero migration or seeder scripts inside any backend or BFF package**. BFF data access is strictly runtime queries via Kysely query builder.
  - Database commands: `npm run db:migrate`, `npm run db:seed`, `npm run db:reset` from root or within `database/`.

---

## 2. Core Tech Stack Standards

### Frontends (`admin/frontend/`, `client/frontend/`)
- **Framework & Tooling**: Vite + React 19 (TypeScript, ESM).
- **Component Priority Order**:
  1. **Local UI Wrappers** (`src/components/ui/` - `Button`, `Calendar`, `Container`, `Typography`, etc.). Use `Container` instead of `Card`.
  2. **Joy UI (`@mui/joy`)** as the primary design system (semantic colors, `variant`, `sx` tokens).
  3. **MUI (`@mui/material`)** only as fallback when Joy UI lacks the component (e.g. specialized pickers).
- **Fast Refresh Hygiene**: Files exporting React components must **only** export React components (`react-refresh/only-export-components`).
  - Hooks live in `src/hooks/`, constants in `src/constants/`, context types in `src/context/*.ts`, and providers in `src/context/*Provider.tsx`.
- **API Communication**: Components never make raw `fetch` calls. All communication goes through type-safe API client wrappers in `src/services/*.api.ts`.

### Backends & BFFs (`admin/backend/`, `client/backend/`)
- **Runtime & Framework**: Node.js, Express.js (strict TypeScript, ESM).
- **3-Tier Layered Architecture**:
  - **Controller** (`src/controllers/`): HTTP transport, query/body parsing, status codes, RFC 7807 problem details.
  - **Service** (`src/services/`): Pure business logic, authorization checks, orchestration, transaction management.
  - **Repository** (`src/repositories/`): Isolated data access and type-safe database queries via Kysely.
- **Validation**: Schema-first validation using **Zod** on all incoming requests (`req.body`, `req.query`, `req.params`).
- **Auth Microservice Integration**: BFFs delegate login, token refresh, and registration to `services/auth-service` via `AUTH_SERVICE_URL`.

### Database (`database/`)
- **Engine**: PostgreSQL 17+.
- **Execution & Isolation**: Managed strictly within `database/`.
- **Transactional DDL & Seeds**: All migration and seed scripts must run inside atomic transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).

---

## 3. Engineering & Code Quality Rules

1. **Strict TypeScript**:
   - Zero `any` types. Maximize compiler safety, discriminated unions, and strong interface contracts.
2. **Clean Separation of Concerns**:
   - Controllers handle HTTP transport and response shaping.
   - Services handle pure business logic and transaction boundaries.
   - Repositories handle type-safe Kysely database queries.
   - `database/` handles all schema DDL and seeding.
3. **Database Concurrency & Transactions**:
   - Prefer Kysely transaction blocks (`db.transaction().execute(async trx => ...)`) for multi-step mutations.
4. **Environment Isolation**:
   - No hardcoded database credentials, fallback connection strings, or passwords in code. All configuration must be loaded from `.env` files.
5. **Security Best Practices**:
   - Parameterized SQL queries (handled natively by Kysely).
   - Role-based access control (RBAC via `requireRole` and `requirePermission`).
   - Rate limiting, Helmet security headers, CORS restricted to the corresponding frontend client.

---

## 4. Agent Response Protocol

- **Direct & Actionable**: Provide production-ready, runnable code without unnecessary conversational fluff.
- **Context-Aware Routing**: Refer to and adhere to `.agents/Senior_Frontend.md` for UI/UX/React tasks and `.agents/Senior_Backend.md` for API/DB tasks.
- **Workflow Context**: Refer to and adhere to:
  - `.agents/workflows/01_database_workflow.md` for database table creation and permission seeding.
  - `.agents/workflows/02_backend_workflow.md` for BFF backend business logic and API implementation.
  - `.agents/workflows/03_frontend_workflow.md` for frontend UI/UX design and BFF API integration.
- **Modular Deliverables**: When adding features, specify files clearly by their relative path (e.g., `admin/backend/src/repositories/...`, `client/frontend/src/components/...`, or `database/migrations/...`).
