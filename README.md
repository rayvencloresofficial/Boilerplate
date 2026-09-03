# Enterprise Full-Stack Monorepo Boilerplate

An enterprise-grade, production-ready Full-Stack Monorepo boilerplate featuring **React 19 + TypeScript + Joy UI** on the frontend, **Node.js + Express + Kysely + PostgreSQL** on the backend, a standalone **Database Migration & Seeding Engine**, and a comprehensive **Role-Based Access Control (RBAC)** security system.

---

## Architecture & Workspaces

This repository is organized as an npm workspaces monorepo with strict architectural boundaries:

```text
├── frontend/             # Vite + React 19 + TypeScript + Joy UI Client
├── backend/              # Node.js + Express (ESM) + TypeScript + Kysely REST API
├── database/             # Standalone PostgreSQL Migration & Seeding Engine
└── docs/                 # System Architecture, RBAC & Developer Manuals
```

- **[frontend/](frontend/)**: Single Page Application (SPA) powered by Vite and React 19. Styled with Joy UI design tokens (`sx`), featuring custom UI wrappers, light/dark theme switcher, fast-refresh hygiene, and granular route/component permission gates.
- **[backend/](backend/)**: 3-Tier Layered Architecture (`Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`) with strict TypeScript. Validated at runtime with Zod schemas, returning RFC 7807 problem details, and executing parameterized type-safe queries via Kysely.
- **[database/](database/)**: Standalone database execution workspace. **Single Source of Truth** for DDL migrations (`migrations/`) and seeders (`seeders/`). Runs inside atomic transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) with automatic database creation. Zero migration code in `backend/`.
- **[docs/](docs/)**: Comprehensive documentation, including the [Developer Manual](docs/BOILERPLATE_MANUAL.md) and [RBAC Architecture Guide](docs/RBAC_GUIDE.md).

---

## Quick Setup Guide (Step-by-Step)

Follow these steps to clone this boilerplate, detach it from the template git history, publish it as your own official repository, and boot the entire stack locally.

---

### Step 1: Clone the Boilerplate Repository

Clone the repository into your desired project folder:

```bash
git clone https://github.com/rayvencloresofficial/Boilerplate.git my-awesome-project
cd my-awesome-project
```

_(Replace `my-awesome-project` with your actual project or client name)._

---

### Step 2: Decouple from Boilerplate & Publish as an Official Project

To make this repository your own standalone official project, remove the existing `.git` directory and commit history, update project identifiers, and push to your new remote repository.

#### 2.1 Remove the Existing Git History

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

#### 2.2 Rename the Project in `package.json` Files

Update the `"name"` field in your root and package configurations to match your new project:

1. **Root `package.json`**:
   ```json
   {
     "name": "my-awesome-project",
     "private": true,
     ...
   }
   ```
2. **`frontend/package.json`**:
   ```json
   {
     "name": "my-awesome-project-frontend",
     ...
   }
   ```
3. **`backend/package.json`**:
   ```json
   {
     "name": "my-awesome-project-backend",
     ...
   }
   ```
4. **`database/package.json`**:
   ```json
   {
     "name": "my-awesome-project-database",
     ...
   }
   ```

#### 2.3 Initialize a Fresh Git Repository

Initialize your clean repository on the `main` branch:

```bash
git init -b main
```

#### 2.4 Stage and Make Initial Commit

```bash
git add .
git commit -m "chore: initial release from enterprise monorepo boilerplate"
```

#### 2.5 Link Remote Repository & Publish

Create an empty repository on your Git host (GitHub, GitLab, Bitbucket, Azure DevOps, etc.), then link and push:

```bash
# Add your official remote repository
git remote add origin https://github.com/<your-org-or-username>/my-awesome-project.git

# Push and set upstream
git push -u origin main
```

Your project is now officially published as an independent, clean repository!

---

### Step 3: Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v16+` (either locally installed or via Docker Desktop)
- **Docker & Docker Compose** (optional, recommended for zero-config database provisioning)

---

### Step 4: Environment Variables Setup

Copy the example environment files for all three workspaces:

#### 4.1 Backend Environment (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

_(On Windows PowerShell: `Copy-Item backend/.env.example backend/.env`)_

Verify contents of `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db
JWT_SECRET=super-secure-access-secret-replace-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=super-secure-refresh-secret-replace-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

#### 4.2 Database Environment (`database/.env`)

```bash
cp database/.env.example database/.env
```

_(On Windows PowerShell: `Copy-Item database/.env.example database/.env`)_

Verify contents of `database/.env`:

```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db
```

#### 4.3 Frontend Environment (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

_(On Windows PowerShell: `Copy-Item frontend/.env.example frontend/.env`)_

Verify contents of `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

