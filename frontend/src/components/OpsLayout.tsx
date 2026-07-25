import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/ThemeToggle";
import { UiLanguageSelect } from "./ui/UiLanguageSelect";
import { OpsStatusChip, opsFonts } from "./ops/OpsUi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";
import { useAppTokens } from "../theme/AppThemeProvider";

const DRAWER_WIDTH = 268;

type NavItem = { to: string; label: string; end?: boolean; icon: ReactNode };
type NavSection = { label: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    label: "Command",
    items: [
      { to: "/ops", label: "Overview", end: true, icon: <DashboardOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/ops/users", label: "Users", icon: <PeopleOutlinedIcon fontSize="small" /> },
      {
        to: "/ops/subscriptions",
        label: "Subscriptions",
        icon: <CardMembershipOutlinedIcon fontSize="small" />,
      },
      { to: "/ops/earnings", label: "Earnings", icon: <PaymentsOutlinedIcon fontSize="small" /> },
      { to: "/ops/usage", label: "Usage", icon: <TimelineOutlinedIcon fontSize="small" /> },
      { to: "/ops/posts", label: "Posts", icon: <ArticleOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Reliability",
    items: [
      { to: "/ops/errors", label: "Errors", icon: <BugReportOutlinedIcon fontSize="small" /> },
      { to: "/ops/issues", label: "Issues", icon: <ReportProblemOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Security",
    items: [
      {
        to: "/ops/access",
        label: "Access control",
        icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
      },
    ],
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/ops": { title: "Overview", subtitle: "Platform health and estimated revenue" },
  "/ops/users": { title: "Users", subtitle: "Accounts, roles, and activity signals" },
  "/ops/subscriptions": { title: "Subscriptions", subtitle: "Plan mix and organization seats" },
  "/ops/earnings": { title: "Earnings", subtitle: "Estimated MRR from paid plans" },
  "/ops/usage": { title: "Usage", subtitle: "Activity timeline and hours active" },
  "/ops/posts": { title: "Posts", subtitle: "Cross-user content inspection" },
  "/ops/errors": { title: "Errors", subtitle: "Recent system and API failures" },
  "/ops/issues": { title: "Issues", subtitle: "Triage queue and publish flags" },
  "/ops/access": { title: "Access control", subtitle: "Roles, tiers, and suspensions" },
};

function OpsNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const t = useAppTokens();

  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email || "SA";
    return source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.email, user?.name]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.25, pt: 2.25, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: t.accent,
              color: "#fff",
              boxShadow: `0 8px 18px ${t.accent}44`,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: opsFonts.heading,
                fontWeight: 760,
                letterSpacing: "-0.35px",
                fontSize: 16.5,
                lineHeight: 1.15,
              }}
            >
              SMC Control
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: "text.secondary",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 650,
              }}
            >
              Super Admin
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.25, py: 1.5 }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 1.75 }}>
            <Typography
              sx={{
                px: 1.25,
                mb: 0.55,
                fontSize: 10.5,
                fontWeight: 750,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "text.secondary",
                opacity: 0.85,
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const active = item.end
                  ? location.pathname === item.to
                  : location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`);
                return (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    end={item.end}
                    selected={active}
                    onClick={onNavigate}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.3,
                      py: 0.8,
                      px: 1.15,
                      "&.Mui-selected": {
                        bgcolor: `${t.accent}14`,
                        "&:hover": { bgcolor: `${t.accent}1f` },
                      },
                      "&.Mui-selected .MuiListItemIcon-root": { color: t.accent },
                      "&.Mui-selected .MuiTypography-root": {
                        color: "text.primary",
                        fontWeight: 720,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: active ? t.accent : "text.secondary" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13.25,
                            fontWeight: active ? 700 : 520,
                            letterSpacing: "-0.1px",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />
      <Box sx={{ p: 1.75 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.15,
            p: 1.1,
            borderRadius: 1.75,
            border: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: t.accent,
            }}
          >
            {initials || "SA"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>
              {user?.name ?? "Super Admin"}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11, color: "text.secondary" }}>
              {user?.email}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Logout"
            onClick={() => dispatch(logout())}
            sx={{ color: "text.secondary" }}
          >
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export function OpsLayout() {
  const { user } = useAppSelector(selectAuth);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/" replace />;
  }

  const meta = pageTitles[location.pathname] ?? {
    title: "Operations",
    subtitle: "Platform control plane",
  };

  const sidebar = (
    <Paper
      elevation={0}
      square
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <OpsNav onNavigate={() => setMobileOpen(false)} />
    </Paper>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage: (thm) =>
          thm.palette.mode === "dark"
            ? "radial-gradient(1200px 500px at 100% -10%, rgba(45,110,170,0.12), transparent 55%)"
            : "radial-gradient(1200px 500px at 100% -10%, rgba(30,90,140,0.08), transparent 55%), linear-gradient(180deg, rgba(8,20,36,0.02), transparent 240px)",
      }}
    >
      {isDesktop ? (
        <Box
          component="nav"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, position: "fixed", height: "100vh", zIndex: 12 }}
        >
          {sidebar}
        </Box>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      <Box
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          minWidth: 0,
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: (thm) =>
              thm.palette.mode === "dark" ? "rgba(18,22,28,0.86)" : "rgba(255,255,255,0.86)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Toolbar sx={{ gap: 1.25, minHeight: { xs: 64, sm: 68 } }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: opsFonts.heading,
                  fontWeight: 720,
                  fontSize: 16.5,
                  letterSpacing: "-0.25px",
                  lineHeight: 1.2,
                }}
              >
                {meta.title}
              </Typography>
              <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                {meta.subtitle}
              </Typography>
            </Box>
            <OpsStatusChip label="Live" tone="success" />
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                fontFamily: opsFonts.mono,
                fontSize: 11.5,
                color: "text.secondary",
                mr: 0.5,
              }}
            >
              {now.toLocaleString(undefined, {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            <ThemeToggle />
            <UiLanguageSelect compact />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1320, mx: "auto", width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
