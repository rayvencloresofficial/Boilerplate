# Enterprise Full-Stack Boilerplate Manual

A comprehensive developer, operator, and architecture manual for building and scaling applications with this monorepo.

---

## Table of Contents

1. [Architectural Principles & Monorepo Structure](#1-architectural-principles--monorepo-structure)
2. [Monorepo Directory Layout](#2-monorepo-directory-layout)
3. [Configuration & Environment Variables](#3-configuration--environment-variables)
4. [Database & Migration Engine Guide](#4-database--migration-engine-guide)
5. [Authentication & RBAC Security Engine](#5-authentication--rbac-security-engine)
6. [Step-by-Step Tutorial: Adding a New Feature Module](#6-step-by-step-tutorial-adding-a-new-feature-module)
   - [Phase 1: Database Migration & Seeder](#phase-1-database-migration--seeder)
   - [Phase 2: Backend 3-Tier Implementation](#phase-2-backend-3-tier-implementation)
   - [Phase 3: Frontend Joy UI Integration](#phase-3-frontend-joy-ui-integration)
7. [Frontend Design System & Styling Conventions](#7-frontend-design-system--styling-conventions)
8. [Backend Engineering Standards & API Protocols](#8-backend-engineering-standards--api-protocols)
9. [Production Build & Deployment Guide](#9-production-build--deployment-guide)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Architectural Principles & Monorepo Structure

This project follows an enterprise monorepo pattern designed for high maintainability, strict boundary isolation, and maximum type safety.

```mermaid
graph TD
  subgraph Client ["Frontend Package (Vite + React 19 + Joy UI)"]
    UI[Joy UI Component System] --> AuthCtx[Auth Context & useAuth]
    AuthCtx --> Guards[ProtectedRoute & PermissionGate]
    Guards --> ApiClient[API Service Layer with Bearer Token]
  end

  subgraph Server ["Backend Package (Express + TypeScript + Kysely)"]
    ApiClient --> Middleware[Auth, RBAC Guard, Zod Validator]
    Middleware --> Controller[Controllers: req/res, RFC 7807]
    Controller --> Service[Services: Business Logic & Trx]
    Service --> Repo[Repositories: Type-Safe Kysely Queries]
    Controller -.-> ErrHandler[RFC 7807 Error Handler]
  end

  subgraph DatabaseWorkspace ["Database Package (PostgreSQL Runner)"]
    Migrations[DDL Schema: migrations/*.sql]
    Seeders[Data Fixtures: seeders/*.sql]
    Runner[Atomic Transaction Runner]
  end

  Repo --> Postgres[(PostgreSQL 17+ Engine)]
  Runner --> Postgres
```

### Core Architecture Highlights

- **Standalone Database Package (`database/`)**:
  - **Single Source of Truth**: All DDL schemas (`migrations/`), data fixtures (`seeders/`), and runner scripts (`src/client.ts`, `src/migrate.ts`, `src/seed.ts`, `src/reset.ts`) reside exclusively in `database/`.
  - **Zero Migrations in Backend**: The `backend/` package contains zero DDL scripts. Runtime queries use Kysely against existing tables.
  - **Transactional Execution**: Every migration and seeder file executes within an atomic SQL transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
  - **Automatic Database Creation**: If `boilerplate_db` does not exist on your PostgreSQL server, the runner connects to the `postgres` default database and creates it automatically.

- **3-Tier Layered Backend (`backend/`)**:
  - `Controller`: Handles HTTP transport, runs Zod request validation, formats RFC 7807 Problem Details responses.
  - `Service`: Contains pure domain business logic, orchestration, and transaction demarcation.
  - `Repository`: Type-safe SQL queries using **Kysely**. Zero HTTP or presentation code.

- **Component Priority Order on Frontend (`frontend/`)**:
  1. **Local UI Wrappers** (`src/components/ui/` - `Button`, `Typography`, `Container`, etc.).
  2. **Joy UI (`@mui/joy`)** as the primary design system.
  3. **MUI Material (`@mui/material`)** only when Joy UI lacks an equivalent component.
  - **Styling**: Always use Joy UI tokens via the `sx` prop or theme hooks (`useThemeColors()`). Never write raw unstructured CSS.

---

## 2. Monorepo Directory Layout

```text
├── .agents/                      # AI Engineer personas, workflows & guidelines
│   ├── Senior_Backend.md
│   ├── Senior_Frontend.md
│   └── workflows/
│       ├── 01_database_workflow.md
│       ├── 02_backend_workflow.md
│       └── 03_frontend_workflow.md
├── backend/                      # REST API Server
│   ├── src/
│   │   ├── config/               # Database pool & environment loader
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── errors/               # Custom AppError & RFC 7807 classes
│   │   ├── middlewares/          # Authentication, RBAC, Validation, Errors
│   │   ├── repositories/         # Kysely database query access
│   │   ├── routes/               # Express routing with RBAC guards
│   │   ├── services/             # Business logic & transaction orchestration
│   │   ├── types/                # Kysely Database interface & DTOs
│   │   ├── validations/          # Zod request validation schemas
│   │   ├── app.ts                # Express application definition
│   │   └── server.ts             # Process listener & port bootloader
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── database/                     # Migration & Seeding Engine
│   ├── migrations/               # Sequential DDL files (e.g. 001_create_rbac_schema.sql)
│   ├── seeders/                  # Sequential seeder files (e.g. 001_seed_rbac.sql)
│   ├── src/
│   │   ├── client.ts             # PG connection pool & auto-db creation
│   │   ├── migrate.ts            # Migration execution runner
│   │   ├── seed.ts               # Seeder execution runner
│   │   └── reset.ts              # Combined migration + seed runner
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Engineering documentation & manuals
│   ├── BOILERPLATE_MANUAL.md     # This comprehensive developer manual
│   └── RBAC_GUIDE.md             # In-depth RBAC system specification
├── frontend/                     # React 19 Client
│   ├── src/
│   │   ├── components/           # Reusable UI & Layout components
│   │   │   ├── auth/             # PermissionGate, ProtectedRoute
│   │   │   └── ui/               # Sidebar, Header, Typography, Button
│   │   ├── constants/            # Demo credentials & application constants
│   │   ├── context/              # AuthContext & state providers
│   │   ├── hooks/                # Custom React hooks (useAuth, useThemeColors)
│   │   ├── layouts/              # AppLayout, TestLayout
│   │   ├── pages/                # Views (Dashboard, Users, Roles, Documents, etc.)
│   │   ├── routes/               # React Router route registrations
│   │   ├── services/             # API client functions (Fetch wrappers)
│   │   ├── types/                # TypeScript interface contracts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml            # PostgreSQL 17 Alpine container definition
├── package.json                  # Root monorepo workspace configuration
└── README.md                     # Project quickstart & setup instructions
```

---

## 3. Configuration & Environment Variables

The monorepo uses environment files isolated per workspace:

### 3.1 Backend Configuration (`backend/.env`)

| Variable                 | Type     | Default / Example                                                      | Purpose                                                   |
| :----------------------- | :------- | :--------------------------------------------------------------------- | :-------------------------------------------------------- |
| `PORT`                   | `number` | `5000`                                                                 | HTTP port where Express listens                           |
| `NODE_ENV`               | `string` | `development`                                                          | Runtime environment (`development`, `production`, `test`) |
| `CLIENT_URL`             | `string` | `http://localhost:5173`                                                | Allowed CORS origin                                       |
| `DATABASE_URL`           | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string                              |
| `JWT_SECRET`             | `string` | _random string_                                                        | Secret key used to sign Access Tokens                     |
| `JWT_EXPIRES_IN`         | `string` | `1h`                                                                   | Access Token lifetime (e.g. `15m`, `1h`)                  |
| `JWT_REFRESH_SECRET`     | `string` | _random string_                                                        | Secret key used to sign Refresh Tokens                    |
| `JWT_REFRESH_EXPIRES_IN` | `string` | `7d`                                                                   | Refresh Token lifetime (e.g. `7d`, `30d`)                 |

### 3.2 Database Configuration (`database/.env`)

| Variable       | Type     | Default / Example                                                      | Purpose                      |
| :------------- | :------- | :--------------------------------------------------------------------- | :--------------------------- |
| `DATABASE_URL` | `string` | `postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db` | PostgreSQL connection string |

_(Note: If `database/.env` is absent, the runner automatically falls back to reading `backend/.env`)._

### 3.3 Frontend Configuration (`frontend/.env`)

| Variable       | Type     | Default / Example              | Purpose                                       |
| :------------- | :------- | :----------------------------- | :-------------------------------------------- |
| `VITE_API_URL` | `string` | `http://localhost:5000/api/v1` | Base REST API URL accessed by client services |

---

## 4. Database & Migration Engine Guide

All database state is managed inside `database/` using raw SQL files executed by a TypeScript runner.

### How Migrations Work

1. The runner inspects `database/migrations/*.sql` in ascending alphanumeric order.
2. It checks the `_migrations` tracking table in PostgreSQL.
3. If a file has not yet executed:
   - It begins an atomic transaction (`BEGIN`).
   - Executes the entire SQL file.
   - Records the filename in `_migrations`.
   - Commits the transaction (`COMMIT`).
4. If an error occurs, the runner issues an immediate `ROLLBACK`, leaving the database clean.

### Automatic Database Creation

When you run `npm run db:migrate`, `database/src/client.ts` attempts to connect to the database specified in `DATABASE_URL` (e.g., `boilerplate_db`). If the database does not exist:

1. It catches error code `3D000` (`database does not exist`).
2. Temporarily connects to the default `postgres` database on that host.
3. Runs `CREATE DATABASE boilerplate_db;`.
4. Reconnects to the newly created database and continues migrations.

### How to Add a New Migration

1. Create a sequentially numbered SQL file in `database/migrations/`:
   ```text
   database/migrations/004_create_projects_schema.sql
   ```
2. Write idempotent SQL DDL statements:

   ```sql
   CREATE TABLE IF NOT EXISTS projects (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(255) NOT NULL,
       description TEXT,
       owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
       status VARCHAR(50) NOT NULL DEFAULT 'active',
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects (owner_id);
   CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
   ```

3. Apply the migration:
   ```bash
   npm run db:migrate
   ```

### How to Add a New Seeder

1. Create a sequentially numbered SQL file in `database/seeders/`:
   ```text
   database/seeders/004_seed_projects.sql
   ```
2. Insert permissions, map them to roles, and optionally insert sample fixtures:

   ```sql
   -- 1. Register permissions
   INSERT INTO permissions (id, slug, module, description) VALUES
       (gen_random_uuid(), 'projects:read', 'projects', 'Can view project records'),
       (gen_random_uuid(), 'projects:create', 'projects', 'Can create projects')
   ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description;

   -- 2. Associate with Admin role
   INSERT INTO role_permissions (role_id, permission_id)
   SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
   WHERE slug IN ('projects:read', 'projects:create')
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

### Key Components:

- **`users`**: Contains email, password hash (bcrypt), name, active flag, and timestamps.
- **`roles`**: Contains name (`super_admin`, `admin`, `manager`, `user`), description, and `is_system` flag.
- **`permissions`**: Granular action identifier with `slug` (e.g., `users:create`, `documents:read`) and `module`.
- **`refresh_tokens`**: Stores SHA-256 hashed refresh tokens with expiration and revocation timestamps.

### Super Admin Universal Bypass

The `super_admin` role possesses universal clearance. In the backend authorization middleware:

```typescript
if (req.user?.roles.includes("super_admin")) {
  return next(); // Unconditionally bypasses granular permission requirements
}
```

The frontend `ProtectedRoute` and `PermissionGate` components mirror this behavior.

### Protecting Backend Endpoints

In your Express routes (`backend/src/routes/*.routes.ts`):

```typescript
import { Router } from "express";
import { authenticate } from "../middlewares/auth/authentication.middleware.js";
import {
  requirePermission,
  requireRole,
} from "../middlewares/auth/authorization.middleware.js";

const router = Router();

// 1. Enforce authentication on all routes in this file
router.use(authenticate);

// 2. Guard route by granular permission slug
router.post(
  "/projects",
  requirePermission("projects:create"),
  projectController.createProject,
);

// 3. Guard route by role
router.delete(
  "/projects/:id",
  requireRole("super_admin", "admin"),
  projectController.deleteProject,
);
```

### Protecting Frontend UI Components & Routes

In your React client:

```tsx
import ProtectedRoute from '@/routes/ProtectedRoute';
import PermissionGate from '@/routes/PermissionGate';
import { useAuth } from '@/hooks/useAuth';

// 1. Guard an entire page route in React Router:
<Route
  path="projects"
  element={
    <ProtectedRoute requiredPermission="projects:read">
      <ProjectsPage />
    </ProtectedRoute>
  }
/>

// 2. Conditionally render or disable an action button:
<PermissionGate
  permission="projects:create"
  disableOnly
  tooltipTitle="Requires projects:create clearance"
>
  <Button colorScheme="primary" onClick={handleCreate}>
    Create Project
  </Button>
</PermissionGate>

// 3. Programmatic checking via useAuth hook:
const { hasPermission, hasRole } = useAuth();
if (hasPermission('projects:delete')) {
  // Show delete button or trigger admin modal
}
```

---

## 6. Step-by-Step Tutorial: Adding a New Feature Module

This tutorial demonstrates how to add a complete end-to-end **Articles** module.

---

### Phase 1: Database Migration & Seeder

#### 1. Create Migration File: `database/migrations/004_create_articles_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_author ON articles (author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);
```

#### 2. Create Seeder File: `database/seeders/004_seed_articles.sql`

```sql
-- Register Permissions
INSERT INTO permissions (id, slug, module, description) VALUES
    ('70000000-0000-0000-0000-000000000001', 'articles:read', 'articles', 'Can view articles'),
    ('70000000-0000-0000-0000-000000000002', 'articles:create', 'articles', 'Can create and edit articles'),
    ('70000000-0000-0000-0000-000000000003', 'articles:delete', 'articles', 'Can delete articles')
ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description;

-- Grant to Admin role (00000000-0000-0000-0000-000000000002)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'articles'
ON CONFLICT DO NOTHING;

-- Grant to Manager role (00000000-0000-0000-0000-000000000003)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions WHERE slug IN ('articles:read', 'articles:create')
ON CONFLICT DO NOTHING;

-- Grant to User role (00000000-0000-0000-0000-000000000004)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions WHERE slug = 'articles:read'
ON CONFLICT DO NOTHING;
```

#### 3. Execute Migration & Seeder

```bash
npm run db:migrate
npm run db:seed
```

---

### Phase 2: Backend 3-Tier Implementation

#### 1. Register Kysely Table in `backend/src/types/database.ts`

```typescript
export interface ArticleTable {
  id: Generated<string>;
  title: string;
  content: string | null;
  status: Generated<string>;
  author_id: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface Database {
  // ... existing tables
  articles: ArticleTable;
}
```

#### 2. Create Zod Validation Schemas in `backend/src/validations/article.validation.ts`

```typescript
import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const articleIdParamSchema = z.object({
  id: z.string().uuid("Invalid article UUID"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
```

#### 3. Create Repository in `backend/src/repositories/article.repository.ts`

```typescript
import { db } from "../config/database.js";
import type { CreateArticleInput } from "../validations/article.validation.js";

export const findArticles = async () => {
  return await db
    .selectFrom("articles")
    .selectAll()
    .orderBy("created_at", "desc")
    .execute();
};

export const findArticleById = async (id: string) => {
  return await db
    .selectFrom("articles")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
};

export const insertArticle = async (
  data: CreateArticleInput,
  authorId?: string,
) => {
  return await db
    .insertInto("articles")
    .values({
      title: data.title,
      content: data.content ?? null,
      status: data.status,
      author_id: authorId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export const deleteArticleById = async (id: string) => {
  return await db
    .deleteFrom("articles")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst();
};
```

#### 4. Create Service in `backend/src/services/article.service.ts`

```typescript
import * as articleRepo from "../repositories/article.repository.js";
import type { CreateArticleInput } from "../validations/article.validation.js";
import { NotFoundError } from "../errors/AppError.js";

export const listArticles = async () => {
  return await articleRepo.findArticles();
};

export const getArticle = async (id: string) => {
  const article = await articleRepo.findArticleById(id);
  if (!article) throw new NotFoundError(`Article with ID ${id} was not found`);
  return article;
};

export const createArticle = async (
  data: CreateArticleInput,
  authorId?: string,
) => {
  return await articleRepo.insertArticle(data, authorId);
};

export const removeArticle = async (id: string) => {
  const deleted = await articleRepo.deleteArticleById(id);
  if (!deleted) throw new NotFoundError(`Article with ID ${id} was not found`);
  return deleted;
};
```

#### 5. Create Controller in `backend/src/controllers/article.controller.ts`

```typescript
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import * as articleService from "../services/article.service.js";

export const getArticles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const articles = await articleService.listArticles();
    res.status(200).json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const article = await articleService.createArticle(req.body, req.user?.id);
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

export const deleteArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await articleService.removeArticle(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Article deleted successfully" });
  } catch (err) {
    next(err);
  }
};
```

#### 6. Register Routes in `backend/src/routes/article.routes.ts`

```typescript
import { Router } from "express";
import * as articleController from "../controllers/article.controller.js";
import { authenticate } from "../middlewares/auth/authentication.middleware.js";
import { requirePermission } from "../middlewares/auth/authorization.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createArticleSchema,
  articleIdParamSchema,
} from "../validations/article.validation.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  requirePermission("articles:read"),
  articleController.getArticles,
);
router.post(
  "/",
  requirePermission("articles:create"),
  validateRequest({ body: createArticleSchema }),
  articleController.createArticle,
);
router.delete(
  "/:id",
  requirePermission("articles:delete"),
  validateRequest({ params: articleIdParamSchema }),
  articleController.deleteArticle,
);

export default router;
```

#### 7. Mount in `backend/src/routes/index.ts`

```typescript
import articleRoutes from "./article.routes.js";
// ...
router.use("/articles", articleRoutes);
```

---

### Phase 3: Frontend Joy UI Integration

#### 1. Create Data Contracts in `frontend/src/types/article.ts`

```typescript
export interface ArticleItem {
  id: string;
  title: string;
  content: string | null;
  status: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleDto {
  title: string;
  content?: string;
  status?: "draft" | "published";
}
```

#### 2. Create API Service in `frontend/src/services/article.api.ts`

```typescript
import type { ArticleItem, CreateArticleDto } from "../types/article";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/articles`;

export const getArticlesApi = async (): Promise<ArticleItem[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch articles");
  const json = await res.json();
  return json.data;
};

export const createArticleApi = async (
  payload: CreateArticleDto,
): Promise<ArticleItem> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create article");
  const json = await res.json();
  return json.data;
};
```

#### 3. Add to Sidebar Navigation in `frontend/src/components/ui/Sidebar.tsx`

```tsx
import { BookOpen } from "lucide-react";

// Add to TEST_MENU_ITEMS:
{
  title: "Articles",
  path: "/test/articles",
  icon: <BookOpen size={18} />,
  requiredPermission: "articles:read",
}
```

#### 4. Register Protected Route in `frontend/src/routes/TestRoutes.tsx`

```tsx
import ArticlesPage from "../pages/test/articles/ArticlesPage";

// Inside <Route element={<AppLayout />}>:
<Route
  path="articles"
  element={
    <ProtectedRoute requiredPermission="articles:read">
      <ArticlesPage />
    </ProtectedRoute>
  }
/>;
```

#### 5. Build Page View in `frontend/src/pages/test/articles/ArticlesPage.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { Box, Sheet, Stack, CircularProgress } from "@mui/joy";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import PermissionGate from "@/routes/PermissionGate";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getArticlesApi, createArticleApi } from "@/services/article.api";
import type { ArticleItem } from "@/types/article";

export default function ArticlesPage() {
  const { colors } = useThemeColors();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getArticlesApi();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreate = async () => {
    const title = prompt("Enter article title:");
    if (!title) return;
    await createArticleApi({ title, status: "published" });
    fetchArticles();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="title" size="lg" bold>
          Articles Management
        </Typography>

        <PermissionGate
          permission="articles:create"
          disableOnly
          tooltipTitle="Requires articles:create clearance"
        >
          <Button colorScheme="primary" onClick={handleCreate}>
            New Article
          </Button>
        </PermissionGate>
      </Stack>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
      ) : (
        <Stack spacing={2}>
          {articles.map((art) => (
            <Sheet
              key={art.id}
              sx={{
                p: 2,
                borderRadius: "8px",
                border: `1px solid ${colors.cardBorder}`,
                bgcolor: colors.surface,
              }}
            >
              <Typography variant="title" size="sm" bold>
                {art.title}
              </Typography>
              <Typography
                variant="body"
                size="xs"
                sx={{ color: "text.secondary", mt: 0.5 }}
              >
                Status: {art.status} • Created:{" "}
                {new Date(art.created_at).toLocaleDateString()}
              </Typography>
            </Sheet>
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
   Always prefer custom local components (`Button`, `Typography`, `Container`, `Modal`) as they encapsulate brand typography, accessibility standards, and color schemes.
2. **Joy UI (`@mui/joy`)**:
   Use Joy UI as the primary design system (`Sheet`, `Stack`, `Box`, `Select`, `Input`, `Table`).
3. **MUI Material (`@mui/material`)**:
   Use only as an explicit fallback when Joy UI does not have an equivalent widget (e.g. specialized complex pickers).

### Fast Refresh Strict Hygiene

To maintain Vite Hot Module Replacement (HMR) reliability:

- Files exporting React components **must only export React components**.
- Never export constants, helper functions, or TypeScript interfaces from the same file as a React component.
- Place types in `src/types/`, constants in `src/constants/`, and utility functions in `src/utils/`.

### Styling with Design Tokens

Avoid raw inline styles or CSS files for component styling. Use Joy UI design tokens via the `sx` prop:

```tsx
<Box
  sx={{
    bgcolor: "background.surface",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "md",
    p: 2,
  }}
>
  ...
</Box>
```

---

## 8. Backend Engineering Standards & API Protocols

### Strict TypeScript Rules

- **Zero `any`**: Explicitly type inputs, outputs, and intermediate states. Use `unknown` with runtime type narrowing (e.g. Zod parsing) when handling uncertain payloads.
- **Kysely Queries**: Always use typed query builders (`selectFrom`, `insertInto`, `updateTable`, `deleteFrom`). Never use raw unchecked query strings unless unavoidable.

### RFC 7807 Problem Details Standard

All error responses adhere to the standard RFC 7807 problem details JSON structure:

```json
{
  "type": "https://errors.example.com/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Article with ID d0000000-0000-0000-0000-000000000001 was not found",
  "instance": "/api/v1/articles/d0000000-0000-0000-0000-000000000001",
  "errors": []
}
```

The central error handling middleware (`backend/src/middlewares/error.middleware.ts`) automatically transforms `AppError`, `ZodError`, and unexpected exceptions into this format.

### Atomic Kysely Transactions

For operations involving multiple inserts, updates, or deletes, wrap the logic in a Kysely transaction:

```typescript
import { db } from "../config/database.js";

export const transferOwnership = async (
  projectId: string,
  newOwnerId: string,
) => {
  return await db.transaction().execute(async (trx) => {
    // Step 1: Verify project exists
    const project = await trx
      .selectFrom("projects")
      .selectAll()
      .where("id", "=", projectId)
      .executeTakeFirstOrThrow();

    // Step 2: Update project owner
    await trx
      .updateTable("projects")
      .set({ owner_id: newOwnerId, updated_at: new Date() })
      .where("id", "=", projectId)
      .execute();

    // Step 3: Insert audit log entry
    await trx
      .insertInto("audit_logs")
      .values({
        action: "transfer_ownership",
        entity_id: projectId,
        previous_owner: project.owner_id,
        new_owner: newOwnerId,
      })
      .execute();
  });
};
```

---

## 9. Production Build & Deployment Guide

### Monorepo Build Command

From the repository root:

```bash
npm run build
```

This triggers:

1. `npm run build -w backend` $\rightarrow$ Compiles TypeScript via `tsc` into `backend/dist`.
2. `npm run build -w frontend` $\rightarrow$ Compiles the SPA using Vite into `frontend/dist`.

### Backend Deployment (Node.js / Container)

Run the compiled backend server:

```bash
cd backend
NODE_ENV=production npm run start
```

Or using PM2 for process management and auto-restart:

```bash
pm2 start dist/server.js --name "api-backend" -i max
```

### Frontend Deployment (Static Host / Nginx)

The `frontend/dist` directory contains static assets. Deploy to Nginx, Cloudflare Pages, AWS S3 + CloudFront, or Vercel.

**Sample Nginx Configuration (SPA Routing):**

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/my-project/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security & Production Checklist

1. **Replace Default JWT Secrets**: Generate strong cryptographic secrets using `openssl rand -base64 64` for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
2. **Restrict CORS**: Set `CLIENT_URL` in `backend/.env` to your exact production domain.
3. **Database Credentials**: Change the default `postgrespassword` in PostgreSQL and restrict external network access to port `5432`.
4. **Change Default Demo Passwords**: Update or deactivate demo accounts before exposing the system to public traffic.

---

## 10. Troubleshooting & FAQ

### Q1: `ECONNREFUSED 127.0.0.1:5432` during migration or server start

- **Cause**: PostgreSQL is not running or listening on port 5432.
- **Solution**:
  - If using Docker: run `docker compose up -d` and verify health with `docker compose ps`.
  - If running local PostgreSQL: verify service status (`sudo systemctl status postgresql` or Windows Services).

### Q2: `database "boilerplate_db" does not exist`

- **Cause**: Connecting with a tool before the migration engine ran.
- **Solution**: Run `npm run db:migrate`. The runner connects to the PostgreSQL server and creates `boilerplate_db` automatically.

### Q3: React Fast Refresh Warning: `Fast Refresh only works when a file only exports components`

- **Cause**: Exporting a helper function, constant, or hook from a file containing a React component.
- **Solution**: Move constants to `src/constants/`, types to `src/types/`, and non-component utilities to `src/utils/`.

### Q4: CORS Error in Browser Console (`Access-Control-Allow-Origin`)

- **Cause**: `CLIENT_URL` in `backend/.env` does not match the frontend origin.
- **Solution**: Verify that `CLIENT_URL` is set to `http://localhost:5173` (or your production frontend URL) and restart the backend server.

### Q5: How do I completely wipe and recreate the database?

- **Solution**: Run:
  ```bash
  npm run db:reset
  ```
  This drops all tables, applies all migrations in `database/migrations/`, and re-executes all seeders in `database/seeders/`.