### Step 5: Database Provisioning & Seeding

#### Option A: Using Docker Compose (Recommended)

Start the PostgreSQL 17 Alpine container in the background:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` with username `postgres`, password `postgrespassword`, and database `boilerplate_db`.

#### Option B: Using a Local PostgreSQL Instance

If you are running PostgreSQL natively or via a cloud provider, update `DATABASE_URL` in `database/.env` and `backend/.env` to match your credentials. The migration engine automatically creates `boilerplate_db` if it does not already exist.

#### Run Migrations and Seed RBAC Accounts

From the project root:

```bash
# Execute schema migrations (DDL)
npm run db:migrate

# Seed default RBAC roles, permissions, accounts, and sample data
npm run db:seed
```

> **Tip:** You can execute a full teardown, re-migration, and re-seed at any time with:
>
> ```bash
> npm run db:reset
> ```

---

### Step 6: Install Dependencies & Run Development Servers

Install dependencies across all workspaces in one command:

```bash
npm install
```

Start both the backend API and the frontend client concurrently:

```bash
npm run dev
```

### Accessing the Applications

| Service                 | URL                                                          | Notes                    |
| :---------------------- | :----------------------------------------------------------- | :----------------------- |
| **Frontend Web App**    | [http://localhost:5173](http://localhost:5173)               | Vite HMR + Joy UI Portal |
| **Backend REST API**    | [http://localhost:5000/api/v1](http://localhost:5000/api/v1) | Express REST API         |
| **PostgreSQL Database** | `localhost:5432`                                             | DB: `boilerplate_db`     |

You can also run backend or frontend separately:

```bash
npm run dev:backend    # Runs backend only (http://localhost:5000)
npm run dev:frontend   # Runs frontend only (http://localhost:5173)
```

---

## Pre-Configured Demo Accounts

The database seeder provisions four demo accounts covering each role tier. All accounts share the same default password:

**Password for all demo accounts:** `Password123!`

| Role Persona         | Email                    | Access Scope                                                                                             |
| :------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------- |
| 👑 **Super Admin**   | `superadmin@example.com` | Full universal bypass. Unrestricted access to all modules, users, roles, and settings.                   |
| 🛡️ **Administrator** | `admin@example.com`      | User management (`users:*`), documents management (`documents:*`), role view, analytics, settings read.  |
| 💼 **Manager**       | `manager@example.com`    | User viewing (`users:read`), document authoring (`documents:read`, `documents:create`), settings read.   |
| 👤 **User**          | `user@example.com`       | Base authenticated identity. Read access to documents (`documents:read`) and settings (`settings:read`). |

> **Interactive Persona Switcher**: The frontend includes an active identity dropdown in the sidebar to test permissions without manually logging out.

---

## Monorepo Command Cheatsheet

### Root Commands

| Command                | Action                                                             |
| :--------------------- | :----------------------------------------------------------------- |
| `npm run dev`          | Start backend and frontend concurrently with colored terminal logs |
| `npm run dev:backend`  | Start backend development server (with `--watch`)                  |
| `npm run dev:frontend` | Start frontend Vite development server                             |
| `npm run build`        | Build backend (`tsc`) and frontend (`vite build`) for production   |
| `npm run db:migrate`   | Run all pending SQL migrations in `database/migrations/`           |
| `npm run db:seed`      | Run all SQL seeders in `database/seeders/`                         |
| `npm run db:reset`     | Run full database migration and seed reset                         |

### Individual Workspace Commands

- **Backend**:
  - `npm run build -w backend` - Compile TypeScript to `backend/dist`
  - `npm run start -w backend` - Run compiled production server
- **Frontend**:
  - `npm run build -w frontend` - Compile production bundle to `frontend/dist`
  - `npm run preview -w frontend` - Preview production build locally
- **Database**:
  - `npm run migrate -w database` - Execute migration runner
  - `npm run seed -w database` - Execute seeder runner
  - `npm run reset -w database` - Combined migration + seeder runner

---

## Documentation & Developer Guides

- 📘 **[Boilerplate Developer Manual](docs/BOILERPLATE_MANUAL.md)**: Comprehensive guide detailing the layered architecture, step-by-step instructions for adding new full-stack modules, transaction patterns, error handling, and production deployment.
- 🛡️ **[RBAC System & Security Guide](docs/RBAC_GUIDE.md)**: Deep dive into the Role-Based Access Control matrix, JWT authentication lifecycle, token revocation, backend route guards, and frontend permission gates.
