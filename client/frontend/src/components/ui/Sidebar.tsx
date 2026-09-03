import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Select,
  Option,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
} from "@mui/joy";
import {
  ShieldCheck,
  Users,
  KeyRound,
  LogOut,
  Sun,
  Moon,
  FlaskConical,
  ChevronDown,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { DemoAccountRole } from "../../constants/demoCredentials";

interface SidebarProps {
  isMobile?: boolean;
  closeMobileSidebar?: () => void;
}

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  requiredPermission?: string;
  requiredRole?: string;
  children?: {
    title: string;
    path: string;
    icon: React.ReactNode;
    requiredPermission?: string;
    requiredRole?: string;
  }[];
};

const TEST_MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/test",
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: "RBAC Test Portal",
    path: "/test/testpad",
    icon: <FlaskConical size={18} />,
    badge: "DEV",
  },

  {
    title: "Access Control",
    icon: <ShieldCheck size={18} />,
    children: [
      {
        title: "User Directory",
        path: "/test/users",
        icon: <Users size={16} />,
        requiredPermission: "users:read",
      },
      {
        title: "Access Matrix",
        path: "/test/roles",
        icon: <KeyRound size={16} />,
        requiredPermission: "roles:read",
      },
    ],
  },
  {
    title: "System Settings",
    path: "/test/settings",
    icon: <Settings size={18} />,
    requiredPermission: "settings:read",
  },
];

