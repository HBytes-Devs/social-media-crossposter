import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
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
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { TokenExpiryBanner } from "./accounts/TokenExpiryBanner";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";
import { PLATFORM_META, PLATFORM_ORDER, postsPath } from "../lib/platforms";
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

const navItems: Array<{
  to: string;
  label: string;
  iconId: SidebarIconId;
  end: boolean;
  tourId: string;
}> = [
  { to: "/", label: "Dashboard", iconId: "dashboard", end: true, tourId: "nav-dashboard" },
  { to: "/compose", label: "Compose", iconId: "compose", end: true, tourId: "nav-compose" },
  { to: "/calendar", label: "Calendar", iconId: "calendar", end: true, tourId: "nav-calendar" },
  { to: "/accounts", label: "Accounts", iconId: "accounts", end: true, tourId: "nav-accounts" },
  { to: "/google-ads", label: "Google Ads", iconId: "google-ads", end: true, tourId: "nav-google-ads" },
  { to: "/linkedin-ads", label: "LinkedIn Ads", iconId: "linkedin-ads", end: true, tourId: "nav-linkedin-ads" },
  { to: "/meta-ads", label: "Meta Ads", iconId: "meta-ads", end: true, tourId: "nav-meta-ads" },
  { to: "/linkedin-marketing", label: "LinkedIn Marketing", iconId: "linkedin-marketing", end: true, tourId: "nav-linkedin-marketing" },
  { to: "/instagram", label: "Instagram", iconId: "instagram-analytics", end: true, tourId: "nav-instagram" },
  { to: "/settings", label: "Settings", iconId: "settings", end: true, tourId: "nav-settings" },
];

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

function getActivePostTab(pathname: string) {
  const segment = pathname.split("/")[2];
  return segment && isPostTab(segment) ? segment : "all";
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
          <ThemeToggle size="small" />
        </Box>
      </Box>

      <List sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            end={item.end}
            label={item.label}
            iconId={item.iconId}
            tourId={item.tourId}
            onNavigate={onNavigate}
            active={
              item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
            }
          />
        ))}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1.5, pt: 2, pb: 0.5, display: "block", fontWeight: 700, letterSpacing: 0.6 }}
        >
          POSTS
        </Typography>
        {postSubItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            end={item.tab === "all"}
            label={item.label}
            iconId={item.iconId}
            onNavigate={onNavigate}
            active={location.pathname === item.to && !activePlatform}
          />
        ))}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1.5, pt: 2, pb: 0.5, display: "block", fontWeight: 700, letterSpacing: 0.6 }}
        >
          PLATFORMS
        </Typography>
        {PLATFORM_ORDER.map((platform) => {
          const meta = PLATFORM_META[platform];
          const to = postsPath(activeTab, platform);
          const isActive = onPostsSection && activePlatform === platform;

          return (
            <ListItemButton
              key={platform}
              component={NavLink}
              to={to}
              selected={isActive}
              onClick={onNavigate}
              sx={{ borderRadius: 2, mb: 1, transition: "all 0.2s ease" }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PlatformIcon3D platform={platform} size={28} active={isActive} />
              </ListItemIcon>
              <ListItemText
                primary={meta.label}
                slotProps={{
                  primary: {
                    sx: { fontSize: 14, fontWeight: isActive ? 600 : 500 },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
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
          </Typography>
        )}
        {onPostsSection && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Managing posts
          </Typography>
        )}
        <Box sx={{ mt: 2, mb: 1.5 }}>
          <UiLanguageSelect compact />
        </Box>
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
