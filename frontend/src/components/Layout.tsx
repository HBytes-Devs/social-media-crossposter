import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AppBar from "@mui/material/AppBar";
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
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { TokenExpiryBanner } from "./accounts/TokenExpiryBanner";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { PLATFORM_META, postsPath } from "../lib/platforms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";
import { selectOnboarding } from "../store/slices/onboardingSlice";
import { isPostTab, selectPosts } from "../store/slices/postsSlice";
import { Button } from "./ui/Button";
import { PlatformIcon3D } from "./ui/icons3d/DashboardIcons3D";
import { SidebarLogo3D } from "./ui/icons3d/SidebarLogo3D";
import { SidebarNavIcon3D, type SidebarIconId } from "./ui/icons3d/SidebarIcons3D";
import { ThemeToggle } from "./ui/ThemeToggle";
import { UiLanguageSelect } from "./ui/UiLanguageSelect";
import { VersionBadge } from "./ui/VersionBadge";
import { CyberOceanBackground } from "./cyber-ocean/CyberOceanBackground";

const DRAWER_WIDTH = 256;

const POSTING_PATH_PREFIXES = ["/compose", "/calendar", "/posts", "/accounts"] as const;
const ANALYTICS_PATH_PREFIXES = [
  "/google-ads",
  "/linkedin-ads",
  "/meta-ads",
  "/linkedin-marketing",
  "/instagram",
] as const;

const POSTING_PLATFORMS = ["FACEBOOK", "INSTAGRAM", "LINKEDIN"] as const;

const postSubItems: Array<{
  to: string;
  label: string;
  tab: "all" | "published" | "scheduled" | "drafts" | "trashed";
  iconId: SidebarIconId;
}> = [
  { to: "/posts", label: "All", tab: "all", iconId: "posts-all" },
  { to: "/posts/published", label: "Published", tab: "published", iconId: "posts-published" },
  { to: "/posts/scheduled", label: "Scheduled", tab: "scheduled", iconId: "posts-scheduled" },
  { to: "/posts/drafts", label: "Drafts", tab: "drafts", iconId: "posts-drafts" },
  { to: "/posts/trashed", label: "Trashed", tab: "trashed", iconId: "posts-trashed" },
];

const analyticsSubItems: Array<{
  to: string;
  label: string;
  iconId: SidebarIconId;
  tourId: string;
}> = [
  { to: "/meta-ads", label: "Meta Ads", iconId: "meta-ads", tourId: "nav-meta-ads" },
  { to: "/google-ads", label: "Google Ads", iconId: "google-ads", tourId: "nav-google-ads" },
  { to: "/instagram", label: "Instagram", iconId: "instagram-analytics", tourId: "nav-instagram" },
];

const linkedInAnalyticsItems: Array<{
  to: string;
  label: string;
  tourId: string;
}> = [
  { to: "/linkedin-marketing", label: "Marketing", tourId: "nav-linkedin-marketing" },
  { to: "/linkedin-ads", label: "Ads", tourId: "nav-linkedin-ads" },
];

function isPostingPath(pathname: string): boolean {
  return POSTING_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAnalyticsPath(pathname: string): boolean {
  return ANALYTICS_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getActivePostTab(pathname: string) {
  const segment = pathname.split("/")[2];
  return segment && isPostTab(segment) ? segment : "all";
}

function NavSubItem({
  to,
  end,
  label,
  active,
  onNavigate,
  tourId,
  iconId,
  platform,
  nested,
}: {
  to: string;
  end?: boolean;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  tourId?: string;
  iconId?: SidebarIconId;
  platform?: (typeof POSTING_PLATFORMS)[number];
  nested?: boolean;
}) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      selected={active}
      onClick={onNavigate}
      data-tour={tourId}
      sx={{
        borderRadius: 2,
        mb: 0.25,
        ml: nested ? 3 : 1.5,
        pl: nested ? 2 : 1.5,
        py: 0.65,
        minHeight: 38,
      }}
    >
      {iconId || platform ? (
        <ListItemIcon sx={{ minWidth: 34 }}>
          {platform ? (
            <PlatformIcon3D platform={platform} size={22} active={active} />
          ) : iconId ? (
            <SidebarNavIcon3D id={iconId} active={active} size={22} />
          ) : null}
        </ListItemIcon>
      ) : null}
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            sx: { fontSize: 13, fontWeight: active ? 600 : 500 },
          },
        }}
      />
    </ListItemButton>
  );
}

