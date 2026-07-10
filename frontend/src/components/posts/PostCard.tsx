import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { PostImage } from "../PostImage";
import { PostAnalyticsPanel } from "../PostAnalyticsPanel";
import { PlatformBadge } from "../platforms/PlatformBadge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { Post } from "../../types";

type StatusKey = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "PUBLISHING" | "FAILED" | "PARTIAL";

const STATUS_CHIP: Record<StatusKey, { color: "default" | "success" | "warning" | "error" | "info"; variant?: "filled" | "outlined" }> = {
  DRAFT: { color: "default", variant: "outlined" },
  SCHEDULED: { color: "default", variant: "outlined" },
  PUBLISHED: { color: "success", variant: "outlined" },
  PUBLISHING: { color: "warning", variant: "outlined" },
  FAILED: { color: "error", variant: "outlined" },
  PARTIAL: { color: "warning", variant: "filled" },
};

type Props = {
  post: Post;
  token: string | null;
  acting?: boolean;
  groupPlatform?: string;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onPublishNow?: (id: string) => void;
  onCancelSchedule?: (id: string) => void;
};

export function PostCard({
  post,
  token,
  acting,
  groupPlatform,
  onTrash,
  onRestore,
  onPermanentDelete,
  onPublishNow,
  onCancelSchedule,
}: Props) {
  const theme = useTheme();
  const isTrashed = Boolean(post.deletedAt);
  const isNested = Boolean(groupPlatform);
  const hasLinkedInSuccess = post.targets.some(
    (t) => t.platform === "LINKEDIN" && t.status === "SUCCESS",
  );
  const showPlatformBadges =
    !groupPlatform ||
    post.targets.length !== 1 ||
    post.targets[0]?.platform !== groupPlatform;
  const showStats = !isTrashed && hasLinkedInSuccess;
  const status = STATUS_CHIP[post.status as StatusKey] ?? STATUS_CHIP.DRAFT;

  const content = (
    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Chip label={post.status} size="small" color={status.color} variant={status.variant} />
            {showPlatformBadges &&
              (post.targets.length > 0 ? (
                post.targets.map((target) => (
                  <PlatformBadge key={target.id} platform={target.platform} />
                ))
              ) : (
                <Chip label="No platform" size="small" variant="outlined" />
              ))}
            <Typography variant="caption" color="text.secondary">
              {post.hashtagMode} · {post.language}
            </Typography>
            {isTrashed && <Chip label="Trashed" size="small" color="error" variant="outlined" />}
          </Stack>

          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
            }}
          >
            {post.finalContent || post.content || "(image only)"}
          </Typography>

          {post.images.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              {post.images.slice(0, 4).map((url) => (
                <Box
                  key={url}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: 1,
                    borderColor: "divider",
                    lineHeight: 0,
                  }}
                >
                  <PostImage
                    src={url}
                    token={token}
                    className="h-20 w-20 object-cover"
                  />
                </Box>
              ))}
              {post.images.length > 4 && (
                <Box
                  sx={{
                    display: "flex",
                    height: 80,
                    width: 80,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    fontSize: 12,
                  }}
                >
                  +{post.images.length - 4}
                </Box>
              )}
            </Stack>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: post.images.length > 0 ? 1.5 : 1, display: "block" }}>
            {new Date(post.createdAt).toLocaleString()}
            {post.scheduledFor && ` · Scheduled ${new Date(post.scheduledFor).toLocaleString()}`}
            {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleString()}`}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ flexShrink: 0 }}>
          {isTrashed ? (
            <>
              <Button variant="secondary" className="text-xs" loading={acting} onClick={() => onRestore(post.id)}>
                Restore
              </Button>
              <Button
                variant="danger"
                className="text-xs"
                loading={acting}
                onClick={() => {
                  if (window.confirm("Permanently delete this post? This cannot be undone.")) {
                    onPermanentDelete(post.id);
                  }
                }}
              >
                Delete forever
              </Button>
            </>
          ) : (
            <>
              {(post.status === "SCHEDULED" || post.status === "DRAFT") && onPublishNow && (
                <Button
                  variant="secondary"
                  className="text-xs"
                  loading={acting}
                  onClick={() => onPublishNow(post.id)}
                >
                  Publish now
                </Button>
              )}
              {post.status === "SCHEDULED" && onCancelSchedule && (
                <Button
                  variant="ghost"
                  className="text-xs"
                  loading={acting}
                  onClick={() => onCancelSchedule(post.id)}
                >
                  Cancel schedule
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-xs"
                loading={acting}
                onClick={() => {
                  if (window.confirm("Move this post to trash?")) {
                    onTrash(post.id);
                  }
                }}
              >
                Move to trash
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );

  const stats = showStats ? (
    <PostAnalyticsPanel postId={post.id} token={token} hasLinkedInSuccess={hasLinkedInSuccess} />
  ) : null;

  if (isNested) {
    return (
      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          borderRadius: 2,
          borderColor: "divider",
          bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.02) : "background.paper",
        }}
      >
        {content}
        {stats}
      </Paper>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {content}
      {stats}
    </Card>
  );
}
