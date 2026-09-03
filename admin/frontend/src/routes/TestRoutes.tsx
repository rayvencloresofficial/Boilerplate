import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/TestLayout";

// Pages
import LoginPage from "../pages/public/auth/LoginPage";
import Dashboard from "../pages/test/dashboard/dashboard";
import RbacTestPortal from "../pages/test/testpad/RbacTestPortal";
import UsersPage from "../pages/test/users/UsersPage";
import RolesPage from "../pages/test/roles/RolesPage";
import SettingsPage from "../pages/test/setting/settings";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Test Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="test" element={<RbacTestPortal />} />
            <Route path="testpad" element={<RbacTestPortal />} />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPermission="users:read">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute requiredPermission="roles:read">
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredPermission="settings:read">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
