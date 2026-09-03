import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  Divider,
  Link,
  Chip,
} from "@mui/joy";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  ChevronRight,
  Shield,
  Key,
  Users,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import type { DemoAccountRole } from "../../../constants/demoCredentials";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";

const ROLE_ICONS: Record<string, typeof Shield> = {
  super_admin: Shield,
  admin: Key,
  manager: Users,
};

const ROLE_BADGE_TEXT: Record<string, string> = {
  super_admin: "FULL ROOT ACCESS",
  admin: "SYSTEM CONSOLE",
  manager: "OPERATIONS",
};

export default function LoginPage() {
  const { login, quickLogin, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, colors } = useThemeColors();

  const [email, setEmail] = useState<string>("superadmin@example.com");
  const [password, setPassword] = useState<string>("Password123!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHoverRole, setActiveHoverRole] = useState<string | null>(null);

  const destination =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/test";

  // Filter demo accounts for all administrative and custom staff roles
  const adminAccounts = demoAccounts.filter((acc) =>
    acc.roles.some((r) => r !== "user")
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid administrative credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (roleOrEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await quickLogin(roleOrEmail);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to authenticate administrative persona."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        elevation={2}
        radius="16px"
        padding="clamp(1.75rem, 4vw, 2.75rem)"
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: mode === "dark" ? "#11131a" : "#ffffff",
          border:
            mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.09)"
              : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow:
            mode === "dark"
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.75)"
              : "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Brand Header */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "text.primary",
                  color: "background.surface",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                <ShieldCheck size={24} />
              </Box>
              <Box>
                <Typography variant="header" size="xs" bold>
                  Admin Console
                </Typography>
                <Typography
                  variant="caption"
                  size="xs"
                  color="secondary"
                  sx={{
                    fontFamily: "var(--font-code, monospace)",
                    letterSpacing: "0.06em",
                    fontSize: "0.72rem",
                  }}
                >
                  ADMINISTRATIVE ROLES ONLY
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="sm"
              variant="soft"
              color="danger"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                borderRadius: "6px",
              }}
            >
              ADMIN PRIVILEGES
            </Chip>
          </Stack>

          <Typography variant="body" size="sm" color="secondary" sx={{ mt: 0.5 }}>
            Restricted to administrative staff, managers, and authorized custom roles.
          </Typography>
        </Stack>

        {/* Regular User Callout Banner */}
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: "10px",
            bgcolor: mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            border:
              mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.06)"
                : "1px solid rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
          }}
        >
          <AlertTriangle size={17} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
          <Box>
            <Typography variant="body" size="xs" bold>
              Are you a regular user?
            </Typography>
            <Typography variant="caption" size="xs" color="secondary">
              Standard customer/user accounts cannot log in here. Please navigate to the{" "}
              <Link
                href="http://localhost:5174/login"
                sx={{
                  color: colors.accent,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                Client Portal <ExternalLink size={11} />
              </Link>
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            color="danger"
            variant="soft"
            sx={{
              mb: 2.5,
              borderRadius: "8px",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </Alert>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl required>
              <FormLabel
                sx={{
                  fontSize: "0.775rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                }}
              >
                Staff Account Email
              </FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<Mail size={16} />}
                placeholder="staff@example.com"
                sx={{
                  borderRadius: "8px",
                  py: 1.1,
                  fontSize: "0.9rem",
                  bgcolor: "background.surface",
                  border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                  "&:focus-within": {
                    borderColor: colors.accent,
                  },
                }}
              />
            </FormControl>

            <FormControl required>
              <FormLabel
                sx={{
                  fontSize: "0.775rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                }}
              >
                Access Password
              </FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startDecorator={<Lock size={16} />}
                placeholder="Enter password"
                sx={{
                  borderRadius: "8px",
                  py: 1.1,
                  fontSize: "0.9rem",
                  bgcolor: "background.surface",
                  border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                  "&:focus-within": {
                    borderColor: colors.accent,
                  },
                }}
              />
            </FormControl>

            <Button
              type="submit"
              variant="solid"
              colorScheme="primary"
              disabled={isLoading}
              endDecorator={<ArrowRight size={16} />}
              sx={{
                mt: 1,
                py: 1.25,
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {isLoading ? "Authenticating Staff..." : "Authorize Admin Sign In"}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography
            variant="caption"
            size="xs"
            color="secondary"
            sx={{
              fontFamily: "var(--font-code, monospace)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              px: 1,
            }}
          >
            Administrative Personas
          </Typography>
        </Divider>

        {/* Admin Personas */}
        <Stack spacing={1.25}>
          {adminAccounts.map((account) => {
            const primaryRole = (account.roles.find((r) => r !== "user") ||
              account.roles[0] ||
              "admin") as DemoAccountRole;
            const Icon = ROLE_ICONS[primaryRole] || ShieldCheck;
            const badgeText =
              ROLE_BADGE_TEXT[primaryRole] ||
              primaryRole.replace(/_/g, " ").toUpperCase();
            const isHovered = activeHoverRole === account.email;

            return (
              <Box
                key={account.email}
                onMouseEnter={() => setActiveHoverRole(account.email)}
                onMouseLeave={() => setActiveHoverRole(null)}
                onClick={() => !isLoading && handleQuickLogin(account.email)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: "0.85rem 1.15rem",
                  borderRadius: "10px",
                  cursor: isLoading ? "default" : "pointer",
                  bgcolor:
                    mode === "dark"
                      ? isHovered
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.02)"
                      : isHovered
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(0, 0, 0, 0.015)",
                  border: isHovered
                    ? `1px solid ${colors.accent}`
                    : `1px solid ${colors.cardBorder}`,
                  transition: "all 0.18s ease-in-out",
                  transform: isHovered ? "translateY(-1px)" : "none",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isHovered ? colors.accent : "neutral.softBg",
                      color: isHovered ? "#ffffff" : "text.secondary",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <Icon size={16} />
                  </Box>
                  <Box>
                    <Typography variant="body" size="xs" bold>
                      {account.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      size="xs"
                      color="secondary"
                      sx={{
                        fontFamily: "var(--font-code, monospace)",
                        fontSize: "0.725rem",
                        display: "block",
                      }}
                    >
                      {account.email}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    size="xs"
                    color="secondary"
                    sx={{
                      fontFamily: "var(--font-code, monospace)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.05em",
                      opacity: isHovered ? 1 : 0.7,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {badgeText}
                  </Typography>
                  <ChevronRight
                    size={16}
                    style={{
                      color: isHovered ? colors.accent : "gray",
                      transform: isHovered ? "translateX(2px)" : "none",
                      transition: "all 0.18s ease",
                    }}
                  />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}
