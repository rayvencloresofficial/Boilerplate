import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Grid,
  Box,
  Stack,
  CircularProgress,
  Table,
  IconButton,
  Tooltip,
} from "@mui/joy";
import {
  ShieldAlert,
  Play,
  Terminal,
  FileKey,
  Flame,
  UserPlus,
  Trash2,
  Sliders,
  BarChart3,
  Cpu,
  Copy,
  RotateCcw,
  Zap,
  Check,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import {
  testRbacEndpoint,
  getPermissionsApi,
  type RbacTestResult,
} from "../../../services/rbac.api";
import type { Permission } from "../../../types/auth";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import PermissionGate from "../../../routes/PermissionGate";

interface TestEndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  method: "GET" | "POST" | "DELETE" | "PUT";
  requiredGuard: string;
  guardType: "role" | "permission";
  icon: ReactNode;
}

const TEST_ENDPOINTS: TestEndpointConfig[] = [
  {
    id: "super_admin",
    name: "Root Server Maintenance",
    endpoint: "/super-admin",
    method: "GET",
    requiredGuard: "super_admin",
    guardType: "role",
    icon: <Cpu size={15} />,
  },
  {
    id: "admin_area",
    name: "Admin Central Console",
    endpoint: "/admin-area",
    method: "GET",
    requiredGuard: "admin",
    guardType: "role",
    icon: <ShieldAlert size={15} />,
  },
  {
    id: "user_create",
    name: "Provision User Account",
    endpoint: "/user-create",
    method: "POST",
    requiredGuard: "users:create",
    guardType: "permission",
    icon: <UserPlus size={15} />,
  },
  {
    id: "user_delete",
    name: "Purge User Account",
    endpoint: "/user-delete",
    method: "DELETE",
    requiredGuard: "users:delete",
    guardType: "permission",
    icon: <Trash2 size={15} />,
  },
  {
    id: "roles_manage",
    name: "Update Role Permissions",
    endpoint: "/roles-manage",
    method: "POST",
    requiredGuard: "roles:manage",
    guardType: "permission",
    icon: <Sliders size={15} />,
  },
  {
    id: "analytics_read",
    name: "Audit Telemetry & Metrics",
    endpoint: "/analytics-read",
    method: "GET",
    requiredGuard: "analytics:read",
    guardType: "permission",
    icon: <BarChart3 size={15} />,
  },
  {
    id: "settings_manage",
    name: "Mutate Security Config",
    endpoint: "/settings-manage",
    method: "PUT",
    requiredGuard: "settings:manage",
    guardType: "permission",
    icon: <Flame size={15} />,
  },
];

const ALL_SYSTEM_PERMISSIONS = [
  { slug: "users:read", module: "users", desc: "Read user lists & identities" },
  { slug: "users:create", module: "users", desc: "Provision new accounts" },
  {
    slug: "users:update",
    module: "users",
    desc: "Modify user profile & roles",
  },
  {
    slug: "users:delete",
    module: "users",
    desc: "Purge account from database",
  },
  { slug: "roles:read", module: "roles", desc: "Inspect access matrix" },
  { slug: "roles:manage", module: "roles", desc: "Mutate role boundaries" },
  {
    slug: "analytics:read",
    module: "analytics",
    desc: "Stream telemetry logs",
  },
  {
    slug: "settings:read",
    module: "settings",
    desc: "Read runtime configuration",
  },
  {
    slug: "settings:manage",
    module: "settings",
    desc: "Mutate system parameters",
  },
];

