import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import { api } from "../lib/api";
import { platformLabel } from "../lib/platforms";
import type { DashboardData } from "../types";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageStateLoader } from "../components/ui/PageState";

function StatCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: number;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s ease",
        "&:hover": onClick ? { borderColor: "primary.main" } : undefined,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function PostSnippet({
  post,
  meta,
}: {
  post: DashboardData["upcoming"][number];
  meta: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {post.finalContent || post.content || "(image post)"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {meta}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
            {post.targets.map((t) => (
              <Chip key={t.id} label={platformLabel(t.platform)} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Chip label={post.status} size="small" variant="outlined" />
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getDashboard(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <PageStateLoader label="Loading dashboard..." />;
  }

  if (error || !data) {
    return (
      <Card title="Dashboard">
        <Typography color="error">{error ?? "Dashboard unavailable"}</Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "flex-end" }}
        gap={1.5}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Overview — accounts, scheduled posts, aur recent activity
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="secondary" onClick={() => navigate("/compose")}>
            <EditOutlinedIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Compose
          </Button>
          <Button variant="secondary" onClick={() => navigate("/calendar")}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Calendar
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <StatCard
          label="Connected accounts"
          value={data.accounts.total}
          hint="Manage accounts"
          onClick={() => navigate("/accounts")}
        />
        <StatCard
          label="Scheduled"
          value={data.posts.scheduled}
          hint="Next 7 days"
          onClick={() => navigate("/posts/scheduled")}
        />
        <StatCard
          label="Published"
          value={data.posts.published}
          onClick={() => navigate("/posts/published")}
        />
        <StatCard
          label="Drafts"
          value={data.posts.drafts}
          onClick={() => navigate("/posts/drafts")}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        }}
      >
          <Card
            title="Upcoming scheduled"
            description="Agle 7 din ki posts"
            action={
              <Link component={RouterLink} to="/posts/scheduled" underline="hover" variant="body2">
                View all
              </Link>
            }
          >
            {data.upcoming.length === 0 ? (
              <Stack spacing={1.5} alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">
                  Koi scheduled post nahi. Compose se schedule karo.
                </Typography>
                <Button variant="secondary" onClick={() => navigate("/compose")}>
                  Schedule a post
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {data.upcoming.map((post) => (
                  <PostSnippet
                    key={post.id}
                    post={post}
                    meta={
                      post.scheduledFor
                        ? `Scheduled ${new Date(post.scheduledFor).toLocaleString()}`
                        : "Scheduled"
                    }
                  />
                ))}
              </Stack>
            )}
          </Card>
        <Card
            title="Recently published"
            description="Latest live posts"
            action={
              <Link component={RouterLink} to="/posts/published" underline="hover" variant="body2">
                View all
              </Link>
            }
          >
            {data.recent.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Abhi tak koi published post nahi.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {data.recent.map((post) => (
                  <PostSnippet
                    key={post.id}
                    post={post}
                    meta={
                      post.publishedAt
                        ? `Published ${new Date(post.publishedAt).toLocaleString()}`
                        : "Published"
                    }
                  />
                ))}
              </Stack>
            )}
          </Card>
      </Box>

      {data.posts.failed > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderColor: "error.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(211,47,47,0.08)" : "rgba(211,47,47,0.04)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleOutlinedIcon color="error" fontSize="small" />
              <Typography variant="body2">
                {data.posts.failed} post(s) need attention (failed publish).
              </Typography>
            </Stack>
            <Button variant="secondary" onClick={() => navigate("/posts/published")}>
              Review
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
