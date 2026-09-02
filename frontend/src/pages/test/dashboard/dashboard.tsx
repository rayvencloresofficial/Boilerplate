import { useNavigate } from "react-router-dom";
import { Grid, Box, Stack } from "@mui/joy";
import {
  ShieldCheck,
  Users,
  KeyRound,
  FlaskConical,
  ArrowRight,
  Lock,
  FileText,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";

export default function Dashboard() {
  const { user, quickLogin, demoAccounts } = useAuth();
  const { colors } = useThemeColors();
  const navigate = useNavigate();

  const primaryRole = user?.roles?.[0] || "user";

  return (
    <Stack spacing={3}>
      {/* Welcome Banner */}
      <Container
        elevation={0}
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "text.primary",
                  color: "background.surface",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={18} />
              </Box>
              <Typography variant="header" size="md" bold>
                Enterprise RBAC Platform
              </Typography>
            </Stack>
            <Typography variant="body" size="xs" color="secondary">
              Logged in as <b>{user?.first_name} {user?.last_name}</b> ({user?.email}) &bull; Assigned Role:{" "}
              <span
                style={{
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 700,
                  color: colors.accent,
                  textTransform: "uppercase",
                }}
              >
                [{primaryRole}]
              </span>
            </Typography>
          </Box>

          {/* Persona quick switch */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
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

      {/* Prominent RBAC Development Test Portal Launcher Card */}
      <Container
        elevation={0}
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.accent}`,
          boxShadow: `0 4px 20px -4px ${colors.accent}20`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2.5}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "10px",
                bgcolor: "text.primary",
                color: "background.surface",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlaskConical size={24} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body" size="md" bold>
                  RBAC Development Test Portal
                </Typography>
                <Typography
                  variant="caption"
                  size="xs"
                  sx={{
                    fontFamily: "var(--font-code, monospace)",
                    fontSize: "0.68rem",
                    bgcolor: `${colors.accent}18`,
                    color: colors.accent,
                    px: 0.75,
                    py: 0.2,
                    borderRadius: "4px",
                    fontWeight: 700,
                  }}
                >
                  DEV TOOLS
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Dedicated workbench to test live API endpoint route guards, RFC
                7807 problem details, and client-side PermissionGate directives
                in real-time.
              </Typography>
            </Box>
          </Stack>

          <Button
            size="md"
            variant="solid"
            colorScheme="primary"
            onClick={() => navigate("/test/testpad")}
            endDecorator={<ArrowRight size={16} />}
            sx={{
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              px: 2.25,
            }}
          >
            Launch Test Portal
          </Button>
        </Stack>
      </Container>

      {/* KPI Overview Metrics */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} lg={3}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Active Identities
              </Typography>
              <Users size={16} style={{ opacity: 0.5 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              4 Verified
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Demo personas seeded in database
            </Typography>
          </Container>
        </Grid>

        <Grid xs={12} sm={6} lg={3}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Security Roles
              </Typography>
              <KeyRound size={16} style={{ opacity: 0.5 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              4 Tiers
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              super_admin, admin, manager, user
            </Typography>
          </Container>
        </Grid>

        <Grid xs={12} sm={6} lg={3}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Permissions Matrix
              </Typography>
              <ShieldCheck size={16} style={{ opacity: 0.5 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              9 Boundaries
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Granular access control policies
            </Typography>
          </Container>
        </Grid>

        <Grid xs={12} sm={6} lg={3}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                size="xs"
                color="secondary"
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Database Engine
              </Typography>
              <Lock size={16} style={{ opacity: 0.5 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              PostgreSQL 16
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Kysely runtime type-safe query builder
            </Typography>
          </Container>
        </Grid>
      </Grid>

      {/* Quick Navigation Cards */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            flex={1}
            padding="1.5rem"
            hover={true}
            hoverEffect="lift"
            onClick={() => navigate("/test/documents")}
            style={{
              cursor: "pointer",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <FileText size={20} />
              <Typography variant="body" size="sm" bold>
                Documents Repository
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mb: 2, display: "block" }}
            >
              Enterprise documentation hub with fine-grained RBAC permission controls.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 600,
                  color: colors.accent,
                }}
              >
                Browse Documents &rarr;
              </Typography>
            </Stack>
          </Container>
        </Grid>

        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            flex={1}
            padding="1.5rem"
            hover={true}
            hoverEffect="lift"
            onClick={() => navigate("/test/users")}
            style={{
              cursor: "pointer",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Users size={20} />
              <Typography variant="body" size="sm" bold>
                User Identity Directory
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mb: 2, display: "block" }}
            >
              Provision new users, review credential security, and modify
              security roles for any account.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 600,
                  color: colors.accent,
                }}
              >
                Manage Directory &rarr;
              </Typography>
            </Stack>
          </Container>
        </Grid>

        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            flex={1}
            radius="12px"
            padding="1.5rem"
            hover={true}
            hoverEffect="lift"
            onClick={() => navigate("/test/roles")}
            style={{
              cursor: "pointer",
              backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <KeyRound size={20} />
              <Typography variant="body" size="sm" bold>
                Access Control Matrix
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mb: 2, display: "block" }}
            >
              Inspect and configure permissions assigned to each security tier
              with live atomic synchronization.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 600,
                  color: "var(--color-primary, #185ee0)",
                }}
              >
                View Access Matrix &rarr;
              </Typography>
            </Stack>
          </Container>
        </Grid>
      </Grid>
    </Stack>
  );
}
