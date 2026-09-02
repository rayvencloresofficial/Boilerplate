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
  IconButton,
} from "@mui/joy";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  Key,
  Users,
  User,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import type { DemoAccountRole } from "../../../constants/demoCredentials";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";

const ROLE_ICONS: Record<DemoAccountRole, typeof Shield> = {
  super_admin: Shield,
  admin: Key,
  manager: Users,
  user: User,
};

const ROLE_BADGE_TEXT: Record<DemoAccountRole, string> = {
  super_admin: "FULL ROOT ACCESS",
  admin: "SYSTEM CONSOLE",
  manager: "OPERATIONS",
  user: "STANDARD ACCESS",
};

export default function LoginPage() {
  const { login, quickLogin, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode, colors } = useThemeColors();

  const [email, setEmail] = useState<string>("superadmin@example.com");
  const [password, setPassword] = useState<string>("Password123!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHoverRole, setActiveHoverRole] = useState<string | null>(null);

  const destination =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/test";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid login credentials.",
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
          : "Failed to authenticate demo account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Top right theme toggle */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          title="Toggle color mode"
          sx={{
            borderRadius: "8px",
            border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
          }}
        >
          {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>
      </Box>

      {/* Main Login Card using local Container */}
      <Container
        elevation={2}
        radius="14px"
        padding="clamp(1.75rem, 3.5vw, 2.75rem)"
        style={{
          maxWidth: "520px",
          width: "100%",
          zIndex: 1,
          backgroundColor:
            mode === "dark" ? "#11131a" : "#ffffff",
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
        <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: "left" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "10px",
                bgcolor: "text.primary",
                color: "background.surface",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={24} />
            </Box>
            <Box>
              <Typography variant="header" size="xs" bold>
                RBAC Core
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
                ENTERPRISE ACCESS ENGINE
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body" size="sm" color="secondary" sx={{ mt: 0.5 }}>
            Authenticate with system credentials or choose a pre-configured verification identity below.
          </Typography>
        </Stack>

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
                Account Email
              </FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<Mail size={16} />}
                placeholder="identity@example.com"
                sx={{
                  borderRadius: "8px",
                  py: 1.1,
                  fontSize: "0.9rem",
                  bgcolor: "background.surface",
                  border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                  "&:focus-within": {
                    borderColor: "var(--color-primary, #185ee0)",
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
                    borderColor: "var(--color-primary, #185ee0)",
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
              {isLoading ? "Authenticating Identity..." : "Authorize & Sign In"}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3.5 }}>
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
            One-Click Persona Logins
          </Typography>
        </Divider>

        {/* Interactive Persona Cards - Monochromatic with crisp primary hover */}
        <Stack spacing={1.25}>
          {demoAccounts.map((account) => {
            const primaryRole = (account.roles[0] || "user") as DemoAccountRole;
            const Icon = ROLE_ICONS[primaryRole] || ROLE_ICONS.user;
            const badgeText = ROLE_BADGE_TEXT[primaryRole] || `${account.permissions.length} PERMS`;
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
                  borderRadius: "8px",
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
                  transform: isHovered ? "translateX(3px)" : "none",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "6px",
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
                      color: isHovered ? "var(--color-primary, #185ee0)" : "gray",
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
