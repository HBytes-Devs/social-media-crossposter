import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import { useState, useEffect, type ReactNode, type ElementType } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { TokenExpiryBanner } from "./accounts/TokenExpiryBanner";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";
import { selectOnboarding } from "../store/slices/onboardingSlice";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useThemeMode } from "../theme/AppThemeProvider";
import { CyberOceanBackground } from "./cyber-ocean/CyberOceanBackground";

const DRAWER_EXPANDED = 280;
const DRAWER_COLLAPSED = 72;
const SIDEBAR_COLLAPSE_KEY = "smc-sidebar-collapsed";

const POSTING_PATH_PREFIXES = ["/compose", "/calendar", "/posts", "/accounts", "/posting"] as const;
const ANALYTICS_PATH_PREFIXES = [
  "/google-ads",
  "/linkedin-ads",
  "/meta-ads",
  "/linkedin-marketing",
  "/instagram",
] as const;
type NavIcon = ElementType;

const linkedInAnalyticsItems = [
  { to: "/linkedin-marketing", label: "Marketing", tourId: "nav-linkedin-marketing", Icon: WorkOutlinedIcon },
  { to: "/linkedin-ads", label: "Ads", tourId: "nav-linkedin-ads", Icon: CampaignOutlinedIcon },
] as const;

function isPostingPath(pathname: string) {
  return POSTING_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAnalyticsPath(pathname: string) {
  return ANALYTICS_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function WithTooltip({
  collapsed,
  title,
  children,
}: {
  collapsed: boolean;
  title: string;
  children: ReactNode;
}) {
  if (!collapsed) return <>{children}</>;
  return (
    <Tooltip
      title={title}
      placement="right"
      arrow
      enterDelay={120}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: (t) => (t.palette.mode === "dark" ? "#1B1F27" : "#FFFFFF"),
            color: (t) => (t.palette.mode === "dark" ? "#F5F7FA" : "#101828"),
            border: 1,
            borderColor: (t) => (t.palette.mode === "dark" ? "#2A303C" : "#E4E8F0"),
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.45)"
                : "0 8px 24px rgba(16,24,40,0.12)",
            fontSize: 13,
            fontWeight: 500,
            px: 1.25,
            py: 0.75,
          },
        },
        arrow: {
          sx: {
            color: (t) => (t.palette.mode === "dark" ? "#1B1F27" : "#FFFFFF"),
          },
        },
      }}
    >
      <Box component="span" sx={{ display: "block", width: "100%" }}>
        {children}
      </Box>
    </Tooltip>
  );
}

function navItemSx(active: boolean, collapsed: boolean, nested = false): SxProps<Theme> {
  return {
    position: "relative",
    borderRadius: collapsed ? 0 : 20,
    border: "1.5px solid",
    borderColor: active
      ? (t) => (t.palette.mode === "dark" ? "#5EEAD4" : "#0F766E")
      : "transparent",
    mb: collapsed ? 0.15 : 0.15,
    mx: collapsed ? 0 : nested ? 0.5 : 1,
    px: collapsed ? 0 : nested ? 1.25 : 1.5,
    py: collapsed ? 1.15 : nested ? 0.7 : 0.95,
    minHeight: collapsed ? 44 : nested ? 36 : 44,
    justifyContent: collapsed ? "center" : "flex-start",
    color: active ? "text.primary" : "text.secondary",
    bgcolor: active
      ? (t) =>
          t.palette.mode === "dark"
            ? "rgba(94, 234, 212, 0.10)"
            : "rgba(15, 118, 110, 0.08)"
      : "transparent",
    boxShadow: "none",
    transition:
      "border-color 0.18s ease, background-color 0.18s ease",
    "&:hover": {
      bgcolor: (t) =>
        t.palette.mode === "dark"
          ? active
            ? "rgba(94, 234, 212, 0.14)"
            : "rgba(255,255,255,0.05)"
          : active
            ? "rgba(15, 118, 110, 0.12)"
            : "rgba(16,24,40,0.035)",
      color: "text.primary",
    },
    "&.Mui-selected": {
      bgcolor: (t) =>
        t.palette.mode === "dark"
          ? "rgba(94, 234, 212, 0.10)"
          : "rgba(15, 118, 110, 0.08)",
      color: "text.primary",
      "&:hover": {
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(94, 234, 212, 0.14)"
            : "rgba(15, 118, 110, 0.12)",
      },
    },
  };
}