function NavNestedGroup({
  label,
  iconId,
  open,
  onToggle,
  active,
  children,
}: {
  label: string;
  iconId: SidebarIconId;
  open: boolean;
  onToggle: () => void;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ ml: 1.5, mb: 0.25 }}>
      <ListItemButton
        onClick={onToggle}
        selected={active && !open}
        sx={{ borderRadius: 2, pl: 1.5, py: 0.65, minHeight: 38 }}
      >
        <ListItemIcon sx={{ minWidth: 34 }}>
          <SidebarNavIcon3D id={iconId} active={active} size={22} />
        </ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: { fontSize: 13, fontWeight: active ? 600 : 500 },
            },
          }}
        />
        {open ? (
          <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} />
        ) : (
          <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </Box>
  );
}

function NavSection({
  label,
  iconId,
  open,
  onToggle,
  active,
  children,
}: {
  label: string;
  iconId: SidebarIconId;
  open: boolean;
  onToggle: () => void;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onToggle}
        selected={active && !open}
        sx={{ borderRadius: 2, mb: 0.25 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <SidebarNavIcon3D id={iconId} active={active} />
        </ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: { fontSize: 14, fontWeight: active ? 700 : 600 },
            },
          }}
        />
        {open ? (
          <ExpandLess sx={{ fontSize: 20, color: "text.secondary" }} />
        ) : (
          <ExpandMore sx={{ fontSize: 20, color: "text.secondary" }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pb: 0.5 }}>
          {children}
        </List>
      </Collapse>
    </Box>
  );
}

function SectionCaption({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ px: 2.5, pt: 1, pb: 0.25, display: "block", fontWeight: 600, letterSpacing: 0.4 }}
    >
      {children}
    </Typography>
  );
}

function NavItem({
  to,
  end,
  label,
  iconId,
  active,
  onNavigate,
  tourId,
}: {
  to: string;
  end?: boolean;
  label: string;
  iconId: SidebarIconId;
  active: boolean;
  onNavigate?: () => void;
  tourId?: string;
}) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      selected={active}
      onClick={onNavigate}
      data-tour={tourId}
      sx={{ borderRadius: 2, mb: 0.5, transition: "all 0.2s ease" }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <SidebarNavIcon3D id={iconId} active={active} />
      </ListItemIcon>
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            sx: { fontSize: 14, fontWeight: active ? 600 : 500 },
          },
        }}
      />
    </ListItemButton>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch();
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
  const [linkedInAnalyticsOpen, setLinkedInAnalyticsOpen] = useState(onLinkedInAnalytics);

  useEffect(() => {
    if (onPosting) setPostingOpen(true);
  }, [onPosting]);

  useEffect(() => {
    if (onAnalytics) setAnalyticsOpen(true);
  }, [onAnalytics]);

  useEffect(() => {
    if (onLinkedInAnalytics) setLinkedInAnalyticsOpen(true);
  }, [onLinkedInAnalytics]);

  return (
    <>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <SidebarLogo3D size={40} />
            <div>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                SMC
              </Typography>
              <Box sx={{ mt: 0.75 }}>
                <VersionBadge compact />
              </Box>
            </div>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <UiLanguageSelect compact />
            <ThemeToggle size="small" />
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        <NavItem
          to="/"
          end
          label="Dashboard"
          iconId="dashboard"
          tourId="nav-dashboard"
          onNavigate={onNavigate}
          active={location.pathname === "/"}
        />

        <NavSection
          label="Posting"
          iconId="posting"
          open={postingOpen}
          onToggle={() => setPostingOpen((value) => !value)}
          active={onPosting}
        >
          <NavSubItem
            to="/compose"
            end
            label="All in one"
            iconId="compose"
            tourId="nav-compose"
            onNavigate={onNavigate}
            active={location.pathname === "/compose"}
          />
          <NavSubItem
            to="/calendar"
            end
            label="Calendar"
            iconId="calendar"
            tourId="nav-calendar"
            onNavigate={onNavigate}
            active={location.pathname === "/calendar"}
          />

          <SectionCaption>Posts</SectionCaption>
          {postSubItems.map((item) => (
            <NavSubItem
              key={item.to}
              to={item.to}
              end={item.tab === "all"}
              label={item.label}
              iconId={item.iconId}
              onNavigate={onNavigate}
              active={location.pathname === item.to && !activePlatform}
            />
          ))}

          <SectionCaption>By platform</SectionCaption>
          {POSTING_PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            const to = postsPath(activeTab, platform);
            return (
              <NavSubItem
                key={platform}
                to={to}
                label={meta.label}
                platform={platform}
                onNavigate={onNavigate}
                active={onPostsSection && activePlatform === platform}
              />
            );
          })}

          <NavSubItem
            to="/accounts"
            end
            label="Connected accounts"
            iconId="accounts"
            tourId="nav-accounts"
            onNavigate={onNavigate}
            active={location.pathname === "/accounts"}
          />
        </NavSection>

        <NavSection
          label="Analytics"
          iconId="analytics"
          open={analyticsOpen}
          onToggle={() => setAnalyticsOpen((value) => !value)}
          active={onAnalytics}
        >
          <NavSubItem
            to="/meta-ads"
            end
            label="Meta Ads"
            iconId="meta-ads"
            tourId="nav-meta-ads"
            onNavigate={onNavigate}
            active={location.pathname === "/meta-ads"}
          />

          <NavNestedGroup
            label="LinkedIn"
            iconId="linkedin-marketing"
            open={linkedInAnalyticsOpen}
            onToggle={() => setLinkedInAnalyticsOpen((value) => !value)}
            active={onLinkedInAnalytics}
          >
            {linkedInAnalyticsItems.map((item) => (
              <NavSubItem
                key={item.to}
                to={item.to}
                end
                label={item.label}
                tourId={item.tourId}
                nested
                onNavigate={onNavigate}
                active={location.pathname === item.to}
              />
            ))}
          </NavNestedGroup>

          {analyticsSubItems.slice(1).map((item) => (
            <NavSubItem
              key={item.to}
              to={item.to}
              end
              label={item.label}
              iconId={item.iconId}
              tourId={item.tourId}
              onNavigate={onNavigate}
              active={location.pathname === item.to}
            />
          ))}
        </NavSection>

        <NavItem
          to="/settings"
          end
          label="Settings"
          iconId="settings"
          tourId="nav-settings"
          onNavigate={onNavigate}
          active={location.pathname === "/settings"}
        />
        {(user?.role === "ADMIN") && (
          <NavItem
            to="/admin"
            end
            label="Admin"
            iconId="admin"
            tourId="nav-admin"
            onNavigate={onNavigate}
            active={location.pathname === "/admin" || location.pathname.startsWith("/admin/")}
          />
        )}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {user?.name ?? user?.email}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {user?.email}
        </Typography>
            {user?.subscription?.plan?.name && (
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", color: "primary.main", fontWeight: 600 }}
          >
            {user.subscription.premierMember
              ? "Premier member"
              : `${user.subscription.plan.name} plan`}
            {user.subscription.source === "organization" ? " · Company" : ""}
          </Typography>
        )}
        {user?.role && user.role !== "USER" && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {user.role.replace("_", " ")}
          </Typography>
        )}
        {onPostsSection && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Managing posts
          </Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Button variant="secondary" className="w-full" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        </Box>
      </Box>
    </>
  );
}

