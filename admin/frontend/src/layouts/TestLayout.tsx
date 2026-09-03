import { useState, type FC } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  IconButton,
  Sheet,
  Drawer,
} from "@mui/joy";
import {
  ShieldCheck,
  Menu,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Typography from "../components/ui/Typography";
import Sidebar from "../components/ui/Sidebar";
import { useThemeColors } from "../hooks/useThemeColors";

export const AppLayout: FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { mode, setMode, colors } = useThemeColors();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItemNames: Record<string, string> = {
    "/test": "Dashboard",
    "/test/": "Dashboard",
    "/test/testpad": "RBAC Development Test Portal",
    "/test/test": "RBAC Development Test Portal",
    "/test/users": "User Access Directory",
    "/test/roles": "Access Control Matrix",
    "/test/settings": "System Settings",
  };

  const currentTitle = navItemNames[location.pathname] || "Workspace";
  const primaryRole = user?.roles?.[0] || "user";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: colors.dominant,
      }}
    >
      {/* 1. Desktop Persistent Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Sidebar />
      </Box>

      {/* 2. Mobile Header Bar & Drawer */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
        }}
      >
        <Sheet
          variant="plain"
          sx={{
            height: 56,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backdropFilter: "blur(12px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(13, 16, 23, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            borderBottom:
              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </IconButton>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "6px",
                  bgcolor: "text.primary",
                  color: "background.surface",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={16} />
              </Box>
              <Typography variant="body" size="xs" bold>
                RBAC Core
              </Typography>
            </Stack>
          </Stack>

          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </Sheet>
      </Box>

      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        size="sm"
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Sidebar
          isMobile
          closeMobileSidebar={() => setMobileMenuOpen(false)}
        />
      </Drawer>

      {/* 3. Main Content Column */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          mt: { xs: "56px", md: 0 },
        }}
      >
        {/* Top Status & Breadcrumb Strip */}
        <Box
          sx={{
            px: { xs: 2, md: 3, lg: 4 },
            py: 1,
            bgcolor: colors.surface,
            borderBottom: `1px solid ${colors.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.775rem",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" size="xs" color="secondary">
              System Workspace
            </Typography>
            <ChevronRight size={12} style={{ opacity: 0.4 }} />
            <Typography variant="body" size="xs" bold>
              {currentTitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: colors.accent,
              }}
            />
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{
                fontFamily: "var(--font-code, monospace)",
                fontSize: "0.72rem",
                display: { xs: "none", sm: "inline" },
              }}
            >
              {user?.email} &bull; [
              <span style={{ color: colors.accent, fontWeight: 700 }}>
                {primaryRole.toUpperCase()}
              </span>
              ]
            </Typography>
          </Stack>
        </Box>

        {/* Page Content Body */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3, lg: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
