---
description: Frontend BFF Integration Workflow
---

## Step 3: Frontend BFF Integration (`admin/frontend/` and/or `client/frontend/`)

Identify the target application:
- **`admin/frontend/`** (Port 5173): Admin Console consuming `admin/backend` (Port 3000).
- **`client/frontend/`** (Port 5174): Client Portal consuming `client/backend` (Port 4000).

---

### 3.1 API Service Layer (`src/services/[module].api.ts`)

Never make raw `fetch` calls directly inside React components. Create a dedicated API service module communicating with the corresponding BFF:

```ts
import type { DocumentItem, CreateDocumentDto } from "../types/document";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const getDocumentsApi = async (): Promise<DocumentItem[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to fetch documents.");
  }
  const json = await res.json();
  return json.data;
};

export const createDocumentApi = async (
  payload: CreateDocumentDto,
): Promise<DocumentItem> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Failed to create document.");
  }
  const json = await res.json();
  return json.data;
};
```

---

### 3.2 Sidebar Navigation Link (`src/components/ui/Sidebar.tsx`)

Register the module in `MENU_ITEMS` or `TEST_MENU_ITEMS`:

```tsx
{
  title: "Documents",
  path: "/documents",
  icon: <FileText size={18} />,
  requiredPermission: "documents:read",
}
```

_Note: Navigation items with `requiredPermission` automatically hide for personas lacking clearance._

---

### 3.3 Protected Route Registration (`src/routes/AppRoutes.tsx` or `TestRoutes.tsx`)

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

---

### 3.4 Page View with Permission Gates (`src/pages/[module]/`)

Build UI components adhering strictly to the **Component Priority Order**:
1. **Local UI Wrappers** (`@/components/ui/Container`, `@/components/ui/Button`, `@/components/ui/Typography`). **Do NOT use `Card` from Joy UI or MUI—always use the project's custom `Container`**.
2. **Joy UI** (`@mui/joy`).
3. **MUI** (`@mui/material`) only for fallback controls.

```tsx
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PermissionGate from "@/components/auth/PermissionGate";

export default function DocumentsPage() {
  const handleCreate = () => {
    // Handler logic calling createDocumentApi
  };

  return (
    <Container elevation={1} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography variant="title" size="md" bold>
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
    </Container>
  );
}
```
