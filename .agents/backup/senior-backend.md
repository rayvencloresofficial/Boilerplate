---
description: End-to-end backend workflow for Node.js, Express, Kysely, and PostgreSQL. Guides schema design, type-safe queries, 3-tier architecture, and API endpoints.
---

# Senior Backend Development Workflow

Execute backend features using the layer-based architecture for **Node.js + Express.js + Kysely + PostgreSQL**.

---

## Step 1: Database & Migrations (`/database`)

1. **Strict Database Isolation:**
   - All PostgreSQL table schemas, indexes, foreign keys, constraints, and seeders live and execute **exclusively** inside the `/database` workspace.
   - **Zero Migration Scripts in `/backend`**: The backend does not run or house migration/seed scripts.
2. **DDL Migrations (`/database/migrations/`):**
   - Add new migration files sequentially (e.g., `002_add_[feature]_table.sql`).
   - Use strict PostgreSQL data types (`UUID`, `TIMESTAMPTZ`, `JSONB`, `NUMERIC`) with proper indexing (B-Tree, GIN, unique partial).
3. **Data Seeders (`/database/seeders/`):**
   - Add or update seeders for default data (e.g., `002_seed_[feature].sql`).
4. **Execution:**
   - From `/database`:
     ```bash
     cd database
     npm run migrate
     npm run seed
     # Or full reset: npm run reset
     ```
   - From project root: `npm run db:migrate`, `npm run db:seed`, `npm run db:reset`.
5. **Database Types & Connection (`/backend/src/types/database.ts`):**
   - Update Kysely table interfaces in `/backend/src/types/database.ts` to match the DDL schema exactly.
   - Maintain connection pool in `/backend/src/config/database.ts`.

---

## Step 2: Repository Layer (`/backend/src/repositories/`)

- Create or update repository files (e.g., `[feature].repository.ts`).
- Build queries using Kysely typed query builders (`selectFrom`, `insertInto`, `updateTable`, `deleteFrom`).
- Handle complex transactions using `db.transaction().execute(async (trx) => ...)` for multi-step updates.
- Keep repositories isolated to data access only (no HTTP request/response handling).

---

## Step 3: Service Layer (`/backend/src/services/`)

- Create or update service files (e.g., `[feature].service.ts`).
- Implement core domain and business logic, orchestrating multiple repositories or external utilities.
- Throw descriptive application/domain errors to be caught by the error middleware.

---

## Step 4: Controller Layer (`/backend/src/controllers/`)

- Create or update controller files (e.g., `[feature].controller.ts`).
- Validate incoming `req.body`, `req.query`, and `req.params` with Zod schemas.
- Invoke the corresponding service functions and return appropriate HTTP status codes (`200`, `201`, `204`).
- Delegate caught errors to `next(err)` for centralized processing via `error.middleware.ts`.

---

## Step 5: Routes & Middleware Wiring (`/backend/src/routes/`)

- Create or update route files (e.g., `[feature].routes.ts`).
- Apply route-level middlewares where needed:
  - Authentication: `auth/authentication.middleware.ts`
  - Role-based Access: `auth/authorization.middleware.ts`
  - Rate Limiting: `rateLimiters.ts`
- Register the new router in `/backend/src/routes/index.ts`.

---

## Step 6: App Registration & Verification (`/backend/src/app.ts` & `server.ts`)

- Ensure base routes and fallback handlers (`notFound.middleware.ts`, `error.middleware.ts`) are mounted in `app.ts`.
- Verify runtime environment configurations in `server.ts` and `.env`.

---

## Quality Checklist Before Completion

- [ ] All schema changes and SQL definitions reside strictly in `/database/migrations/`.
- [ ] No database migration or seed scripts exist inside `/backend/`.
- [ ] Layer boundaries are strictly maintained: Controller -> Service -> Repository -> Database.
- [ ] No direct database queries inside controllers or services (use repository layer).
- [ ] Multi-table write operations are wrapped safely inside Kysely transactions.
- [ ] Strict TypeScript: Zero `any` types.
- [ ] Endpoints validate inputs with Zod and route errors to `error.middleware.ts`.
