import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  Table,
  Box,
  Stack,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  CircularProgress,
  Alert,
  Input,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/joy";
import { Check, Minus, Edit3, Search, ShieldPlus, Trash2 } from "lucide-react";
import {
  getRolesApi,
  getPermissionsApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "../../../services/rbac.api";
import type { Role, Permission } from "../../../types/auth";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import PermissionGate from "../../../routes/PermissionGate";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Module Filter Tab: "all" | "users" | "roles" | "analytics" | "settings"
  const [activeModuleTab, setActiveModuleTab] = useState<string>("all");

  // Edit Permissions Dialog State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editRoleDescription, setEditRoleDescription] = useState<string>("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [permSearchQuery, setPermSearchQuery] = useState<string>("");

  // Create Custom Role Modal State
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDescription, setNewRoleDescription] = useState<string>("");
  const [newRolePermissionIds, setNewRolePermissionIds] = useState<string[]>(
    [],
  );
  const [createPermSearch, setCreatePermSearch] = useState<string>("");
  const [createModuleTab, setCreateModuleTab] = useState<string>("all");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const roleNameRegex = /^[a-z0-9_]+$/;
  const isRoleNameValid =
    newRoleName.trim().length >= 2 &&
    newRoleName.trim().length <= 50 &&
    roleNameRegex.test(newRoleName.trim());

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rolesData, permsData] = await Promise.all([
          getRolesApi(),
          getPermissionsApi(),
        ]);
        if (!ignore) {
          setRoles(rolesData);
          setPermissions(permsData);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch roles or permissions.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const availableModules = useMemo(() => {
    const set = new Set<string>();
    permissions.forEach((p) => set.add(p.module));
    return Array.from(set);
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    if (activeModuleTab === "all") return permissions;
    return permissions.filter((p) => p.module === activeModuleTab);
  }, [permissions, activeModuleTab]);

  const filteredModalPermissions = useMemo(() => {
    if (!permSearchQuery.trim()) return permissions;
    const q = permSearchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [permissions, permSearchQuery]);

  const filteredCreatePermissions = useMemo(() => {
    let list = permissions;
    if (createModuleTab !== "all") {
      list = list.filter((p) => p.module === createModuleTab);
    }
    if (createPermSearch.trim()) {
      const q = createPermSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.slug.toLowerCase().includes(q) ||
          p.module.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [permissions, createModuleTab, createPermSearch]);

  const handleOpenCreateRole = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRolePermissionIds([]);
    setCreatePermSearch("");
    setCreateModuleTab("all");
    setCreateError(null);
    setIsCreateRoleOpen(true);
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!isRoleNameValid) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      await createRoleApi({
        name: newRoleName.trim().toLowerCase(),
        description: newRoleDescription.trim() || undefined,
        permission_ids: newRolePermissionIds,
      });
      setIsCreateRoleOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create custom role.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      alert("System protected roles cannot be deleted.");
      return;
    }
    const confirmed = window.confirm(
      `Permanently delete custom role "${role.name}"?\nAll users assigned to this role will lose its permissions.`,
    );
    if (!confirmed) return;

    try {
      await deleteRoleApi(role.id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete custom role.",
      );
    }
  };

  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setEditRoleDescription(role.description || "");
    setPermSearchQuery("");
    const activePermIds = permissions
      .filter((p) => role.permissions.includes(p.slug))
      .map((p) => p.id);
    setSelectedPermissionIds(activePermIds);
  };

  const handleSelectAllInModal = () => {
    setSelectedPermissionIds(permissions.map((p) => p.id));
  };

  const handleDeselectAllInModal = () => {
    setSelectedPermissionIds([]);
  };

  const handleSaveRolePermissions = async () => {
    if (!editingRole) return;
    setIsSaving(true);
    try {
      await updateRoleApi(editingRole.id, {
        description: editRoleDescription.trim() || undefined,
        permission_ids: selectedPermissionIds,
      });
      setEditingRole(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update role permissions.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Permission Matrix Grid Table */}
      <Container
        elevation={0}
        radius="12px"
        padding="1.5rem"
        style={{
          backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
          border:
            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body" size="sm" bold>
              Role &amp; Permission Access Matrix
            </Typography>
            <Typography variant="caption" size="xs" color="secondary">
              Cross-reference operational permissions mapped to each system
              clearance tier.
            </Typography>
          </Box>

          <PermissionGate
            permission="roles:manage"
            disableOnly
            tooltipTitle="Requires 'roles:manage' permission"
          >
            <Button
              variant="solid"
              colorScheme="primary"
              onClick={handleOpenCreateRole}
              startDecorator={<ShieldPlus size={16} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              New Custom Role
            </Button>
          </PermissionGate>
        </Stack>

        {/* Module Filter Tabs */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 2 }}>
          <Button
            size="sm"
            variant={activeModuleTab === "all" ? "solid" : "outlined"}
            colorScheme="primary"
            onClick={() => setActiveModuleTab("all")}
            sx={{
              borderRadius: "6px",
              fontSize: "0.775rem",
              fontWeight: activeModuleTab === "all" ? 700 : 500,
              py: 0.35,
              px: 1.25,
            }}
          >
            All Modules ({permissions.length})
          </Button>

          {availableModules.map((mod) => {
            const isSelected = activeModuleTab === mod;
            return (
              <Button
                key={mod}
                size="sm"
                variant={isSelected ? "solid" : "outlined"}
                colorScheme="primary"
                onClick={() => setActiveModuleTab(mod)}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.775rem",
                  fontWeight: isSelected ? 700 : 500,
                  py: 0.35,
                  px: 1.25,
                  textTransform: "capitalize",
                }}
              >
                {mod}
              </Button>
            );
          })}
        </Stack>

        {error && (
          <Alert
            color="danger"
            variant="soft"
            sx={{ mb: 2, borderRadius: "6px" }}
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress size="md" />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table
              aria-label="Role Permission Matrix"
              hoverRow
              sx={{
                "& tr > *": { py: 1, px: 2 },
                "& tbody tr:hover": {
                  bgcolor:
                    "var(--joy-palette-neutral-softBg, rgba(0,0,0,0.025))",
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ minWidth: 230 }}>Permission Slug</th>
                  <th style={{ minWidth: 110 }}>Module</th>
                  {roles.map((r) => (
                    <th
                      key={r.id}
                      style={{ textAlign: "center", minWidth: 130 }}
                    >
                      <Box>
                        <span
                          style={{
                            fontFamily: "var(--font-code, monospace)",
                            fontWeight: 700,
                            fontSize: "0.775rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {r.name}
                        </span>
                        {r.is_system ? (
                          <Typography
                            align="center"
                            variant="caption"
                            size="xs"
                            color="secondary"
                            sx={{
                              display: "block",
                              fontSize: "0.65rem",
                              opacity: 0.6,
                            }}
                          >
                            [SYSTEM]
                          </Typography>
                        ) : (
                          <Typography
                            variant="caption"
                            align="center"
                            size="xs"
                            sx={{
                              display: "block",
                              fontSize: "0.65rem",
                              color: "var(--color-primary, #185ee0)",
                              fontWeight: 700,
                            }}
                          >
                            [CUSTOM]
                          </Typography>
                        )}
                      </Box>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Typography
                        variant="caption"
                        size="xs"
                        bold
                        sx={{
                          fontFamily: "var(--font-code, monospace)",
                          fontSize: "0.775rem",
                        }}
                      >
                        {p.slug}
                      </Typography>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{ display: "block" }}
                      >
                        {p.description || p.slug}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{
                          fontFamily: "var(--font-code, monospace)",
                          fontSize: "0.725rem",
                        }}
                      >
                        {p.module}
                      </Typography>
                    </td>
                    {roles.map((role) => {
                      const hasPerm =
                        role.name === "super_admin" ||
                        role.permissions.includes(p.slug);
                      return (
                        <td key={role.id} style={{ textAlign: "center" }}>
                          {hasPerm ? (
                            <Check
                              size={16}
                              style={{
                                color: "var(--color-primary, #185ee0)",
                                display: "inline-block",
                                verticalAlign: "middle",
                              }}
                            />
                          ) : (
                            <Minus
                              size={14}
                              style={{
                                opacity: 0.3,
                                display: "inline-block",
                                verticalAlign: "middle",
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        )}
      </Container>

      {/* Role Configuration Cards */}
      <Container
        elevation={0}
        radius="12px"
        padding="1.5rem"
        style={{
          backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
          border:
            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
        }}
      >
        <Typography variant="body" size="sm" bold sx={{ mb: 2 }}>
          Security Role Definitions &amp; Boundary Configuration
        </Typography>

        <Stack spacing={1.5}>
          {roles.map((role) => {
            const isSuperAdmin = role.name === "super_admin";

            return (
              <Box
                key={role.id}
                sx={{
                  p: "1.15rem 1.25rem",
                  borderRadius: "8px",
                  bgcolor: "background.surface",
                  border:
                    "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                  transition: "border-color 0.15s ease",
                  "&:hover": {
                    borderColor: "var(--color-primary, #185ee0)",
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Typography
                        variant="body"
                        size="sm"
                        bold
                        sx={{
                          fontFamily: "var(--font-code, monospace)",
                          textTransform: "uppercase",
                        }}
                      >
                        {role.name}
                      </Typography>
                      {role.is_system ? (
                        <Typography
                          variant="caption"
                          size="xs"
                          color="secondary"
                          sx={{
                            fontFamily: "var(--font-code, monospace)",
                            fontSize: "0.68rem",
                            border:
                              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                            px: 0.75,
                            borderRadius: "4px",
                          }}
                        >
                          SYSTEM PROTECTED
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          size="xs"
                          sx={{
                            fontFamily: "var(--font-code, monospace)",
                            fontSize: "0.68rem",
                            color: "var(--color-primary, #185ee0)",
                            bgcolor: "rgba(24, 94, 224, 0.08)",
                            border: "1px solid rgba(24, 94, 224, 0.25)",
                            px: 0.75,
                            borderRadius: "4px",
                            fontWeight: 700,
                          }}
                        >
                          CUSTOM ROLE
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      size="xs"
                      color="secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {role.description || "System RBAC access profile"}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{
                          fontFamily: "var(--font-code, monospace)",
                          fontSize: "0.72rem",
                        }}
                      >
                        Mapped:{" "}
                        {isSuperAdmin
                          ? "UNIVERSAL ACCESS (*)"
                          : role.permissions.length === 0
                            ? "NONE"
                            : role.permissions.join(", ")}
                      </Typography>
                    </Box>
                  </Box>

                  {!isSuperAdmin && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PermissionGate
                        permission="roles:manage"
                        disableOnly
                        tooltipTitle="Requires 'roles:manage' permission"
                      >
                        <Button
                          size="sm"
                          variant="outlined"
                          colorScheme="primary"
                          onClick={() => handleOpenEditRole(role)}
                          startDecorator={<Edit3 size={13} />}
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.775rem",
                            fontWeight: 600,
                            minWidth: 140,
                          }}
                        >
                          Configure Matrix
                        </Button>
                      </PermissionGate>

                      {!role.is_system && (
                        <PermissionGate
                          permission="roles:manage"
                          disableOnly
                          tooltipTitle="Requires 'roles:manage' permission"
                        >
                          <Button
                            size="sm"
                            variant="plain"
                            colorScheme="primary"
                            onClick={() => handleDeleteRole(role)}
                            startDecorator={<Trash2 size={13} />}
                            sx={{
                              borderRadius: "6px",
                              fontSize: "0.775rem",
                              py: 0.25,
                              px: 1,
                              "&:hover": {
                                color: "var(--color-delete, #f43f5e)",
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </PermissionGate>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Container>

      {/* Create Custom Role Modal Dialog */}
      <Modal
        open={isCreateRoleOpen}
        onClose={() => !isCreating && setIsCreateRoleOpen(false)}
      >
        <ModalDialog
          sx={{
            maxWidth: 600,
            width: "100%",
            p: 3,
            borderRadius: "12px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShieldPlus
              size={20}
              style={{ color: "var(--color-primary, #185ee0)" }}
            />
            Create Custom Security Role
          </DialogTitle>
          <DialogContent sx={{ fontSize: "0.825rem", color: "text.secondary" }}>
            Provision a new role clearance tier and select operational
            permissions.
          </DialogContent>

          {createError && (
            <Alert
              color="danger"
              variant="soft"
              sx={{ my: 1.5, borderRadius: "6px", fontSize: "0.825rem" }}
            >
              {createError}
            </Alert>
          )}

          <Divider sx={{ my: 1.5 }} />

          <form
            onSubmit={handleCreateRole}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Stack spacing={2} sx={{ mb: 2 }}>
              <FormControl
                required
                error={newRoleName.length > 0 && !isRoleNameValid}
              >
                <FormLabel
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Role Identifier
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g. support_lead, auditor, billing_specialist"
                  value={newRoleName}
                  onChange={(e) =>
                    setNewRoleName(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  sx={{
                    borderRadius: "6px",
                    fontFamily: "var(--font-code, monospace)",
                  }}
                />
                <FormHelperText
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  Lowercase alphanumeric with underscores only (2–50
                  characters).
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Role Description
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="Brief summary of responsibilities and access scope"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  sx={{ borderRadius: "6px" }}
                />
              </FormControl>
            </Stack>

            {/* Permission Assignment Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="label"
                  size="xs"
                  bold
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Assign Permissions ({newRolePermissionIds.length} Selected)
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="sm"
                    variant="plain"
                    colorScheme="secondary"
                    onClick={() => {
                      const allVisibleIds = filteredCreatePermissions.map(
                        (p) => p.id,
                      );
                      setNewRolePermissionIds((prev) => [
                        ...new Set([...prev, ...allVisibleIds]),
                      ]);
                    }}
                    sx={{ fontSize: "0.72rem", py: 0 }}
                  >
                    Select Filtered
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    colorScheme="secondary"
                    onClick={() => setNewRolePermissionIds([])}
                    sx={{ fontSize: "0.72rem", py: 0 }}
                  >
                    Clear All
                  </Button>
                </Stack>
              </Stack>

              {/* Module Filter & Search */}
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Input
                  size="sm"
                  placeholder="Search permissions..."
                  value={createPermSearch}
                  onChange={(e) => setCreatePermSearch(e.target.value)}
                  startDecorator={<Search size={14} />}
                  sx={{ flex: 1, borderRadius: "6px" }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                sx={{ mb: 1.5 }}
              >
                <Button
                  size="sm"
                  variant={createModuleTab === "all" ? "solid" : "outlined"}
                  colorScheme="primary"
                  onClick={() => setCreateModuleTab("all")}
                  sx={{
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    py: 0.2,
                    px: 1,
                  }}
                >
                  All
                </Button>
                {availableModules.map((mod) => (
                  <Button
                    key={mod}
                    size="sm"
                    variant={createModuleTab === mod ? "solid" : "outlined"}
                    colorScheme="primary"
                    onClick={() => setCreateModuleTab(mod)}
                    sx={{
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      py: 0.2,
                      px: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {mod}
                  </Button>
                ))}
              </Stack>

              {/* Permission Checkbox List */}
              <Box
                sx={{
                  maxHeight: 240,
                  overflowY: "auto",
                  pr: 0.5,
                  border:
                    "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                  borderRadius: "8px",
                  p: 1,
                }}
              >
                <Stack spacing={0.75}>
                  {filteredCreatePermissions.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: "center" }}>
                      <Typography variant="caption" size="xs" color="secondary">
                        No permissions found matching query.
                      </Typography>
                    </Box>
                  ) : (
                    filteredCreatePermissions.map((perm) => {
                      const checked = newRolePermissionIds.includes(perm.id);
                      return (
                        <Box
                          key={perm.id}
                          onClick={() => {
                            if (checked) {
                              setNewRolePermissionIds(
                                newRolePermissionIds.filter(
                                  (id) => id !== perm.id,
                                ),
                              );
                            } else {
                              setNewRolePermissionIds([
                                ...newRolePermissionIds,
                                perm.id,
                              ]);
                            }
                          }}
                          sx={{
                            p: "0.6rem 0.8rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: checked
                              ? "1px solid var(--color-primary, #185ee0)"
                              : "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                            bgcolor: checked
                              ? "rgba(24, 94, 224, 0.04)"
                              : "transparent",
                            transition: "all 0.12s ease",
                          }}
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                size="xs"
                                bold
                                sx={{
                                  fontFamily: "var(--font-code, monospace)",
                                }}
                              >
                                {perm.slug}
                              </Typography>
                              <Typography
                                variant="caption"
                                size="xs"
                                color="secondary"
                                sx={{
                                  fontFamily: "var(--font-code, monospace)",
                                  fontSize: "0.68rem",
                                  opacity: 0.6,
                                }}
                              >
                                [{perm.module}]
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              size="xs"
                              color="secondary"
                              sx={{ display: "block", fontSize: "0.72rem" }}
                            >
                              {perm.description || perm.slug}
                            </Typography>
                          </Box>
                          <Checkbox
                            checked={checked}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setNewRolePermissionIds([
                                  ...newRolePermissionIds,
                                  perm.id,
                                ]);
                              } else {
                                setNewRolePermissionIds(
                                  newRolePermissionIds.filter(
                                    (id) => id !== perm.id,
                                  ),
                                );
                              }
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </Stack>
              </Box>
            </Box>

            <DialogActions sx={{ mt: 2.5 }}>
              <Button
                variant="plain"
                colorScheme="primary"
                onClick={() => setIsCreateRoleOpen(false)}
                disabled={isCreating}
                sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                colorScheme="primary"
                disabled={!isRoleNameValid || isCreating}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isCreating ? "Creating..." : "Create Role"}
              </Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </Modal>

      {/* Edit Role Permissions Modal Dialog with Search & Select All */}
      <Modal open={!!editingRole} onClose={() => setEditingRole(null)}>
        <ModalDialog
          sx={{
            maxWidth: 540,
            width: "100%",
            p: 3,
            borderRadius: "12px",
          }}
        >
          <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Configure Permissions for [{editingRole?.name.toUpperCase()}]
          </DialogTitle>
          <DialogContent sx={{ fontSize: "0.825rem", color: "text.secondary" }}>
            Adjust operational authority and responsibilities for this role.
          </DialogContent>

          <Divider sx={{ my: 1.5 }} />

          <FormControl sx={{ mb: 1.5 }}>
            <FormLabel
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Role Description
            </FormLabel>
            <Input
              size="sm"
              value={editRoleDescription}
              onChange={(e) => setEditRoleDescription(e.target.value)}
              placeholder="Operational description of role scope"
              sx={{ borderRadius: "6px" }}
            />
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Input
              size="sm"
              placeholder="Search permissions..."
              value={permSearchQuery}
              onChange={(e) => setPermSearchQuery(e.target.value)}
              startDecorator={<Search size={14} />}
              sx={{ flex: 1, borderRadius: "6px" }}
            />
            <Button
              size="sm"
              variant="plain"
              colorScheme="secondary"
              onClick={handleSelectAllInModal}
              sx={{ fontSize: "0.72rem", py: 0 }}
            >
              All
            </Button>
            <Button
              size="sm"
              variant="plain"
              colorScheme="secondary"
              onClick={handleDeselectAllInModal}
              sx={{ fontSize: "0.72rem", py: 0 }}
            >
              None
            </Button>
          </Stack>

          <Box sx={{ maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
            <Stack spacing={0.75}>
              {filteredModalPermissions.map((perm) => {
                const checked = selectedPermissionIds.includes(perm.id);
                return (
                  <Box
                    key={perm.id}
                    onClick={() => {
                      if (checked) {
                        setSelectedPermissionIds(
                          selectedPermissionIds.filter((id) => id !== perm.id),
                        );
                      } else {
                        setSelectedPermissionIds([
                          ...selectedPermissionIds,
                          perm.id,
                        ]);
                      }
                    }}
                    sx={{
                      p: "0.65rem 0.85rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: checked
                        ? "1px solid var(--color-primary, #185ee0)"
                        : "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
                      bgcolor: checked
                        ? "rgba(24, 94, 224, 0.04)"
                        : "transparent",
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="caption"
                          size="xs"
                          bold
                          sx={{ fontFamily: "var(--font-code, monospace)" }}
                        >
                          {perm.slug}
                        </Typography>
                        <Typography
                          variant="caption"
                          size="xs"
                          color="secondary"
                          sx={{
                            fontFamily: "var(--font-code, monospace)",
                            fontSize: "0.7rem",
                            opacity: 0.6,
                          }}
                        >
                          [{perm.module}]
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{ display: "block" }}
                      >
                        {perm.description || perm.slug}
                      </Typography>
                    </Box>
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedPermissionIds([
                            ...selectedPermissionIds,
                            perm.id,
                          ]);
                        } else {
                          setSelectedPermissionIds(
                            selectedPermissionIds.filter(
                              (id) => id !== perm.id,
                            ),
                          );
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <DialogActions sx={{ mt: 2 }}>
            <Button
              variant="plain"
              colorScheme="primary"
              onClick={() => setEditingRole(null)}
              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="primary"
              onClick={handleSaveRolePermissions}
              disabled={isSaving}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {isSaving ? "Updating..." : "Save Matrix"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
