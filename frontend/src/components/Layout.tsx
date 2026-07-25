import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
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
import { NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { TokenExpiryBanner } from "./accounts/TokenExpiryBanner";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { PLATFORM_META, postsPath } from "../lib/platforms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";
import { selectOnboarding } from "../store/slices/onboardingSlice";
import { isPostTab, selectPosts } from "../store/slices/postsSlice";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useThemeMode } from "../theme/AppThemeProvider";
import { CyberOceanBackground } from "./cyber-ocean/CyberOceanBackground";

const DRAWER_EXPANDED = 280;
const DRAWER_COLLAPSED = 72;
const SIDEBAR_COLLAPSE_KEY = "smc-sidebar-collapsed";

const POSTING_PATH_PREFIXES = ["/compose", "/calendar", "/posts", "/accounts"] as const;
const ANALYTICS_PATH_PREFIXES = [
  "/google-ads",
  "/linkedin-ads",
  "/meta-ads",
  "/linkedin-marketing",
  "/instagram",
] as const;
const POSTING_PLATFORMS = ["FACEBOOK", "INSTAGRAM", "LINKEDIN"] as const;

type NavIcon = ElementType;

const postSubItems: Array<{
  to: string;
  label: string;
  tab: "all" | "published" | "scheduled" | "drafts" | "trashed";
  Icon: NavIcon;
}> = [
  { to: "/posts", label: "All", tab: "all", Icon: ArticleOutlinedIcon },
  { to: "/posts/published", label: "Published", tab: "published", Icon: CheckCircleOutlinedIcon },
  { to: "/posts/scheduled", label: "Scheduled", tab: "scheduled", Icon: ScheduleOutlinedIcon },
  { to: "/posts/drafts", label: "Drafts", tab: "drafts", Icon: DraftsOutlinedIcon },
  { to: "/posts/trashed", label: "Trashed", tab: "trashed", Icon: DeleteOutlinedIcon },
];

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

function getActivePostTab(pathname: string) {
  const segment = pathname.split("/")[2];
  return segment && isPostTab(segment) ? segment : "all";
}

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

function platformIcon(platform: (typeof POSTING_PLATFORMS)[number]): NavIcon {
  if (platform === "FACEBOOK") return FacebookIcon;
  if (platform === "INSTAGRAM") return InstagramIcon;
  return LinkedInIcon;
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
    borderRadius: collapsed ? 0 : 2,
    mb: collapsed ? 0.15 : 0.15,
    mx: collapsed ? 0 : nested ? 0.5 : 1,
    px: collapsed ? 0 : nested ? 1.25 : 1.5,
    py: collapsed ? 1.15 : nested ? 0.7 : 0.95,
    minHeight: collapsed ? 44 : nested ? 36 : 44,
    justifyContent: collapsed ? "center" : "flex-start",
    color: active ? "text.primary" : "text.secondary",
    bgcolor: "transparent",
    "&:hover": {
      bgcolor: (t) =>
        t.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,24,40,0.035)",
      color: "text.primary",
    },
    "&.Mui-selected": {
      bgcolor: "transparent",
      color: "text.primary",
      "&:hover": {
        bgcolor: (t) =>
          t.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,24,40,0.035)",
      },
    },
    "&::before":
      active && !nested
        ? {
            content: '""',
            position: "absolute",
            left: 0,
            top: "22%",
            bottom: "22%",
            width: 3,
            borderRadius: "0 4px 4px 0",
            bgcolor: "#3B82F6",
          }
        : undefined,
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