function NavRow({
  to,
  end,
  label,
  Icon,
  active,
  collapsed,
  nested,
  onNavigate,
  tourId,
  trailing,
}: {
  to?: string;
  end?: boolean;
  label: string;
  Icon: NavIcon;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
  onNavigate?: () => void;
  tourId?: string;
  trailing?: ReactNode;
}) {
  if (collapsed && nested) return null;

  const button = (
    <ListItemButton
      component={to ? NavLink : "button"}
      to={to}
      end={end}
      selected={active}
      onClick={onNavigate}
      data-tour={tourId}
      sx={navItemSx(active, collapsed, nested)}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 36,
          justifyContent: "center",
          color: active
            ? "text.primary"
            : (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.72)" : "text.secondary"),
        }}
      >
        <Icon sx={{ fontSize: collapsed ? 22 : nested ? 18 : 20 }} />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: {
                fontSize: nested ? 13 : 14,
                fontWeight: active ? 600 : 500,
                letterSpacing: -0.1,
              },
            },
          }}
        />
      )}
      {!collapsed && trailing}
    </ListItemButton>
  );

  return (
    <WithTooltip collapsed={collapsed} title={label}>
      {button}
    </WithTooltip>
  );
}

function SidebarBrand({
  collapsed,
  onToggleCollapse,
  showCollapseToggle,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}) {
  return (
    <Box
      sx={{
        px: collapsed ? 0 : 2,
        pt: collapsed ? 1.5 : 1.5,
        pb: collapsed ? 0.5 : 1,
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: collapsed ? 0.75 : 1,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: collapsed ? 40 : 40,
            height: collapsed ? 40 : 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            bgcolor: (t) =>
              t.palette.mode === "dark" ? "rgba(94, 234, 212, 0.15)" : "rgba(15, 118, 110, 0.12)",
            color: (t) => (t.palette.mode === "dark" ? "#5EEAD4" : "#0F766E"),
            boxShadow: (t) =>
              t.palette.mode === "dark" ? "inset 0 0 0 1px rgba(94, 234, 212, 0.22)" : "none",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 19 }} />
        </Box>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                lineHeight: 1.2,
                letterSpacing: -0.2,
                color: "text.primary",
              }}
            >
              SMC
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.3,
                mt: 0.15,
              }}
            >
              Social crossposter
            </Typography>
          </Box>
        )}
      </Box>

      {showCollapseToggle && onToggleCollapse && (
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          sx={{
            width: collapsed ? 26 : 28,
            height: collapsed ? 26 : 28,
            color: "text.secondary",
            "&:hover": {
              bgcolor: (t) =>
                t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(16,24,40,0.05)",
            },
          }}
        >
          {collapsed ? (
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      )}
    </Box>
  );
}