export function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tourActive } = useAppSelector(selectOnboarding);

  useEffect(() => {
    if (tourActive && !isDesktop) {
      setMobileOpen(true);
    }
  }, [tourActive, isDesktop]);

  const closeMobile = () => setMobileOpen(false);

  const sidebar = (
    <Paper
      elevation={0}
      square
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(8, 14, 28, 0.72)"
            : "rgba(255, 255, 255, 0.78)",
        backdropFilter: "blur(18px) saturate(1.15)",
        WebkitBackdropFilter: "blur(18px) saturate(1.15)",
      }}
    >
      <SidebarContent onNavigate={closeMobile} />
    </Paper>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", position: "relative", bgcolor: "#010126" }}>
      {/* Cyber Ocean — no fish on dashboard */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
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
              "radial-gradient(ellipse at 30% 20%, transparent 0%, rgba(1,1,38,0.35) 70%, rgba(1,1,38,0.55) 100%)",
          }}
        />
      </Box>

      <OnboardingFlow />
      {!isDesktop && (
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(8, 14, 28, 0.78)"
                : "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={800} sx={{ ml: 1, flex: 1 }}>
              SMC
            </Typography>
            <ThemeToggle size="small" />
            <Box sx={{ width: 8 }} />
            <VersionBadge compact />
          </Toolbar>
        </AppBar>
      )}

      {isDesktop ? (
        <Box
          component="aside"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
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
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(8, 14, 28, 0.92)"
                  : "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(18px)",
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
          display: "flex",
          flexDirection: "column",
          pt: { xs: 7, md: 0 },
          position: "relative",
          zIndex: 1,
          bgcolor: "transparent",
        }}
      >
        <TokenExpiryBanner />
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3, lg: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
