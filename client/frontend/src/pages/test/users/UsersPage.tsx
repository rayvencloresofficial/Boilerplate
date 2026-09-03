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
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  CircularProgress,
  Alert,
  Select,
  Option,
  Avatar,
  Divider,
} from "@mui/joy";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Shield,
} from "lucide-react";
import {
  getUsersApi,
  getRolesApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../../../services/rbac.api";
import type { User, Role } from "../../../types/auth";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import PermissionGate from "../../../routes/PermissionGate";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Expandable row state for interactive drill-down
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Edit Roles Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("Password123!");
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newRoleIds, setNewRoleIds] = useState<string[]>([]);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [usersData, rolesData] = await Promise.all([
          getUsersApi(),
          getRolesApi(),
        ]);
        if (!ignore) {
          setUsers(usersData);
          setRoles(rolesData);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch users or roles.",
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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const admins = users.filter((u) =>
      u.roles.some((r) => r === "super_admin" || r === "admin"),
    ).length;
    return { total, active, admins };
  }, [users]);

  const handleToggleExpand = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const handleOpenEditModal = (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(targetUser);
    const activeRoleIds = roles
      .filter((r) => targetUser.roles.includes(r.name))
      .map((r) => r.id);
    setSelectedRoleIds(activeRoleIds);
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await updateUserApi(editingUser.id, { role_ids: selectedRoleIds });
      setEditingUser(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update user roles.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createUserApi({
        email: newEmail,
        password: newPassword,
        first_name: newFirstName,
        last_name: newLastName,
        role_ids: newRoleIds,
      });
      setIsCreateModalOpen(false);
      setNewEmail("");
      setNewFirstName("");
      setNewLastName("");
      setNewRoleIds([]);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (
    id: string,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently remove identity ${name}?`)) return;
    try {
      await deleteUserApi(id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  return (
    <Stack spacing={3}>
      {/* Metric Counters Strip - Minimalist, black/white/primary */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Container
          elevation={0}
          radius="10px"
          padding="1.25rem 1.5rem"
          direction="row"
          align="center"
          gap="1rem"
          flex={1}
          style={{
            backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
            border:
              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "neutral.softBg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={18} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Total Identities
            </Typography>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ fontFamily: "var(--font-code, monospace)" }}
            >
              {stats.total}
            </Typography>
          </Box>
        </Container>

        <Container
          elevation={0}
          radius="10px"
          padding="1.25rem 1.5rem"
          direction="row"
          align="center"
          gap="1rem"
          flex={1}
          style={{
            backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
            border:
              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "neutral.softBg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserCheck size={18} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Active Clearance
            </Typography>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ fontFamily: "var(--font-code, monospace)" }}
            >
              {stats.active}
            </Typography>
          </Box>
        </Container>

        <Container
          elevation={0}
          radius="10px"
          padding="1.25rem 1.5rem"
          direction="row"
          align="center"
          gap="1rem"
          flex={1}
          style={{
            backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
            border:
              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "neutral.softBg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={18} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Privileged Admins
            </Typography>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ fontFamily: "var(--font-code, monospace)" }}
            >
              {stats.admins}
            </Typography>
          </Box>
        </Container>
      </Stack>

      {/* Main Table Container */}
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
        {/* Header & Controls Toolbar */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="body" size="sm" bold>
              User Access Directory
            </Typography>
            <Typography variant="caption" size="xs" color="secondary">
              Click any row to inspect assigned permissions and token
              identifiers.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            flexWrap="wrap"
          >
            <Input
              size="sm"
              placeholder="Filter by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startDecorator={<Search size={14} />}
              sx={{
                minWidth: 210,
                borderRadius: "6px",
                fontSize: "0.8rem",
              }}
            />

            <Select
              size="sm"
              value={roleFilter}
              onChange={(_e, val) => val && setRoleFilter(val)}
              sx={{ minWidth: 140, borderRadius: "6px", fontSize: "0.8rem" }}
            >
              <Option value="all">All Roles</Option>
              {roles.map((r) => (
                <Option key={r.id} value={r.name}>
                  {r.name.replace(/_/g, " ").toUpperCase()}
                </Option>
              ))}
            </Select>

            <PermissionGate
              permission="users:create"
              disableOnly
              tooltipTitle="Requires 'users:create' permission"
            >
              <Button
                variant="solid"
                colorScheme="primary"
                onClick={() => setIsCreateModalOpen(true)}
                startDecorator={<UserPlus size={15} />}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Add User
              </Button>
            </PermissionGate>
          </Stack>
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
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="caption" size="xs" color="secondary">
              No identities found matching the search criteria.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table
              aria-label="Users directory"
              hoverRow
              sx={{
                "& tr > *": { py: 1.25, px: 2 },
                "& tbody tr": {
                  cursor: "pointer",
                  transition: "background-color 0.12s ease",
                },
                "& tbody tr:hover": {
                  bgcolor:
                    "var(--joy-palette-neutral-softBg, rgba(0,0,0,0.025))",
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }} />
                  <th style={{ minWidth: 210 }}>User Identity</th>
                  <th style={{ minWidth: 200 }}>Email Address</th>
                  <th style={{ minWidth: 100 }}>Status</th>
                  <th style={{ minWidth: 180 }}>Role Assigned</th>
                  <th style={{ textAlign: "right", minWidth: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initials =
                    `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase();
                  const isExpanded = expandedUserId === u.id;

                  return (
                    <>
                      <tr
                        key={u.id}
                        onClick={() => handleToggleExpand(u.id)}
                        style={{
                          backgroundColor: isExpanded
                            ? "var(--joy-palette-neutral-softBg, rgba(0,0,0,0.03))"
                            : "transparent",
                        }}
                      >
                        <td>
                          {isExpanded ? (
                            <ChevronUp size={15} style={{ opacity: 0.6 }} />
                          ) : (
                            <ChevronDown size={15} style={{ opacity: 0.4 }} />
                          )}
                        </td>
                        <td>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              size="sm"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                bgcolor: "text.primary",
                                color: "background.surface",
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="body" size="xs" bold>
                                {u.first_name} {u.last_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                size="xs"
                                color="secondary"
                                sx={{
                                  fontFamily: "var(--font-code, monospace)",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {u.id.substring(0, 12)}
                              </Typography>
                            </Box>
                          </Stack>
                        </td>
                        <td>
                          <Typography
                            variant="caption"
                            size="xs"
                            sx={{ fontFamily: "var(--font-code, monospace)" }}
                          >
                            {u.email}
                          </Typography>
                        </td>
                        <td>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: u.is_active
                                  ? "var(--color-get, #10b981)"
                                  : "text.secondary",
                              }}
                            />
                            <Typography
                              variant="caption"
                              size="xs"
                              sx={{
                                fontFamily: "var(--font-code, monospace)",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                              }}
                            >
                              {u.is_active ? "ACTIVE" : "INACTIVE"}
                            </Typography>
                          </Stack>
                        </td>
                        <td>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            {u.roles.map((r) => (
                              <span
                                key={r}
                                style={{
                                  fontFamily: "var(--font-code, monospace)",
                                  fontSize: "0.725rem",
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border:
                                    "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                                  textTransform: "uppercase",
                                }}
                              >
                                {r}
                              </span>
                            ))}
                          </Stack>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PermissionGate
                              permission="users:update"
                              disableOnly
                              tooltipTitle="Requires 'users:update'"
                            >
                              <Button
                                size="sm"
                                variant="outlined"
                                colorScheme="primary"
                                onClick={(e) => handleOpenEditModal(u, e)}
                                startDecorator={<Edit3 size={12} />}
                                sx={{
                                  fontSize: "0.75rem",
                                  borderRadius: "6px",
                                  py: 0.25,
                                  px: 1,
                                }}
                              >
                                Roles
                              </Button>
                            </PermissionGate>

                            <PermissionGate
                              permission="users:delete"
                              disableOnly
                              tooltipTitle="Requires 'users:delete'"
                            >
                              <Button
                                size="sm"
                                variant="plain"
                                colorScheme="primary"
                                onClick={(e) =>
                                  handleDeleteUser(
                                    u.id,
                                    `${u.first_name} ${u.last_name}`,
                                    e,
                                  )
                                }
                                startDecorator={<Trash2 size={12} />}
                                sx={{
                                  fontSize: "0.75rem",
                                  borderRadius: "6px",
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
                          </Stack>
                        </td>
                      </tr>

                      {/* Interactive Expandable Details Row */}
                      {isExpanded && (
                        <tr key={`${u.id}-expanded`}>
                          <td
                            colSpan={6}
                            style={{ padding: "0 1rem 1.25rem 3.5rem" }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: "8px",
                                bgcolor: "background.surface",
                                border:
                                  "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
                              }}
                            >
                              <Stack spacing={1}>
                                <Typography
                                  variant="caption"
                                  size="xs"
                                  color="secondary"
                                >
                                  <b>Security Identifier:</b>{" "}
                                  <span
                                    style={{
                                      fontFamily: "var(--font-code, monospace)",
                                    }}
                                  >
                                    {u.id}
                                  </span>
                                </Typography>
                                <Typography
                                  variant="caption"
                                  size="xs"
                                  color="secondary"
                                >
                                  <b>Account Status:</b>{" "}
                                  <span
                                    style={{
                                      fontFamily: "var(--font-code, monospace)",
                                    }}
                                  >
                                    {u.is_active
                                      ? "Operational & Permitted"
                                      : "Deactivated / Locked Out"}
                                  </span>
                                </Typography>
                                <Typography
                                  variant="caption"
                                  size="xs"
                                  color="secondary"
                                >
                                  <b>Assigned Roles:</b> {u.roles.join(", ")}
                                </Typography>
                              </Stack>
                            </Box>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </Table>
          </Box>
        )}
      </Container>

      {/* Edit Roles Modal */}
      <Modal open={!!editingUser} onClose={() => setEditingUser(null)}>
        <ModalDialog
          sx={{
            maxWidth: 460,
            width: "100%",
            p: 3,
            borderRadius: "12px",
          }}
        >
          <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Configure Roles
          </DialogTitle>
          <DialogContent sx={{ fontSize: "0.825rem", color: "text.secondary" }}>
            Assign security roles for{" "}
            <b>
              {editingUser?.first_name} {editingUser?.last_name}
            </b>{" "}
            ({editingUser?.email}).
          </DialogContent>

          <Stack spacing={1} sx={{ my: 2 }}>
            {roles.map((role) => {
              const checked = selectedRoleIds.includes(role.id);
              return (
                <Box
                  key={role.id}
                  onClick={() => {
                    if (checked) {
                      setSelectedRoleIds(
                        selectedRoleIds.filter((id) => id !== role.id),
                      );
                    } else {
                      setSelectedRoleIds([...selectedRoleIds, role.id]);
                    }
                  }}
                  sx={{
                    p: "0.75rem 1rem",
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
                    <Typography
                      variant="caption"
                      size="xs"
                      bold
                      sx={{
                        fontFamily: "var(--font-code, monospace)",
                        textTransform: "uppercase",
                      }}
                    >
                      {role.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      size="xs"
                      color="secondary"
                      sx={{ display: "block" }}
                    >
                      {role.description || "System role"}
                    </Typography>
                  </Box>
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedRoleIds([...selectedRoleIds, role.id]);
                      } else {
                        setSelectedRoleIds(
                          selectedRoleIds.filter((id) => id !== role.id),
                        );
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Stack>

          <DialogActions>
            <Button
              variant="plain"
              colorScheme="primary"
              onClick={() => setEditingUser(null)}
              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="primary"
              onClick={handleSaveRoles}
              disabled={isSaving}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              {isSaving ? "Saving..." : "Save Role Assignment"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Create User Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ModalDialog
          sx={{
            maxWidth: 480,
            width: "100%",
            p: 3,
            borderRadius: "12px",
          }}
        >
          <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Provision Account
          </DialogTitle>
          <DialogContent sx={{ fontSize: "0.825rem", color: "text.secondary" }}>
            Add new identity credentials to the system database.
          </DialogContent>

          <Divider sx={{ my: 1.5 }} />

          <form onSubmit={handleCreateUser}>
            <Stack spacing={2} sx={{ my: 1 }}>
              <Stack direction="row" spacing={1.5}>
                <FormControl required sx={{ flex: 1 }}>
                  <FormLabel sx={{ fontWeight: 600, fontSize: "0.775rem" }}>
                    First Name
                  </FormLabel>
                  <Input
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Jane"
                    sx={{ borderRadius: "6px" }}
                  />
                </FormControl>
                <FormControl required sx={{ flex: 1 }}>
                  <FormLabel sx={{ fontWeight: 600, fontSize: "0.775rem" }}>
                    Last Name
                  </FormLabel>
                  <Input
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Doe"
                    sx={{ borderRadius: "6px" }}
                  />
                </FormControl>
              </Stack>

              <FormControl required>
                <FormLabel sx={{ fontWeight: 600, fontSize: "0.775rem" }}>
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@example.com"
                  sx={{ borderRadius: "6px" }}
                />
              </FormControl>

              <FormControl required>
                <FormLabel sx={{ fontWeight: 600, fontSize: "0.775rem" }}>
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  sx={{ borderRadius: "6px" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel sx={{ fontWeight: 600, fontSize: "0.775rem" }}>
                  Initial Roles
                </FormLabel>
                <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                  {roles.map((r) => (
                    <Checkbox
                      key={r.id}
                      label={
                        <span
                          style={{
                            fontFamily: "var(--font-code, monospace)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {r.name}
                        </span>
                      }
                      checked={newRoleIds.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setNewRoleIds([...newRoleIds, r.id]);
                        else
                          setNewRoleIds(newRoleIds.filter((id) => id !== r.id));
                      }}
                    />
                  ))}
                </Stack>
              </FormControl>
            </Stack>

            <DialogActions sx={{ mt: 2.5 }}>
              <Button
                variant="plain"
                colorScheme="primary"
                onClick={() => setIsCreateModalOpen(false)}
                sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                colorScheme="primary"
                disabled={isSaving}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isSaving ? "Creating..." : "Create Account"}
              </Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
