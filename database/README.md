# Database Module

Standalone PostgreSQL schema management, migration runner, and seeder system for the application.

---

## Features

- **Sequential Migration Tracking**: Scans `migrations/*.sql` and tracks applied files in a `_migrations` table so they are executed only once.
- **Transactional Safety**: Every migration and seeder file is wrapped in an atomic SQL transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
- **Auto Database Creation**: If the target database (`boilerplate_db`) does not exist on your PostgreSQL server, the runner automatically connects to the server and creates it for you.
- **Flexible Environment Loading**: Automatically checks `database/.env`, with automatic fallback to `backend/.env`.

---

## Directory Structure

```text
database/
├── migrations/          # DDL schema files (e.g. 001_create_rbac_schema.sql)
├── seeders/             # SQL seeder files (e.g. 001_seed_rbac.sql)
├── src/
│   ├── client.ts        # Database connection pool & auto-db creation
│   ├── migrate.ts       # Migration execution engine
│   ├── seed.ts          # Seeder execution engine
│   └── reset.ts         # Combined reset script (migrate + seed)
├── .env                 # Local database environment configuration
├── .env.example         # Configuration template
├── package.json         # Workspace package definition
└── tsconfig.json        # TypeScript configuration
```

---

## Configuration

Edit [database/.env](.env) or set environment variables:

```env
# Full connection string
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/boilerplate_db

# Or individual variables:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=postgrespassword
# PGDATABASE=boilerplate_db
```

---

## Usage

### 1. From the `database/` directory:

```bash
cd database

# Run pending migrations
npm run migrate

# Run seeders
npm run seed

# Run both migrations and seeders
npm run reset
```

### 2. From the Project Root:

```bash
# Run pending migrations
npm run db:migrate

# Run seeders
npm run db:seed

# Run both migrations and seeders
npm run db:reset
```