export default function RbacTestPortal() {
  const { user, hasPermission, hasRole, quickLogin, demoAccounts } = useAuth();
  const { colors } = useThemeColors();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<RbacTestResult | null>(null);
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [livePermissions, setLivePermissions] = useState<Permission[]>([]);

  useEffect(() => {
    let ignore = false;
    getPermissionsApi()
      .then((perms) => {
        if (!ignore && perms && perms.length > 0) {
          setLivePermissions(perms);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const displayPermissions = useMemo(() => {
    if (livePermissions.length > 0) {
      return livePermissions.map((p) => ({
        slug: p.slug,
        module: p.module,
        desc: p.description || "",
      }));
    }
    return ALL_SYSTEM_PERMISSIONS;
  }, [livePermissions]);

  const grantedCount = useMemo(() => {
    return displayPermissions.filter(
      (p) => user?.roles.includes("super_admin") || hasPermission(p.slug),
    ).length;
  }, [displayPermissions, user, hasPermission]);

  // Interactive Filter Tabs: all | role | permission
  const [filterTab, setFilterTab] = useState<"all" | "role" | "permission">(
    "all",
  );

  // Batch runner state
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<Record<string, number>>({});

  const filteredEndpoints = useMemo(() => {
    if (filterTab === "all") return TEST_ENDPOINTS;
    return TEST_ENDPOINTS.filter((e) => e.guardType === filterTab);
  }, [filterTab]);

  const handleRunTest = async (testConfig: TestEndpointConfig) => {
    setTestingEndpointId(testConfig.id);
    setActiveTest(testConfig.name);
    try {
      const result = await testRbacEndpoint(
        testConfig.endpoint,
        testConfig.method,
      );
      setTestResult(result);
      setBatchResults((prev) => ({ ...prev, [testConfig.id]: result.status }));
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleRunAllTests = async () => {
    setIsBatchRunning(true);
    const newResults: Record<string, number> = {};
    for (const ep of TEST_ENDPOINTS) {
      setTestingEndpointId(ep.id);
      setActiveTest(ep.name);
      try {
        const res = await testRbacEndpoint(ep.endpoint, ep.method);
        newResults[ep.id] = res.status;
        setTestResult(res);
      } catch {
        newResults[ep.id] = 500;
      }
    }
    setBatchResults(newResults);
    setTestingEndpointId(null);
    setIsBatchRunning(false);
  };

  const handleCopyJson = () => {
    if (!testResult) return;
    navigator.clipboard.writeText(JSON.stringify(testResult.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Stack spacing={3}>
      {/* Test Portal Header */}
      <Container
        elevation={0}
        style={{
          backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
          border:
            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography variant="header" size="xs" bold>
                RBAC Test Portal
              </Typography>
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.06em",
                }}
              >
                [DEVELOPMENT BENCH]
              </Typography>
            </Stack>
            <Typography variant="caption" size="xs" color="secondary">
              Active identity:{" "}
              <b style={{ color: "var(--joy-palette-text-primary, #09090b)" }}>
                {user?.first_name} {user?.last_name}
              </b>{" "}
              ({user?.email}) &bull; Clearance:{" "}
              <span
                style={{
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 700,
                  color: colors.accent,
                  textTransform: "uppercase",
                }}
              >
                [{user?.roles?.join(", ")}]
              </span>
            </Typography>
          </Box>

          {/* Persona Switchers */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            alignItems="center"
          >
            {demoAccounts.map((account) => {
              const isCurrent = user?.email === account.email;
              return (
                <Button
                  key={account.email}
                  size="sm"
                  variant={isCurrent ? "solid" : "outlined"}
                  colorScheme="primary"
                  onClick={() => quickLogin(account.email)}
                  sx={{
                    borderRadius: "6px",
                    fontSize: "0.775rem",
                    fontWeight: isCurrent ? 700 : 500,
                    py: 0.5,
                    px: 1.25,
                  }}
                >
                  {isCurrent ? `✓ ${account.title}` : account.title}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </Container>

      {/* Main Grid: Endpoint Tester + Terminal Inspector */}
      <Grid container spacing={3}>
        {/* Left Column: Live Endpoint Testing Harness */}
        <Grid xs={12} lg={7}>
          <Container
            elevation={0}
            radius="12px"
            padding="1.5rem"
            style={{
              height: "100%",
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            {/* Top Bar: Title & Batch Run */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="body" size="sm" bold>
                  Endpoint Verification Harness
                </Typography>
                <Typography variant="caption" size="xs" color="secondary">
                  Trigger runtime API requests to test 200 OK vs RFC 7807 403
                  Forbidden
                </Typography>
              </Box>

              <Button
                size="sm"
                variant="outlined"
                colorScheme="primary"
                disabled={isBatchRunning}
                onClick={handleRunAllTests}
                startDecorator={
                  isBatchRunning ? (
                    <CircularProgress size="sm" />
                  ) : (
                    <Play size={13} />
                  )
                }
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.775rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {isBatchRunning ? "Testing All..." : "Run All Routes"}
              </Button>
            </Stack>

            {/* Filter Tabs */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {(
                [
                  { id: "all", label: `All (${TEST_ENDPOINTS.length})` },
                  { id: "role", label: "Role Guards" },
                  { id: "permission", label: "Permission Guards" },
                ] as const
              ).map((tab) => {
                const isSelected = filterTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    size="sm"
                    variant={isSelected ? "solid" : "outlined"}
                    colorScheme="primary"
                    onClick={() => setFilterTab(tab.id)}
                    sx={{
                      borderRadius: "6px",
                      fontSize: "0.775rem",
                      fontWeight: isSelected ? 700 : 500,
                      py: 0.4,
                      px: 1.5,
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>

            {/* Endpoints List */}
            <Stack spacing={1}>
              {filteredEndpoints.map((endpoint) => {
                const isExpectedToPass =
                  user?.roles.includes("super_admin") ||
                  (endpoint.guardType === "role"
                    ? hasRole(endpoint.requiredGuard)
                    : hasPermission(endpoint.requiredGuard));

                const isRunning = testingEndpointId === endpoint.id;
                const status = batchResults[endpoint.id];
                const methodBadgeClass = `badge-method badge-method-${endpoint.method.toLowerCase()}`;

                return (
                  <Box
                    key={endpoint.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "0.85rem 1rem",
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
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ color: "text.secondary" }}>
                        {endpoint.icon}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body" size="xs" bold>
                            {endpoint.name}
                          </Typography>
                          {status && (
                            <Typography
                              variant="caption"
                              size="xs"
                              sx={{
                                fontFamily: "var(--font-code, monospace)",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color:
                                  status === 200
                                    ? "var(--color-get, #10b981)"
                                    : "var(--color-delete, #f43f5e)",
                              }}
                            >
                              [{status}]
                            </Typography>
                          )}
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.25 }}
                        >
                          <span className={methodBadgeClass}>
                            {endpoint.method}
                          </span>
                          <Typography
                            variant="caption"
                            size="xs"
                            color="secondary"
                            sx={{
                              fontFamily: "var(--font-code, monospace)",
                              fontSize: "0.72rem",
                            }}
                          >
                            {endpoint.endpoint}
                          </Typography>
                          <Typography
                            variant="caption"
                            size="xs"
                            color="secondary"
                            sx={{
                              fontFamily: "var(--font-code, monospace)",
                              fontSize: "0.7rem",
                              opacity: 0.7,
                            }}
                          >
                            guard: {endpoint.requiredGuard}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{
                          display: { xs: "none", sm: "inline" },
                          fontFamily: "var(--font-code, monospace)",
                          fontSize: "0.7rem",
                          color: isExpectedToPass
                            ? "text.secondary"
                            : "var(--color-put, #f59e0b)",
                        }}
                      >
                        {isExpectedToPass ? "will pass" : "will 403"}
                      </Typography>

                      <Button
                        size="sm"
                        variant={isExpectedToPass ? "solid" : "outlined"}
                        colorScheme="primary"
                        disabled={isRunning || isBatchRunning}
                        onClick={() => handleRunTest(endpoint)}
                        startDecorator={
                          isRunning ? (
                            <CircularProgress size="sm" />
                          ) : (
                            <Play size={12} />
                          )
                        }
                        sx={{
                          minWidth: 88,
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {isRunning ? "Sending" : "Test"}
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Container>
        </Grid>

        {/* Right Column: HTTP Response Inspector */}
        <Grid xs={12} lg={5}>
          <Stack spacing={3}>
            {/* Terminal Window */}
            <Container
              elevation={0}
              radius="12px"
              padding="0"
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  bgcolor: "#161b22",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Terminal
                    size={14}
                    style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  />
                  <Typography
                    variant="caption"
                    size="xs"
                    sx={{
                      fontFamily: "var(--font-code, monospace)",
                      color: "#e2e8f0",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    Response Inspector {activeTest ? `— ${activeTest}` : ""}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  {testResult && (
                    <Typography
                      variant="caption"
                      size="xs"
                      sx={{
                        fontFamily: "var(--font-code, monospace)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color:
                          testResult.status === 200
                            ? "var(--color-get, #10b981)"
                            : "var(--color-delete, #f43f5e)",
                      }}
                    >
                      HTTP {testResult.status} ({testResult.latencyMs}ms)
                    </Typography>
                  )}

                  {testResult && (
                    <Tooltip
                      title={copied ? "Copied!" : "Copy Payload"}
                      size="sm"
                    >
                      <IconButton
                        size="sm"
                        variant="plain"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          "&:hover": { color: "#ffffff" },
                        }}
                        onClick={handleCopyJson}
                      >
                        {copied ? (
                          <Check size={14} style={{ color: "#22c55e" }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}

                  {testResult && (
                    <Tooltip title="Reset Inspector" size="sm">
                      <IconButton
                        size="sm"
                        variant="plain"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          "&:hover": { color: "#ffffff" },
                        }}
                        onClick={() => {
                          setTestResult(null);
                          setActiveTest(null);
                        }}
                      >
                        <RotateCcw size={13} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  fontFamily: "var(--font-code, monospace)",
                  fontSize: "0.785rem",
                  color: "#e2e8f0",
                  lineHeight: 1.5,
                  minHeight: 220,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {testResult ? (
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "inherit",
                    }}
                  >
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                ) : (
                  <Typography
                    variant="caption"
                    color="light"
                    sx={{
                      opacity: 0.4,
                      fontFamily: "var(--font-code, monospace)",
                      display: "block",
                      py: 3,
                      textAlign: "center",
                    }}
                  >
                    // Execute any route test to inspect the live response JSON.
                  </Typography>
                )}
              </Box>
            </Container>

            {/* Active Identity Privileges Table */}
            <Container
              elevation={0}
              radius="12px"
              padding="1.25rem"
              style={{
                backgroundColor:
                  "var(--joy-palette-background-surface, #ffffff)",
                border:
                  "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <FileKey
                  size={16}
                  style={{ color: colors.accent }}
                />
                <Typography variant="body" size="xs" bold>
                  Live System Permissions Matrix ({grantedCount}/{displayPermissions.length} Granted)
                </Typography>
              </Stack>

              <Table
                size="sm"
                aria-label="Active permissions"
                hoverRow
                sx={{
                  "& tr > *": { py: 0.7, px: 1 },
                  "& tbody tr:hover": {
                    bgcolor:
                      "var(--joy-palette-neutral-softBg, rgba(0,0,0,0.02))",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Module</th>
                    <th style={{ textAlign: "right" }}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPermissions.map((p) => {
                    const granted =
                      user?.roles.includes("super_admin") ||
                      hasPermission(p.slug);
                    return (
                      <tr key={p.slug}>
                        <td>
                          <Typography
                            variant="caption"
                            size="xs"
                            sx={{
                              fontFamily: "var(--font-code, monospace)",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          >
                            {p.slug}
                          </Typography>
                        </td>
                        <td>
                          <Typography
                            variant="caption"
                            size="xs"
                            color="secondary"
                          >
                            {p.module}
                          </Typography>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {granted ? (
                            <span
                              style={{
                                fontFamily: "var(--font-code, monospace)",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                color: "var(--color-get, #10b981)",
                              }}
                            >
                              ✓ GRANTED
                            </span>
                          ) : (
                            <span
                              style={{
                                fontFamily: "var(--font-code, monospace)",
                                fontSize: "0.72rem",
                                opacity: 0.4,
                              }}
                            >
                              — DENIED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Container>
          </Stack>
        </Grid>
      </Grid>

      {/* Declarative Gate Showcase */}
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
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Zap size={16} style={{ color: colors.accent }} />
          <Typography variant="body" size="xs" bold>
            Client-Side Authorization Gate Showcase (&lt;PermissionGate&gt;)
          </Typography>
        </Stack>
        <Typography variant="caption" size="xs" color="secondary">
          UI components evaluate current user clearance declaratively. Actions
          without permissions are automatically disabled with informative
          tooltips.
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 2 }}>
          <PermissionGate permission="users:create" disableOnly>
            <Button
              colorScheme="primary"
              variant="solid"
              startDecorator={<UserPlus size={15} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Create User (users:create)
            </Button>
          </PermissionGate>

          <PermissionGate permission="users:delete" disableOnly>
            <Button
              variant="outlined"
              colorScheme="primary"
              startDecorator={<Trash2 size={15} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Purge User (users:delete)
            </Button>
          </PermissionGate>

          <PermissionGate
            role="super_admin"
            disableOnly
            tooltipTitle="Restricted exclusively to Super Admins"
          >
            <Button
              variant="outlined"
              colorScheme="primary"
              startDecorator={<Cpu size={15} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Root Cluster Override
            </Button>
          </PermissionGate>
        </Stack>
      </Container>
    </Stack>
  );
}
