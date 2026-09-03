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
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  ChevronRight,
  User,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";

export default function LoginPage() {
  const { login, quickLogin, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, colors } = useThemeColors();

  // Regular user default credentials for instant client access
  const [email, setEmail] = useState<string>("user@example.com");
  const [password, setPassword] = useState<string>("Password123!");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHoveredPersona, setIsHoveredPersona] = useState<boolean>(false);

  const destination =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/test";

  // Filter demo accounts strictly for regular user role
  const clientAccounts = demoAccounts.filter(
    (acc) =>
      acc.roles.includes("user") &&
      !acc.roles.some((r) => ["super_admin", "admin", "manager"].includes(r))
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
        err instanceof Error ? err.message : "Invalid login credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (identifier: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await quickLogin(identifier);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to authenticate client demo account."
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
          maxWidth: "480px",
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
                  bgcolor: colors.accent,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(24, 94, 224, 0.25)",
                }}
              >
                <UserCheck size={24} />
              </Box>
              <Box>
                <Typography variant="header" size="xs" bold>
                  Client Portal
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
                  REGULAR USER ACCESS
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="sm"
              variant="soft"
              color="success"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                borderRadius: "6px",
              }}
            >
              CLIENT ONLY
            </Chip>
          </Stack>

          <Typography variant="body" size="sm" color="secondary" sx={{ mt: 0.5 }}>
            Sign in with your regular user account to access client services and personal dashboard.
          </Typography>
        </Stack>

        {/* Portal Notice Banner */}
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
          <AlertCircle size={17} style={{ color: colors.accent, flexShrink: 0, marginTop: 2 }} />
          <Box>
            <Typography variant="body" size="xs" bold>
              Regular Users Only
            </Typography>
            <Typography variant="caption" size="xs" color="secondary">
              Admin, Manager & Super Admin roles must authenticate via the{" "}
              <Link
                href="http://localhost:5173/login"
                sx={{
                  color: colors.accent,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                Admin Portal <ExternalLink size={11} />
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
                User Email
              </FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<Mail size={16} />}
                placeholder="user@example.com"
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
                Password
              </FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startDecorator={<Lock size={16} />}
                placeholder="Enter your password"
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
              {isLoading ? "Signing in..." : "Sign In to Client Portal"}
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
            Sample Regular User Persona
          </Typography>
        </Divider>

        {/* Regular User One-Click Persona */}
        <Stack spacing={1.25}>
          {clientAccounts.length > 0 ? (
            clientAccounts.map((account) => (
              <Box
                key={account.email}
                onMouseEnter={() => setIsHoveredPersona(true)}
                onMouseLeave={() => setIsHoveredPersona(false)}
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
                      ? isHoveredPersona
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.02)"
                      : isHoveredPersona
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(0, 0, 0, 0.015)",
                  border: isHoveredPersona
                    ? `1px solid ${colors.accent}`
                    : `1px solid ${colors.cardBorder}`,
                  transition: "all 0.18s ease-in-out",
                  transform: isHoveredPersona ? "translateY(-1px)" : "none",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isHoveredPersona ? colors.accent : "neutral.softBg",
                      color: isHoveredPersona ? "#ffffff" : "text.secondary",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <User size={18} />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body" size="xs" bold>
                        {account.first_name} {account.last_name}
                      </Typography>
                      <Chip size="sm" variant="soft" color="neutral" sx={{ fontSize: "0.65rem", py: 0 }}>
                        USER
                      </Chip>
                    </Stack>
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
                  <Sparkles size={14} style={{ color: colors.accent, opacity: isHoveredPersona ? 1 : 0.5 }} />
                  <ChevronRight
                    size={16}
                    style={{
                      color: isHoveredPersona ? colors.accent : "gray",
                      transform: isHoveredPersona ? "translateX(2px)" : "none",
                      transition: "all 0.18s ease",
                    }}
                  />
                </Stack>
              </Box>
            ))
          ) : (
            // Fallback user card if demo accounts are loading
            <Box
              onClick={() => !isLoading && handleQuickLogin("user@example.com")}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: "0.85rem 1.15rem",
                borderRadius: "10px",
                cursor: "pointer",
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "neutral.softBg",
                    color: "text.secondary",
                  }}
                >
                  <User size={18} />
                </Box>
                <Box>
                  <Typography variant="body" size="xs" bold>
                    Elena Rostova
                  </Typography>
                  <Typography variant="caption" size="xs" color="secondary">
                    user@example.com
                  </Typography>
                </Box>
              </Stack>
              <ChevronRight size={16} />
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
