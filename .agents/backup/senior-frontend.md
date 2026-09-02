---
description: End-to-end frontend workflow for Vite, React, TypeScript, and Joy UI. Guides component hierarchy, Fast Refresh boundaries, RBAC integration, and styling standards.
---

# Senior Frontend Development Workflow

Execute frontend UI features, pages, and components using **Vite + React (TypeScript) + Joy UI**.

---

## Step 1: Component Selection & Hierarchy

Always strictly adhere to the 3-tier **Component Priority Order**:

1. **Local UI Wrappers (`src/components/ui/`)**:
   - Check and reuse local components first (`Button`, `Calendar`, `Container`, `Typography`, etc.).
2. **Joy UI (`@mui/joy`)**:
   - For all layouts, cards, modals, sheets, form controls, and feedback elements (`Card`, `Sheet`, `Stack`, `Input`, `Select`, `Modal`, `Skeleton`, etc.).
   - Use semantic variants (`variant="plain" | "outlined" | "soft" | "solid"`) and theme colors (`primary`, `neutral`, `danger`, `warning`, `success`).
3. **MUI (`@mui/material`)**:
   - Fallback *only* when Joy UI lacks a required complex component (e.g., advanced DateRangePickers, DataGrid).
   - Harmonize MUI styling with Joy UI tokens to avoid visual discordance.

---

## Step 2: Architecture & Fast Refresh Compliance

To maintain blazing-fast HMR without full page reloads, enforce strict file boundaries:

- **Component Files (`.tsx`)**:
  - Must **only** export React components.
  - Never export constants, hooks, or helper functions from a file exporting a component.
- **Custom Hooks (`src/hooks/`)**:
  - Place in dedicated `.ts` files (e.g., `src/hooks/useAuth.ts`, `src/hooks/usePermission.ts`).
- **Constants & Mock Data (`src/constants/`)**:
  - Place static constants and fixtures in `src/constants/` (e.g., `src/constants/demoCredentials.ts`).
- **Context Definitions (`src/context/`)**:
  - Define Context interfaces and `createContext()` in pure `.ts` files (e.g., `src/context/AuthContext.ts`).
  - Implement Provider components in separate pure `.tsx` files (e.g., `src/context/AuthProvider.tsx`).

---

## Step 3: API Integration & Service Layer (`src/services/`)

1. **Service Functions**:
   - Create or update API clients in `src/services/[feature].api.ts`.
   - Never write raw `fetch` calls directly inside component bodies.
2. **Type Safety**:
   - Define request payloads and response contracts in `src/types/`.
   - Ensure zero `any` types across all service interfaces.

---

## Step 4: Routing & RBAC Integration (`src/routes/` & `src/hooks/`)

1. **Route Registration**:
   - Add new view routes to `src/routes/AppRoutes.tsx`.
2. **Route Protection**:
   - Wrap protected paths with `<ProtectedRoute requiredRole="..." requiredPermission="...">`.
3. **Conditional In-Page Elements**:
   - Use `<PermissionGate permission="..." disableOnly={...}>` to hide or disable actions based on user permissions.

---

## Step 5: Responsive Layout & Design System (`sx` Tokens)

- Apply responsive styles using Joy UI breakpoint objects:
  ```tsx
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    p: { xs: 2, md: 3 },
  }}
  ```
- Avoid raw CSS or ad-hoc style tags; leverage Joy UI tokens for radius, palette, spacing, and typography.
- Ensure all interactive elements meet the minimum touch target requirement (44x44px).

---

## Quality Checklist Before Completion

- [ ] Fast Refresh verified: No non-component exports from `.tsx` component files.
- [ ] Component Priority Order respected: Local UI -> Joy UI -> MUI.
- [ ] Strict TypeScript: Zero `any` types; all props, state, and callbacks strongly typed.
- [ ] API calls isolated to `src/services/` with typed responses.
- [ ] Responsive across breakpoints (`xs` through `xl`).
- [ ] Accessible interaction states implemented (`hover`, `focus-visible`, `disabled`, `loading`).
- [ ] `npm run build -w frontend` succeeds without errors.