function SectionCaption({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        px: 2.5,
        pt: 1.25,
        pb: 0.5,
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: "text.secondary",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </Typography>
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
              t.palette.mode === "dark" ? "#2E3A8C" : "rgba(46,92,255,0.12)",
            color: (t) => (t.palette.mode === "dark" ? "#C4B5FD" : "primary.main"),
            boxShadow: (t) =>
              t.palette.mode === "dark" ? "inset 0 0 0 1px rgba(196,181,253,0.18)" : "none",
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
  const { filters } = useAppSelector(selectPosts);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onPostsSection = location.pathname.startsWith("/posts");
  const activeTab = getActivePostTab(location.pathname);
  const activePlatform = searchParams.get("platform") ?? filters.platform;
  const onPosting = isPostingPath(location.pathname);
  const onAnalytics = isAnalyticsPath(location.pathname);
  const onLinkedInAnalytics =
    location.pathname === "/linkedin-marketing" || location.pathname === "/linkedin-ads";

  const [postingOpen, setPostingOpen] = useState(onPosting);
  const [analyticsOpen, setAnalyticsOpen] = useState(onAnalytics);
  const [linkedInOpen, setLinkedInOpen] = useState(onLinkedInAnalytics);

  useEffect(() => {
    if (onPosting) setPostingOpen(true);
  }, [onPosting]);
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

        {collapsed ? (
          <NavRow
            to="/compose"
            label="Posting"
            Icon={EditNoteOutlinedIcon}
            active={onPosting}
            collapsed
            onNavigate={onNavigate}
            tourId="nav-compose"
          />
        ) : (
          <>
            <ListItemButton
              onClick={() => setPostingOpen((v) => !v)}
              selected={onPosting && !postingOpen}
              sx={navItemSx(onPosting && !postingOpen, false)}
            >
              <ListItemIcon sx={{ minWidth: 36, color: onPosting ? "text.primary" : "text.secondary" }}>
                <EditNoteOutlinedIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Posting"
                slotProps={{
                  primary: { sx: { fontSize: 14, fontWeight: onPosting ? 600 : 500 } },
                }}
              />
              {postingOpen ? (
                <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
              )}
            </ListItemButton>
            <Collapse in={postingOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                <NavRow
                  to="/compose"
                  end
                  label="All in one"
                  Icon={AutoAwesomeIcon}
                  active={location.pathname === "/compose"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-compose"
                />
                <NavRow
                  to="/calendar"
                  end
                  label="Calendar"
                  Icon={CalendarMonthOutlinedIcon}
                  active={location.pathname === "/calendar"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-calendar"
                />
                <SectionCaption>Posts</SectionCaption>
                {postSubItems.map((item) => (
                  <NavRow
                    key={item.to}
                    to={item.to}
                    end={item.tab === "all"}
                    label={item.label}
                    Icon={item.Icon}
                    active={location.pathname === item.to && !activePlatform}
                    collapsed={false}
                    nested
                    onNavigate={onNavigate}
                  />
                ))}
                <SectionCaption>By platform</SectionCaption>
                {POSTING_PLATFORMS.map((platform) => {
                  const meta = PLATFORM_META[platform];
                  return (
                    <NavRow
                      key={platform}
                      to={postsPath(activeTab, platform)}
                      label={meta.label}
                      Icon={platformIcon(platform)}
                      active={onPostsSection && activePlatform === platform}
                      collapsed={false}
                      nested
                      onNavigate={onNavigate}
                    />
                  );
                })}
                <NavRow
                  to="/accounts"
                  end
                  label="Connected accounts"
                  Icon={LinkOutlinedIcon}
                  active={location.pathname === "/accounts"}
                  collapsed={false}
                  nested
                  onNavigate={onNavigate}
                  tourId="nav-accounts"
                />
              </List>
            </Collapse>
          </>
        )}

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
          px: collapsed ? 0 : 1.5,
          pb: collapsed ? 1.75 : 1.25,
          pt: collapsed ? 1 : 0.5,
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
            px: collapsed ? 0 : 0.75,
            py: collapsed ? 0 : 0.85,
          }}
        >
          <WithTooltip collapsed={collapsed} title={displayName}>
            <Avatar
              sx={{
                width: collapsed ? 36 : 36,
                height: collapsed ? 36 : 36,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: theme.palette.mode === "dark" ? "#2A3344" : "#E8EEF9",
                color: theme.palette.mode === "dark" ? "#E8EEF9" : "#1E3A8A",
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
      md: collapsed ? "999px" : "28px",
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
