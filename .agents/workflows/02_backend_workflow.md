---
description: Backend BFF Implementation
---

## Step 2: Backend BFF Implementation (`admin/backend/` and/or `client/backend/`)

Identify the target BFF for your feature:
- **`admin/backend/`** (Port 3000): For administrative dashboards, system configuration, audit telemetry, and back-office management.
- **`client/backend/`** (Port 4000): For end-user consumer operations, client profile management, and customer self-service.

Follow the strict **Controller $\rightarrow$ Service $\rightarrow$ Repository** layered architecture inside the target BFF.

---

### 2.1 Database & Domain Types

1. **Update Kysely schema** in `[admin|client]/backend/src/types/database.ts`:

   ```ts
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

2. **Create domain interfaces & DTOs** in `[admin|client]/backend/src/types/[module].ts`.

---

### 2.2 Repository Layer (`src/repositories/[module].repository.ts`)

- Use Kysely typed queries only (`selectFrom`, `insertInto`, `updateTable`, `deleteFrom`).
- Keep data access completely isolated from HTTP concerns.

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

---

### 2.3 Service Layer (`src/services/[module].service.ts`)

- Implement pure business logic, permissions logic, and validation.
- Tailor returned payloads specifically for the target frontend (BFF principle).
- Wrap multi-step mutations inside atomic Kysely transactions: `db.transaction().execute(async trx => ...)`.

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
  // Domain validation / orchestration
  return await docRepo.createDocument(title, content, userId);
};
```

---

### 2.4 Controller Layer (`src/controllers/[module].controller.ts`)

- Validate incoming requests with **Zod**.
- Format successful responses uniformly using `ApiResponse<T>`.
- Delegate errors to `next(err)` so centralized error middleware formats RFC 7807 problem details.

```ts
import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../types/auth.js";
import type { ApiResponse } from "../types/api.js";
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
    const response: ApiResponse<typeof docs> = {
      success: true,
      data: docs,
    };
    res.status(200).json(response);
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
    const response: ApiResponse<typeof doc> = {
      success: true,
      data: doc,
      message: "Document created successfully.",
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};
```

---

### 2.5 Route Registration (`src/routes/`)

1. Create `src/routes/[module].routes.ts`:

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

2. Mount in `src/routes/index.ts`:

   ```ts
   import documentRoutes from "./document.routes.js";
   // ...
   router.use("/documents", documentRoutes);
   ```