function SidebarContent({
  onNavigate,
  collapsed,
  onToggleCollapse,
  showCollapseToggle,
}: {
  onNavigate?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector(selectAuth);
  const location = useLocation();
  const onPosting = isPostingPath(location.pathname);
  const onAnalytics = isAnalyticsPath(location.pathname);
  const onLinkedInAnalytics =
    location.pathname === "/linkedin-marketing" || location.pathname === "/linkedin-ads";

  const [analyticsOpen, setAnalyticsOpen] = useState(onAnalytics);
  const [linkedInOpen, setLinkedInOpen] = useState(onLinkedInAnalytics);

  useEffect(() => {
    if (onAnalytics) setAnalyticsOpen(true);
  }, [onAnalytics]);
  useEffect(() => {
    if (onLinkedInAnalytics) setLinkedInOpen(true);
  }, [onLinkedInAnalytics]);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SidebarBrand
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showCollapseToggle={showCollapseToggle}
      />

      <List
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          px: collapsed ? 0 : 0.5,
          py: collapsed ? 0.5 : 0.75,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 999,
            bgcolor: (t) =>
              t.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(16,24,40,0.15)",
          },
        }}
      >
        <NavRow
          to="/"
          end
          label="Dashboard"
          Icon={DashboardOutlinedIcon}
          active={location.pathname === "/"}
          collapsed={collapsed}
          onNavigate={onNavigate}
          tourId="nav-dashboard"
        />

        <NavRow
          to="/posting"
          label="Posting"
          Icon={EditNoteOutlinedIcon}
          active={location.pathname === "/posting" || onPosting}
          collapsed={collapsed}
          onNavigate={onNavigate}
          tourId="nav-compose"
        />

        {collapsed ? (
          <NavRow
            to="/meta-ads"
            label="Analytics"
            Icon={InsightsOutlinedIcon}
            active={onAnalytics}
            collapsed
            onNavigate={onNavigate}
            tourId="nav-meta-ads"
          />
        ) : (
          <>
            <ListItemButton
              onClick={() => setAnalyticsOpen((v) => !v)}
              selected={onAnalytics && !analyticsOpen}
              sx={navItemSx(onAnalytics && !analyticsOpen, false)}
            >
              <ListItemIcon sx={{ minWidth: 36, color: onAnalytics ? "text.primary" : "text.secondary" }}>
                <InsightsOutlinedIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Analytics"
                slotProps={{
                  primary: { sx: { fontSize: 14, fontWeight: onAnalytics ? 600 : 500 } },
                }}
              />
              {analyticsOpen ? (
                <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
              )}
            </ListItemButton>
            <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                <NavRow
                  to="/meta-ads"
                  end
                  label="Meta Ads"
                  Icon={CampaignOutlinedIcon}
                  active={location.pathname === "/meta-ads"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-meta-ads"
                />
                <ListItemButton
                  onClick={() => setLinkedInOpen((v) => !v)}
                  selected={onLinkedInAnalytics && !linkedInOpen}
                  sx={navItemSx(onLinkedInAnalytics && !linkedInOpen, false, true)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                    <LinkedInIcon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="LinkedIn"
                    slotProps={{
                      primary: { sx: { fontSize: 13, fontWeight: onLinkedInAnalytics ? 600 : 500 } },
                    }}
                  />
                  {linkedInOpen ? (
                    <ExpandLess sx={{ fontSize: 16, color: "text.secondary" }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 16, color: "text.secondary" }} />
                  )}
                </ListItemButton>
                <Collapse in={linkedInOpen} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {linkedInAnalyticsItems.map((item) => (
                      <NavRow
                        key={item.to}
                        to={item.to}
                        end
                        label={item.label}
                        Icon={item.Icon}
                        active={location.pathname === item.to}
                        collapsed={false}
                        nested
                        onNavigate={onNavigate}
                        tourId={item.tourId}
                      />
                    ))}
                  </List>
                </Collapse>
                <NavRow
                  to="/google-ads"
                  end
                  label="Google Ads"
                  Icon={BarChartOutlinedIcon}
                  active={location.pathname === "/google-ads"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-google-ads"
                />
                <NavRow
                  to="/instagram"
                  end
                  label="Instagram"
                  Icon={PhotoCameraOutlinedIcon}
                  active={location.pathname === "/instagram"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-instagram"
                />
              </List>
            </Collapse>
          </>
        )}

        <Divider
          sx={{
            my: collapsed ? 1.25 : 1.5,
            mx: collapsed ? 2.25 : 2.25,
            borderColor: (t) => (t.palette.mode === "dark" ? "#2A303C" : "#ECEFF3"),
          }}
        />

        <NavRow
          to="/settings"
          end
          label="Settings"
          Icon={SettingsOutlinedIcon}
          active={location.pathname === "/settings"}
          collapsed={collapsed}
          onNavigate={onNavigate}
          tourId="nav-settings"
        />
        {user?.role === "ADMIN" && (
          <NavRow
            to="/admin"
            end
            label="Admin"
            Icon={AdminPanelSettingsOutlinedIcon}
            active={location.pathname === "/admin" || location.pathname.startsWith("/admin/")}
            collapsed={collapsed}
            onNavigate={onNavigate}
            tourId="nav-admin"
          />
        )}
      </List>

      <Box
        sx={{
          px: collapsed ? 0.75 : 1.5,
          pb: collapsed ? 1.75 : 1.5,
          pt: collapsed ? 1 : 0.75,
          flexShrink: 0,
          mt: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "center",
            gap: collapsed ? 1.35 : 1.1,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0.5 : 1,
            py: collapsed ? 0.5 : 0.85,
            borderRadius: "10px",
            border: "1px solid",
            borderColor: (t) => (t.palette.mode === "dark" ? "#2A303C" : "#E7EAF0"),
            bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "#F8F9FC"),
            transition: "background-color 0.18s ease, border-color 0.18s ease",
          }}
        >
          <WithTooltip collapsed={collapsed} title={displayName}>
            <Avatar
              sx={{
                width: collapsed ? 36 : 36,
                height: collapsed ? 36 : 36,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: theme.palette.mode === "dark" ? "#10302B" : "#E0F2F1",
                color: theme.palette.mode === "dark" ? "#5EEAD4" : "#0F766E",
              }}
            >
              {initials || "U"}
            </Avatar>
          </WithTooltip>

          {!collapsed && (
            <>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  noWrap
                  sx={{ fontSize: 13.5, fontWeight: 650, color: "text.primary", lineHeight: 1.25 }}
                >
                  {displayName}
                </Typography>
                <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.3 }}>
                  {user?.email}
                </Typography>
              </Box>
              <ThemeToggle size="small" />
              <IconButton
                size="small"
                aria-label="Logout"
                onClick={() => dispatch(logout())}
                sx={{ color: "text.secondary", width: 30, height: 30 }}
              >
                <LogoutRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </>
          )}

          {collapsed && (
            <>
              <Box sx={{ color: "text.secondary", "& .MuiIconButton-root": { color: "inherit" } }}>
                <ThemeToggle size="small" />
              </Box>
              <WithTooltip collapsed title="Logout">
                <IconButton
                  size="small"
                  aria-label="Logout"
                  onClick={() => dispatch(logout())}
                  sx={{ color: "text.secondary", width: 34, height: 34 }}
                >
                  <LogoutRoundedIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </WithTooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function sidebarPaperSx(width: number, collapsed: boolean): SxProps<Theme> {
  return {
    width,
    height: "100%",
    maxHeight: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    borderRadius: {
      xs: 0,
      md: collapsed ? "999px" : "16px",
    },
    border: 1,
    borderColor: (t) => (t.palette.mode === "dark" ? "#2A303C" : "#E7EAF0"),
    bgcolor: (t) => (t.palette.mode === "dark" ? "#161A22" : "#FFFFFF"),
    boxShadow: (t) =>
      t.palette.mode === "dark"
        ? "0 12px 40px rgba(0,0,0,0.4)"
        : "0 12px 40px rgba(16,24,40,0.08)",
    overflow: "hidden",
    transition: (t) =>
      t.transitions.create(["width", "border-radius"], {
        easing: t.transitions.easing.sharp,
        duration: t.transitions.duration.shorter,
      }),
  };
}

export function Layout() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsedPreference);
  const { tourActive } = useAppSelector(selectOnboarding);

  useEffect(() => {
    if (tourActive && !isDesktop) setMobileOpen(true);
  }, [tourActive, isDesktop]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed]);

  const closeMobile = () => setMobileOpen(false);
  const isCollapsedDesktop = Boolean(isDesktop && collapsed);
  const drawerWidth = isCollapsedDesktop ? DRAWER_COLLAPSED : DRAWER_EXPANDED;
  const asidePad = isCollapsedDesktop ? 10 : 12;
  const asideWidth = isDesktop ? drawerWidth + asidePad * 2 : 0;

  const sidebar = (
    <Paper elevation={0} sx={sidebarPaperSx(drawerWidth, isCollapsedDesktop)}>
      <SidebarContent
        onNavigate={closeMobile}
        collapsed={isCollapsedDesktop}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        showCollapseToggle={isDesktop}
      />
    </Paper>
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        bgcolor: isDark ? "#0B0D12" : "#F5F6FA",
        transition: "background-color 0.25s ease",
      }}
    >
      {/* Teal-tinted ambient gradient — mirrors the auth form-panel lighting */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: isDark
            ? `
              radial-gradient(900px 520px at 8% -10%, rgba(94, 234, 212, 0.08), transparent 55%),
              radial-gradient(700px 480px at 100% 30%, rgba(45, 212, 191, 0.06), transparent 50%),
              radial-gradient(800px 500px at 50% 110%, rgba(15, 118, 110, 0.08), transparent 55%)
            `
            : `
              radial-gradient(900px 520px at 8% -10%, rgba(45, 212, 191, 0.10), transparent 55%),
              radial-gradient(700px 480px at 100% 30%, rgba(125, 211, 252, 0.08), transparent 50%),
              radial-gradient(800px 500px at 50% 110%, rgba(94, 234, 212, 0.10), transparent 55%)
            `,
        }}
      />

      {isDark && (
        <Box aria-hidden sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <CyberOceanBackground
            showDolphin={false}
            interactive={false}
            pointerEvents="none"
            seabedParticles={140_000}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 30% 20%, transparent 0%, rgba(11,13,18,0.45) 70%, rgba(11,13,18,0.72) 100%)",
            }}
          />
        </Box>
      )}

      <OnboardingFlow />

      {!isDesktop && (
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: isDark ? "#2A303C" : "#E7EAF0",
            bgcolor: isDark ? "#161A22" : "#FFFFFF",
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ ml: 1, flex: 1 }}>
              SMC
            </Typography>
            <ThemeToggle size="small" />
          </Toolbar>
        </AppBar>
      )}

      {isDesktop ? (
        <Box
          component="aside"
          sx={{
            width: asideWidth,
            flexShrink: 0,
            height: "100vh",
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            p: `${asidePad}px`,
            boxSizing: "border-box",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            transition: (t) =>
              t.transitions.create("width", {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.shorter,
              }),
          }}
        >
          {sidebar}
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_EXPANDED + 20,
              height: "100%",
              boxSizing: "border-box",
              bgcolor: "transparent",
              border: 0,
              p: 1.25,
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          pt: { xs: 7, md: 0 },
          position: "relative",
          zIndex: 1,
          bgcolor: "transparent",
          overflow: "hidden",
        }}
      >
        <TokenExpiryBanner />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2, lg: 2.5 },
            color: isDark ? "#F5F7FA" : "#0F172A",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
