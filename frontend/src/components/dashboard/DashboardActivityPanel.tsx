import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { platformLabel } from "../../lib/platforms";
import type { DashboardData } from "../../types";
import { dashboardFonts, useDashboardTheme } from "./dashboardTheme";

type Post = DashboardData["upcoming"][number];

function PostRow({
  post,
  meta,
  onClick,
  accent,
}: {
  post: Post;
  meta: string;
  onClick?: () => void;
  accent: string;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s ease",
        "&:hover": onClick ? { borderColor: accent } : undefined,
      }}
    >
      <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap fontFamily={dashboardFonts.body}>
            {post.finalContent || post.content || "(image post)"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5, fontFamily: dashboardFonts.body }}
          >
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

type Props = {
  title: string;
  subtitle: string;
  viewAllHref?: string;
  emptyIcon: ReactNode;
  emptyText: string;
  actionButton?: ReactNode;
  posts?: Post[];
  postMeta?: (post: Post) => string;
  onPostClick?: () => void;
};

export function DashboardActivityPanel({
  title,
  subtitle,
  viewAllHref,
  emptyIcon,
  emptyText,
  actionButton,
  posts = [],
  postMeta,
  onPostClick,
}: Props) {
  const { colors } = useDashboardTheme();
  const hasPosts = posts.length > 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: "24px 26px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 15.5,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: colors.muted,
              mt: 0.4,
              mb: 2.75,
              fontFamily: dashboardFonts.body,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {viewAllHref && hasPosts && (
          <Link
            component={RouterLink}
            to={viewAllHref}
            underline="hover"
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.accent,
              fontFamily: dashboardFonts.body,
              flexShrink: 0,
            }}
          >
            View all →
          </Link>
        )}
      </Box>

      {hasPosts && postMeta ? (
        <Stack spacing={1.5}>
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              meta={postMeta(post)}
              onClick={onPostClick}
              accent={colors.accent}
            />
          ))}
        </Stack>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", py: 1 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "12px",
                bgcolor: colors.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.muted,
                mb: 1.75,
              }}
            >
              {emptyIcon}
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                color: colors.inkSoft,
                mb: 2.25,
                lineHeight: 1.5,
                fontFamily: dashboardFonts.body,
              }}
            >
              {emptyText}
            </Typography>
          </Box>
          {actionButton}
        </>
      )}
    </Box>
  );
}

export function ScheduleEmptyIcon() {
  return <CalendarMonthOutlinedIcon sx={{ fontSize: 21 }} />;
}

export function PublishedEmptyIcon() {
  return <CheckCircleOutlinedIcon sx={{ fontSize: 21 }} />;
}
