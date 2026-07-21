import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { platformLabel } from "../../lib/platforms";
import type { DashboardData } from "../../types";
import {
  PublishedEmptyIcon3D,
  ScheduleEmptyIcon3D,
} from "../ui/icons3d/DashboardIcons3D";
import { glassPanelSx } from "../../theme/glassSurface";
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
    <Box
      onClick={onClick}
      sx={{
        p: 1.75,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.03)",
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
        overflow: "hidden",
        transition: "border-color 0.15s ease, background 0.15s ease",
        "&:hover": onClick
          ? {
              borderColor: accent,
              bgcolor: "rgba(255,255,255,0.05)",
            }
          : undefined,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        gap={1.25}
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontFamily: dashboardFonts.body,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            {post.finalContent || post.content || "(image post)"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.5,
              fontFamily: dashboardFonts.body,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </Typography>
          {post.targets.length > 0 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.5}
              sx={{ mt: 1, maxWidth: "100%" }}
            >
              {post.targets.map((t) => (
                <Chip
                  key={t.id}
                  label={platformLabel(t.platform)}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                />
              ))}
            </Stack>
          )}
        </Box>
        <Chip
          label={post.status}
          size="small"
          variant="outlined"
          sx={{ flexShrink: 0, maxWidth: 96 }}
        />
      </Stack>
    </Box>
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
        ...glassPanelSx,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: { xs: 2, sm: "22px 24px" },
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1.5,
          mb: 0.5,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 15.5,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: colors.muted,
              mt: 0.4,
              mb: 2.25,
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
              whiteSpace: "nowrap",
              pt: 0.25,
            }}
          >
            View all →
          </Link>
        )}
      </Box>

      {hasPosts && postMeta ? (
        <Stack
          spacing={1.25}
          sx={{
            minWidth: 0,
            maxHeight: { xs: 320, lg: 360 },
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.25,
            mr: -0.25,
          }}
        >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1,
              minWidth: 0,
            }}
          >
            <Box sx={{ flexShrink: 0, filter: "drop-shadow(0 8px 16px rgba(15,23,42,0.1))" }}>
              {emptyIcon}
            </Box>
            <Typography
              sx={{
                fontSize: 13,
                color: colors.inkSoft,
                lineHeight: 1.55,
                fontFamily: dashboardFonts.body,
                flex: 1,
                minWidth: 0,
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
  return <ScheduleEmptyIcon3D size={68} />;
}

export function PublishedEmptyIcon() {
  return <PublishedEmptyIcon3D size={68} />;
}
