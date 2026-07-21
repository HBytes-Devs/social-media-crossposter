import type { ReactNode } from "react";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GoogleAdsChart } from "../components/analytics/GoogleAdsChart";
import { GoogleAdsStatsGrid } from "../components/analytics/GoogleAdsStatsGrid";
import { dashboardFonts } from "../components/dashboard/dashboardTheme";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageStateLoader } from "../components/ui/PageState";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth, selectToken } from "../store/slices/authSlice";
import { glassPanelSx } from "../theme/glassSurface";
import type { GoogleAdsAnalyticsSummary, GoogleAdsDatePreset, GoogleAdsStatus } from "../types";

const PRESETS: Array<{ value: GoogleAdsDatePreset; label: string }> = [
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "CUSTOM", label: "Custom range" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
  },
  "& .MuiInputLabel-root": {
    color: "text.secondary",
  },
} as const;

export function GoogleAdsPage() {
  const token = useAppSelector(selectToken);
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState<GoogleAdsStatus | null>(null);
  const [analytics, setAnalytics] = useState<GoogleAdsAnalyticsSummary | null>(null);
  const [preset, setPreset] = useState<GoogleAdsDatePreset>("LAST_30_DAYS");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthBanner, setOauthBanner] = useState<{
    connected: boolean;
    error: string | null;
  }>({ connected: false, error: null });

  const canViewAnalytics =
    user?.subscription?.tier === "MEDIUM" || user?.subscription?.tier === "PREMIUM";

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [statusRes, analyticsRes] = await Promise.all([
        api.getGoogleAdsStatus(token),
        api.getGoogleAdsAnalytics(token, {
          preset,
          from: preset === "CUSTOM" ? from : undefined,
          to: preset === "CUSTOM" ? to : undefined,
        }),
      ]);
      setStatus(statusRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Google Ads analytics");
    } finally {
      setLoading(false);
    }
  }, [token, preset, from, to]);

  useEffect(() => {
    if (!token || authLoading) return;
    void loadData();
  }, [token, authLoading, loadData]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const oauthError = searchParams.get("oauth_error");
    if (!connected && !oauthError) return;

    setOauthBanner({
      connected: connected === "true",
      error: oauthError,
    });

    const next = new URLSearchParams(searchParams);
    next.delete("connected");
    next.delete("oauth_error");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function handleConnect() {
    if (!token) return;
    setConnecting(true);
    setError(null);
    try {
      const { authUrl } = await api.getGoogleAdsConnectUrl(token);
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start Google Ads connect");
      setConnecting(false);
    }
  }

  async function handleSync() {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      const data = await api.syncGoogleAds(token, {
        preset,
        from: preset === "CUSTOM" ? from : undefined,
        to: preset === "CUSTOM" ? to : undefined,
      });
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!token || !analytics?.account) return;
    if (!window.confirm("Disconnect Google Ads account?")) return;

    try {
      await api.disconnectGoogleAdsAccount(token, analytics.account.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    }
  }

  if (loading || authLoading) {
    return <PageStateLoader label="Loading Google Ads..." />;
  }

  return (
    <Box sx={{ fontFamily: dashboardFonts.body, width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            Google Ads
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mt: 0.75 }}>
            Account &amp; campaign metrics — impressions, clicks, cost, conversions, CTR
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} flexShrink={0} alignItems="center">
          {analytics?.account ? (
            <>
              <PageHeaderButton
                variant="outlined"
                onClick={() => void handleSync()}
                disabled={syncing || !canViewAnalytics}
                startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
              >
                {syncing ? "Syncing..." : "Sync now"}
              </PageHeaderButton>
              <Button
                color="error"
                variant="text"
                onClick={() => void handleDisconnect()}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
              >
                Disconnect
              </Button>
            </>
          ) : status?.configured ? (
            <PageHeaderButton
              variant="primary"
              onClick={() => void handleConnect()}
              disabled={connecting || !canViewAnalytics}
            >
              {connecting ? "Redirecting..." : "Connect Google Ads"}
            </PageHeaderButton>
          ) : null}
        </Stack>
      </Stack>

      {!canViewAnalytics && (
        <NoticeBanner>
          Google Ads analytics requires a Medium or Premium plan.
        </NoticeBanner>
      )}

      {oauthBanner.error && (
        <NoticeBanner tone="error">Connection failed: {oauthBanner.error}</NoticeBanner>
      )}

      {oauthBanner.connected && (
        <NoticeBanner tone="success">Google Ads account connected successfully.</NoticeBanner>
      )}

      {error && <NoticeBanner tone="error">{error}</NoticeBanner>}

      {analytics?.account && !analytics.lastSyncedAt && (
        <NoticeBanner>
          Account linked. Sync needs a Basic Access developer token for real Ads accounts. Your
          Basic Access application is pending (~5 business days) — Sync will work after Google
          approves it. Until then zeros / sync errors are expected.
        </NoticeBanner>
      )}

      {!status?.configured && (
        <Box
          sx={{
            ...glassPanelSx,
            mb: 2.25,
            p: { xs: 2, sm: 2.5 },
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "warning.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(230,164,45,0.1)" : "rgba(230,164,45,0.08)",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14.5, mb: 0.75 }}>
            Server not configured
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.55, maxWidth: 640 }}>
            Add these keys to backend <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12.5 }}>.env</Box>
            , then restart the API:{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12 }}>
              GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN,
              GOOGLE_ADS_REDIRECT_URI
            </Box>
            . See docs/GOOGLE_ADS_SETUP.md.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          ...glassPanelSx,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: { xs: 2, sm: 2.25 },
          mb: 2.25,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ width: "100%" }}
        >
          <TextField
            select
            size="small"
            label="Date range"
            value={preset}
            onChange={(e) => setPreset(e.target.value as GoogleAdsDatePreset)}
            fullWidth={false}
            sx={{ width: 200, flexShrink: 0, ...fieldSx }}
          >
            {PRESETS.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          {preset === "CUSTOM" && (
            <>
              <TextField
                size="small"
                type="date"
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                fullWidth={false}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 160, ...fieldSx }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                fullWidth={false}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 160, ...fieldSx }}
              />
            </>
          )}

          <PageHeaderButton
            variant="primary"
            onClick={() => void loadData()}
            disabled={loading}
            sx={{ flexShrink: 0 }}
          >
            Apply
          </PageHeaderButton>
        </Stack>

        {analytics?.account && (
          <Typography color="text.secondary" sx={{ fontSize: 13, mt: 2 }}>
            Account: {analytics.account.customerName ?? analytics.account.customerId}
            {analytics.lastSyncedAt
              ? ` · Last synced ${new Date(analytics.lastSyncedAt).toLocaleString()}`
              : " · Not synced yet"}
          </Typography>
        )}
      </Box>

      {analytics?.account && (
        <>
          <Box
            sx={{
              ...glassPanelSx,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              p: { xs: 2, sm: 2.5 },
              mb: 2.25,
            }}
          >
            <Typography
              sx={{
                fontFamily: dashboardFonts.heading,
                fontSize: 15.5,
                fontWeight: 600,
                mb: 2,
              }}
            >
              Summary ({analytics.from} → {analytics.to})
            </Typography>
            <GoogleAdsStatsGrid totals={analytics.totals} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2.25,
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              mb: 2.25,
            }}
          >
            <ChartCard title="Clicks" daily={analytics.daily} metric="clicks" />
            <ChartCard title="Cost" daily={analytics.daily} metric="cost" />
          </Box>

          <Box
            sx={{
              ...glassPanelSx,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Typography
              sx={{
                fontFamily: dashboardFonts.heading,
                fontSize: 15.5,
                fontWeight: 600,
                px: 2.5,
                pt: 2.5,
                pb: 1.5,
              }}
            >
              Campaigns
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderColor: "divider", fontWeight: 600 }}>Campaign</TableCell>
                  <TableCell align="right" sx={{ borderColor: "divider", fontWeight: 600 }}>
                    Impressions
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "divider", fontWeight: 600 }}>
                    Clicks
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "divider", fontWeight: 600 }}>
                    CTR
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "divider", fontWeight: 600 }}>
                    Cost
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "divider", fontWeight: 600 }}>
                    Conversions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.topCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ borderColor: "divider" }}>
                      <Typography color="text.secondary" sx={{ fontSize: 13, py: 2 }}>
                        No campaign data. Click Sync now to fetch from Google Ads API.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.topCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign.campaignId}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                      }}
                    >
                      <TableCell sx={{ borderColor: "divider" }}>{campaign.campaignName}</TableCell>
                      <TableCell align="right" sx={{ borderColor: "divider" }}>
                        {campaign.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: "divider" }}>
                        {campaign.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: "divider" }}>
                        {campaign.ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: "divider" }}>
                        ${campaign.cost.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: "divider" }}>
                        {campaign.conversions.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      {!analytics?.account && canViewAnalytics && status?.configured && (
        <Box
          sx={{
            ...glassPanelSx,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 600, mb: 1 }}>
            No Google Ads account linked
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mb: 2.5, maxWidth: 420, mx: "auto" }}>
            Connect your Google Ads account to sync impressions, clicks, cost, and campaign performance.
          </Typography>
          <PageHeaderButton
            variant="primary"
            onClick={() => void handleConnect()}
            disabled={connecting}
          >
            {connecting ? "Redirecting..." : "Connect Google Ads"}
          </PageHeaderButton>
        </Box>
      )}
    </Box>
  );
}

function NoticeBanner({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error" | "success";
}) {
  const colors =
    tone === "error"
      ? { border: "error.main", bg: "rgba(240,68,56,0.12)", text: "error.main" }
      : tone === "success"
        ? { border: "success.main", bg: "rgba(44,192,140,0.12)", text: "success.main" }
        : { border: "divider", bg: "rgba(91,95,239,0.1)", text: "text.primary" };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: colors.border,
        bgcolor: colors.bg,
      }}
    >
      <Typography sx={{ fontSize: 13.5, color: colors.text }}>{children}</Typography>
    </Box>
  );
}

function ChartCard({
  title,
  daily,
  metric,
}: {
  title: string;
  daily: GoogleAdsAnalyticsSummary["daily"];
  metric: "clicks" | "cost";
}) {
  return (
    <Box
      sx={{
        ...glassPanelSx,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: 2.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: dashboardFonts.heading,
          fontSize: 14.5,
          fontWeight: 600,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <GoogleAdsChart daily={daily} metric={metric} />
    </Box>
  );
}
