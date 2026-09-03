import type { FC, ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/joy";
import Typography from "../components/ui/Typography";

interface ProtectedRouteProps {
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  children?: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  requiredRole,
  requiredPermission,
  children,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size="lg" variant="soft" color="primary" />
        <Typography variant="body" color="secondary">
          Authenticating secure session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/test/login" state={{ from: location }} replace />;
  }

  // Check role guard
  if (requiredRole) {
    const rolesToCheck = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    const allowed = hasRole(...rolesToCheck);
    if (!allowed) {
      return (
        <Navigate
          to="/test/unauthorized"
          state={{ reason: "role", required: rolesToCheck }}
          replace
        />
      );
    }
  }

  // Check permission guard
  if (requiredPermission) {
    const permsToCheck = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];
    const allowed = hasPermission(...permsToCheck);
    if (!allowed) {
      return (
        <Navigate
          to="/test/unauthorized"
          state={{ reason: "permission", required: permsToCheck }}
          replace
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