export default function Sidebar({
  isMobile = false,
  closeMobileSidebar,
}: SidebarProps) {
  const { user, logout, quickLogin, demoAccounts } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, colors } = useThemeColors();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Access Control": true,
  });

  const getPrimaryRole = (): DemoAccountRole => {
    if (user?.roles?.includes("super_admin")) return "super_admin";
    if (user?.roles?.includes("admin")) return "admin";
    if (user?.roles?.includes("manager")) return "manager";
    return "user";
  };

  const primaryRole = getPrimaryRole();

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const userPerms = user?.permissions ?? [];
  const isSuperAdmin = user?.roles?.includes("super_admin");

  const filteredMenuItems = TEST_MENU_ITEMS.map((item) => {
    if (isSuperAdmin) return item;

    if (item.children) {
      const allowedChildren = item.children.filter((child) => {
        if (child.requiredRole && !user?.roles?.includes(child.requiredRole)) {
          return false;
        }
        if (
          child.requiredPermission &&
          !userPerms.includes(child.requiredPermission)
        ) {
          return false;
        }
        return true;
      });

      if (allowedChildren.length === 0) return null;
      return { ...item, children: allowedChildren };
    }

    if (item.requiredRole && !user?.roles?.includes(item.requiredRole)) {
      return null;
    }
    if (
      item.requiredPermission &&
      !userPerms.includes(item.requiredPermission)
    ) {
      return null;
    }

    return item;
  }).filter(Boolean) as MenuItem[];

  const userInitials =
    user?.first_name || user?.last_name
      ? `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase()
      : "U";

  const handleLogout = async () => {
    await logout();
    closeMobileSidebar?.();
    navigate("/test/login");
  };

  return (
    <Sheet
      sx={{
        width: isMobile ? "100%" : 260,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: isMobile ? "static" : "sticky",
        top: 0,
        zIndex: isMobile ? "auto" : 1000,
        bgcolor: colors.surface,
        borderRight: `1px solid ${colors.cardBorder}`,
        p: 2,
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Brand Logo Header */}
      <Box
        onClick={() => {
          navigate("/test");
          closeMobileSidebar?.();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          cursor: "pointer",
          userSelect: "none",
          pb: 2,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "8px",
            bgcolor: "text.primary",
            color: "background.surface",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            level="title-sm"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            RBAC Core
          </Typography>
          <Typography
            level="body-xs"
            sx={{
              fontFamily: "var(--font-code, monospace)",
              fontSize: "0.68rem",
              color: "text.tertiary",
              letterSpacing: "0.05em",
            }}
          >
            SYS/ENG WORKSPACE
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 2. Active Identity Quick-Switcher */}
      <Box sx={{ mb: 2 }}>
        <Typography
          level="body-xs"
          sx={{
            fontFamily: "var(--font-code, monospace)",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
            mb: 0.75,
            fontWeight: 600,
          }}
        >
          Active Identity Persona
        </Typography>
        <Select
          size="sm"
          value={user?.email || (demoAccounts[0]?.email ?? primaryRole)}
          onChange={(_e, val) => val && quickLogin(val)}
          sx={{
            width: "100%",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            border:
              "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
          }}
        >
          {demoAccounts.map((account) => (
            <Option key={account.email} value={account.email}>
              {account.title} ({account.email.split("@")[0]})
            </Option>
          ))}
        </Select>
      </Box>

      {/* 3. Navigation Links List */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        <Typography
          level="body-xs"
          sx={{
            fontFamily: "var(--font-code, monospace)",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
            mb: 1,
            fontWeight: 600,
          }}
        >
          Navigation
        </Typography>

        <List
          size="sm"
          sx={{ "--ListItem-radius": "6px", "--List-gap": "4px" }}
        >
          {filteredMenuItems.map((item) => {
            if (item.children) {
              const isGroupOpen = !!openGroups[item.title];
              const hasActiveChild = item.children.some(
                (c) => location.pathname === c.path,
              );

              return (
                <ListItem key={item.title} nested>
                  <ListItemButton
                    onClick={() => toggleGroup(item.title)}
                    selected={hasActiveChild && !isGroupOpen}
                    sx={{
                      borderRadius: "6px",
                      py: 0.85,
                      fontWeight: 600,
                      fontSize: "0.825rem",
                      "&.Mui-selected, &.Mui-selected:hover": {
                        bgcolor: `${colors.accent}1f !important`,
                        color: `${colors.accent} !important`,
                        "& .MuiListItemDecorator-root": {
                          color: `${colors.accent} !important`,
                        },
                      },
                    }}
                  >
                    <ListItemDecorator sx={{ color: "text.secondary" }}>
                      {item.icon}
                    </ListItemDecorator>
                    <ListItemContent>{item.title}</ListItemContent>
                    <ChevronDown
                      size={15}
                      style={{
                        transform: isGroupOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                        opacity: 0.6,
                      }}
                    />
                  </ListItemButton>

                  {isGroupOpen && (
                    <List
                      size="sm"
                      sx={{ pl: 2, pt: 0.5, "--List-gap": "3px" }}
                    >
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;

                        return (
                          <ListItem key={child.title}>
                            <ListItemButton
                              component={Link}
                              to={child.path}
                              selected={isChildActive}
                              color={isChildActive ? "primary" : "neutral"}
                              variant={isChildActive ? "solid" : "plain"}
                              onClick={() => closeMobileSidebar?.()}
                              sx={{
                                borderRadius: "6px",
                                py: 0.75,
                                fontSize: "0.8rem",
                                fontWeight: isChildActive ? 700 : 500,
                                bgcolor: isChildActive
                                  ? `${colors.accent} !important`
                                  : "transparent",
                                color: isChildActive
                                  ? "#ffffff !important"
                                  : "inherit",
                                "&.Mui-selected, &.Mui-selected:hover": {
                                  bgcolor: `${colors.accent} !important`,
                                  color: "#ffffff !important",
                                  "& .MuiListItemDecorator-root": {
                                    color: "#ffffff !important",
                                  },
                                },
                                "&:hover": {
                                  bgcolor: isChildActive
                                    ? `${colors.accent} !important`
                                    : undefined,
                                },
                              }}
                            >
                              <ListItemDecorator
                                sx={{
                                  color: isChildActive
                                    ? "#ffffff !important"
                                    : "text.secondary",
                                }}
                              >
                                {child.icon}
                              </ListItemDecorator>
                              <ListItemContent
                                sx={{
                                  color: isChildActive
                                    ? "#ffffff !important"
                                    : "inherit",
                                }}
                              >
                                {child.title}
                              </ListItemContent>
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </ListItem>
              );
            }

            const isActive =
              item.path === "/test"
                ? location.pathname === "/test" ||
                  location.pathname === "/test/"
                : location.pathname === item.path;

            return (
              <ListItem key={item.title}>
                <ListItemButton
                  component={Link}
                  to={item.path!}
                  selected={isActive}
                  color={isActive ? "primary" : "neutral"}
                  variant={isActive ? "solid" : "plain"}
                  onClick={() => closeMobileSidebar?.()}
                  sx={{
                    borderRadius: "6px",
                    py: 0.85,
                    fontSize: "0.825rem",
                    fontWeight: isActive ? 700 : 500,
                    bgcolor: isActive
                      ? `${colors.accent} !important`
                      : "transparent",
                    color: isActive ? "#ffffff !important" : "inherit",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: `${colors.accent} !important`,
                      color: "#ffffff !important",
                      "& .MuiListItemDecorator-root": {
                        color: "#ffffff !important",
                      },
                    },
                    "&:hover": {
                      bgcolor: isActive
                        ? `${colors.accent} !important`
                        : undefined,
                    },
                  }}
                >
                  <ListItemDecorator
                    sx={{
                      color: isActive ? "#ffffff !important" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemDecorator>
                  <ListItemContent
                    sx={{ color: isActive ? "#ffffff !important" : "inherit" }}
                  >
                    {item.title}
                  </ListItemContent>
                  {item.badge && (
                    <Box
                      sx={{
                        fontSize: "0.62rem",
                        fontFamily: "var(--font-code, monospace)",
                        fontWeight: 700,
                        px: 0.6,
                        py: 0.15,
                        borderRadius: "4px",
                        bgcolor: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : `${colors.accent}18`,
                        color: isActive ? "#ffffff" : colors.accent,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* 4. Footer User Profile & Actions */}
      <Box
        sx={{
          pt: 1.5,
          mt: "auto",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ mb: 1.5 }}
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
            {userInitials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              level="title-sm"
              noWrap
              sx={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography
              level="body-xs"
              noWrap
              sx={{
                fontSize: "0.68rem",
                fontFamily: "var(--font-code, monospace)",
                color: "text.tertiary",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            title="Toggle theme mode"
            sx={{ borderRadius: "6px", flex: 1 }}
          >
            {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <Typography level="body-xs" sx={{ ml: 0.75 }}>
              {mode === "dark" ? "Light" : "Dark"}
            </Typography>
          </IconButton>

          <IconButton
            size="sm"
            variant="outlined"
            color="danger"
            onClick={handleLogout}
            title="Sign out of workspace"
            sx={{ borderRadius: "6px", flex: 1 }}
          >
            <LogOut size={15} />
            <Typography level="body-xs" sx={{ ml: 0.75, color: "inherit" }}>
              Logout
            </Typography>
          </IconButton>
        </Stack>
      </Box>
    </Sheet>
  );
}
