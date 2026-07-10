import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { PLATFORM_META } from "../lib/platforms";
import { api } from "../lib/api";
import type { PostAnalytics } from "../types";
import { LinkedInStatsGrid } from "./analytics/LinkedInStatsGrid";
import { Button } from "./ui/Button";
import { PlatformIcon } from "./platforms/PlatformBadge";

type PostAnalyticsPanelProps = {
  postId: string;
  token: string | null;
  hasLinkedInSuccess: boolean;
};

const LINKEDIN = PLATFORM_META.LINKEDIN!;

export function PostAnalyticsPanel({
  postId,
  token,
  hasLinkedInSuccess,
}: PostAnalyticsPanelProps) {
  const theme = useTheme();
  const [data, setData] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!hasLinkedInSuccess || !token) {
    return null;
  }

  async function loadAnalytics() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.getPostAnalytics(token, postId);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const linkedInTarget = data?.targets.find((t) => t.platform === "LINKEDIN");
  const stats = linkedInTarget?.analytics;
  const panelBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.03)
      : alpha(theme.palette.primary.main, 0.04);

  return (
    <Box
      component="section"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: panelBg,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, sm: 2.5 },
          py: 2,
        }}
      >
        <Box
          sx={{
            width: 4,
            alignSelf: "stretch",
            borderRadius: 1,
            bgcolor: LINKEDIN.color,
            flexShrink: 0,
          }}
        />
        <PlatformIcon platform="LINKEDIN" className="h-9 w-9 shrink-0 text-xs" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {LINKEDIN.label} stats
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            Engagement metrics for this post
          </Typography>
        </Box>
        <Button type="button" variant="secondary" className="shrink-0" onClick={loadAnalytics} loading={loading}>
          {data ? "Refresh stats" : "View stats"}
        </Button>
      </Box>

      {(error || linkedInTarget?.error) && (
        <Box sx={{ borderTop: 1, borderColor: "divider", px: { xs: 2, sm: 2.5 }, py: 1.5 }}>
          {error && (
            <Typography variant="caption" color="error.main" sx={{ display: "block" }}>
              {error}
            </Typography>
          )}
          {linkedInTarget?.error && !stats && (
            <Typography variant="caption" color="warning.main" sx={{ display: "block" }}>
              {linkedInTarget.error}
            </Typography>
          )}
        </Box>
      )}

      {stats && <LinkedInStatsGrid stats={stats} />}

      {data && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            borderTop: 1,
            borderColor: "divider",
            px: { xs: 2, sm: 2.5 },
            py: 1,
            fontSize: 10,
          }}
        >
          Updated {new Date(data.fetchedAt).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
}
