import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { PLATFORM_META, PLATFORM_ORDER, postsPath } from "../lib/platforms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";
import { isPostTab, selectPosts } from "../store/slices/postsSlice";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ui/ThemeToggle";
import { UiLanguageSelect } from "./ui/UiLanguageSelect";

const navItems = [
  { to: "/", label: "Dashboard", icon: <DashboardOutlinedIcon fontSize="small" />, end: true },
  { to: "/compose", label: "Compose", icon: <EditOutlinedIcon fontSize="small" />, end: true },
  { to: "/calendar", label: "Calendar", icon: <CalendarMonthOutlinedIcon fontSize="small" />, end: true },
  { to: "/accounts", label: "Accounts", icon: <LinkOutlinedIcon fontSize="small" />, end: true },
  { to: "/settings", label: "Settings", icon: <SettingsOutlinedIcon fontSize="small" />, end: true },
];

const postSubItems = [
  { to: "/posts", label: "All", tab: "all" as const },
  { to: "/posts/published", label: "Published", tab: "published" as const },
  { to: "/posts/scheduled", label: "Scheduled", tab: "scheduled" as const },
  { to: "/posts/drafts", label: "Drafts", tab: "drafts" as const },
  { to: "/posts/trashed", label: "Trashed", tab: "trashed" as const },
];

function getActivePostTab(pathname: string) {
  const segment = pathname.split("/")[2];
  return segment && isPostTab(segment) ? segment : "all";
}

function NavItem({
  to,
  end,
  label,
  icon,
  active,
}: {
  to: string;
  end?: boolean;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      selected={active}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        transition: "all 0.2s ease",
      }}
    >
      {icon && <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>}
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />
    </ListItemButton>
  );
}

export function Layout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { filters } = useAppSelector(selectPosts);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onPostsSection = location.pathname.startsWith("/posts");
  const activeTab = getActivePostTab(location.pathname);
  const activePlatform = searchParams.get("platform") ?? filters.platform;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Paper
        component="aside"
        elevation={0}
        square
        sx={{
          width: 256,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: 1,
          borderColor: "divider",
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Typography variant="h6" fontWeight={800}>
                SMC
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Social Media Crossposter
              </Typography>
            </div>
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
              icon={item.icon}
              active={item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)}
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
              icon={<ArticleOutlinedIcon fontSize="small" />}
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
                sx={{ borderRadius: 2, mb: 0.5, transition: "all 0.2s ease" }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 1,
                      bgcolor: meta.color,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {meta.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={meta.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}
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
      </Paper>

      <Box component="main" sx={{ flex: 1, overflowY: "auto", p: { xs: 3, lg: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
