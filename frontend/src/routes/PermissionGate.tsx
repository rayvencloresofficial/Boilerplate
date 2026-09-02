import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Tooltip } from "@mui/joy";

interface PermissionGateProps {
  permission?: string | string[];
  role?: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disableOnly?: boolean;
  tooltipTitle?: string;
}

/**
 * Declarative component gate that conditionally renders or disables elements based on RBAC privileges.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  role,
  requireAll = false,
  children,
  fallback = null,
  disableOnly = false,
  tooltipTitle,
}) => {
  const { hasPermission, hasAllPermissions, hasRole } = useAuth();

  let hasAccess = true;

  if (role) {
    const rolesArray = Array.isArray(role) ? role : [role];
    hasAccess = hasRole(...rolesArray);
  }

  if (hasAccess && permission) {
    const permsArray = Array.isArray(permission) ? permission : [permission];
    hasAccess = requireAll
      ? hasAllPermissions(permsArray)
      : hasPermission(...permsArray);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (disableOnly && React.isValidElement(children)) {
    const defaultReason = permission
      ? `Requires permission: ${Array.isArray(permission) ? permission.join(", ") : permission}`
      : `Requires role: ${Array.isArray(role) ? role.join(", ") : role}`;

    const title = tooltipTitle || defaultReason;

    // Clone element with disabled prop and tooltip wrapper
    return (
      <Tooltip title={title} variant="soft" color="danger">
        <span style={{ display: "inline-block", cursor: "not-allowed" }}>
          {React.cloneElement(
            children as React.ReactElement<{
              disabled?: boolean;
              style?: React.CSSProperties;
            }>,
            {
              disabled: true,
              style: { pointerEvents: "none", opacity: 0.6 },
            },
          )}
        </span>
      </Tooltip>
    );
  }

  return <>{fallback}</>;
};

export default PermissionGate;
