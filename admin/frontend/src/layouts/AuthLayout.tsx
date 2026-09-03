import type { FC } from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import { Box, Stack, IconButton, Link } from "@mui/joy";
import { Sun, Moon, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import Typography from "../components/ui/Typography";

export const AuthLayout: FC = () => {
  const { mode, setMode } = useThemeColors();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: mode === "dark" ? "#0b0d11" : "#f8fafc",
        color: mode === "dark" ? "#f1f5f9" : "#0f172a",
        position: "relative",
      }}
    >
      {/* Top Navbar */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: { xs: 2, sm: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom:
            mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(0, 0, 0, 0.06)",
          bgcolor: mode === "dark" ? "rgba(17, 19, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.9rem",
              "&:hover": { color: "primary.main" },
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              height: 16,
              width: "1px",
              bgcolor: "divider",
            }}
          />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", sm: "flex" } }}>
            <ShieldCheck size={16} />
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "var(--font-code, monospace)",
                fontSize: "0.72rem",
              }}
            >
              ADMINISTRATION CONSOLE
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Link to Client App */}
          <Link
            href="http://localhost:5174/login"
            underline="none"
            sx={{
              fontSize: "0.82rem",
              color: "text.secondary",
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.6,
              borderRadius: "6px",
              border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
              "&:hover": {
                color: "text.primary",
                borderColor: "primary.outlinedBorder",
              },
            }}
          >
            Client Portal
            <ExternalLink size={13} />
          </Link>

          {/* Theme Toggle */}
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            title="Toggle color mode"
            sx={{
              borderRadius: "8px",
              minHeight: 36,
              minWidth: 36,
              border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
            }}
          >
            {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          textAlign: "center",
          borderTop:
            mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        <Typography variant="caption" size="xs" color="secondary">
          Administrative Console &bull; Restricted to Super Admin, Admin, and Manager personas &bull; Regular users access port 5174
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
