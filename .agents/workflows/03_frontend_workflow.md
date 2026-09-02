---
description: Frontend Implementation
---

## Step 3: Frontend Integration (`frontend/`)

### 3.1 API Service Layer (`frontend/src/services/[module].api.ts`)

Never execute raw `fetch` calls directly inside React components. Create a dedicated API service:

```ts
import type { DocumentItem, CreateDocumentDto } from "../types/document";

const BASE_URL = "/api/v1/documents";

export const getDocumentsApi = async (): Promise<DocumentItem[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch documents");
  const json = await res.json();
  return json.data;
};

export const createDocumentApi = async (
  payload: CreateDocumentDto,
): Promise<DocumentItem> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create document");
  const json = await res.json();
  return json.data;
};
```

### 3.2 Sidebar Navigation Link (`frontend/src/components/ui/Sidebar.tsx`)

Add the module to `TEST_MENU_ITEMS` (or standard navigation list):

```tsx
{
  title: "Documents",
  path: "/test/documents",
  icon: <FileText size={18} />,
  requiredPermission: "documents:read",
}
```

_Note: Items with `requiredPermission` automatically hide for users lacking clearance._

### 3.3 Protected Route Registration (`frontend/src/routes/`)

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

### 3.4 Page View with Permission Gates (`frontend/src/pages/[module]/`)

Build the UI adhering to the **Component Priority Order** (Local UI $\rightarrow$ Joy UI $\rightarrow$ MUI):

- Use `<PermissionGate permission="documents:create" disableOnly>` to conditionally render or disable mutation actions with tooltip feedback.
- Use `useThemeColors()` to style containers, buttons, and headers according to the active theme palette.

```tsx
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import PermissionGate from "@/components/auth/PermissionGate";

export default function DocumentsPage() {
  return (
    <div>
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
    </div>
  );
}
```

---
