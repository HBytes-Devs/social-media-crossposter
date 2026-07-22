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
import { MetaAdsChart } from "../components/analytics/MetaAdsChart";
import { MetaAdsStatsGrid } from "../components/analytics/MetaAdsStatsGrid";
import { dashboardFonts } from "../components/dashboard/dashboardTheme";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageStateLoader } from "../components/ui/PageState";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth, selectToken } from "../store/slices/authSlice";
import { glassPanelSx } from "../theme/glassSurface";
import type { MetaAdsAnalyticsSummary, MetaAdsDatePreset, MetaAdsStatus } from "../types";

const PRESETS: Array<{ value: MetaAdsDatePreset; label: string }> = [
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

export function MetaAdsPage() {
  const token = useAppSelector(selectToken);
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState<MetaAdsStatus | null>(null);
  const [analytics, setAnalytics] = useState<MetaAdsAnalyticsSummary | null>(null);
  const [preset, setPreset] = useState<MetaAdsDatePreset>("LAST_30_DAYS");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [linking, setLinking] = useState(false);
  const [manualAdAccountId, setManualAdAccountId] = useState("");
  const [needsAdAccount, setNeedsAdAccount] = useState(false);
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
        api.getMetaAdsStatus(token),
        api.getMetaAdsAnalytics(token, {
          preset,
          from: preset === "CUSTOM" ? from : undefined,
          to: preset === "CUSTOM" ? to : undefined,
        }),
      ]);
      setStatus(statusRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Meta Ads analytics");
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
    const needsAccount = searchParams.get("needs_ad_account");

    if (needsAccount === "true") {
      setNeedsAdAccount(true);
    }

    if (!connected && !oauthError) {
      if (needsAccount === "true") {
        const next = new URLSearchParams(searchParams);
        next.delete("needs_ad_account");
        setSearchParams(next, { replace: true });
      }
      return;
    }

    setOauthBanner({
      connected: connected === "true",
      error: oauthError,
    });

    const next = new URLSearchParams(searchParams);
    next.delete("connected");
    next.delete("oauth_error");
    next.delete("needs_ad_account");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (status?.needsAdAccountId) {
      setNeedsAdAccount(true);
    }
  }, [status?.needsAdAccountId]);

  async function handleConnect() {
    if (!token) return;
    setConnecting(true);
    setError(null);
    try {
      const { authUrl } = await api.getMetaAdsConnectUrl(token);
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start Meta Ads connect");
      setConnecting(false);
    }
  }

  async function handleLinkAccount() {
    if (!token || !manualAdAccountId.trim()) return;
    setLinking(true);
    setError(null);
    try {
      await api.linkMetaAdsAccount(token, manualAdAccountId.trim());
      setNeedsAdAccount(false);
      setManualAdAccountId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link ad account");
    } finally {
      setLinking(false);
    }
  }

  async function handleSync() {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      const data = await api.syncMetaAds(token, {
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
    if (!window.confirm("Disconnect Meta Ads account?")) return;

    try {
      await api.disconnectMetaAdsAccount(token, analytics.account.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    }
  }

  if (loading || authLoading) {
    return <PageStateLoader label="Loading Meta Ads..." />;
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
            Meta Ads
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mt: 0.75 }}>
            Facebook &amp; Instagram ad metrics — impressions, clicks, spend, conversions, CTR
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
              {connecting ? "Redirecting..." : "Connect Meta Ads"}
            </PageHeaderButton>
          ) : null}
        </Stack>
      </Stack>

      {!canViewAnalytics && (
        <NoticeBanner>
          Meta Ads analytics requires a Medium or Premium plan.
        </NoticeBanner>
      )}

      {oauthBanner.error && (
        <NoticeBanner tone="error">Connection failed: {oauthBanner.error}</NoticeBanner>
      )}

      {oauthBanner.connected && (
        <NoticeBanner tone="success">Meta Ads account connected successfully.</NoticeBanner>
      )}

      {error && <NoticeBanner tone="error">{error}</NoticeBanner>}

      {(needsAdAccount || status?.needsAdAccountId) && (
        <Box
          sx={{
            ...glassPanelSx,
            mb: 2.25,
            p: { xs: 2, sm: 2.5 },
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "info.main",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.08)",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14.5, mb: 0.75 }}>
            Meta connected — enter your ad account ID
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.55, mb: 2 }}>
            OAuth succeeded but Meta did not return ad accounts automatically. Open{" "}
            <strong>Ads Manager</strong> and copy the account ID from the URL
            (for example <code>act_123456789</code>).
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <TextField
              size="small"
              label="Ad account ID"
              placeholder="act_123456789"
              value={manualAdAccountId}
              onChange={(e) => setManualAdAccountId(e.target.value)}
              sx={{ minWidth: 240, ...fieldSx }}
            />
            <PageHeaderButton
              variant="primary"
              onClick={() => void handleLinkAccount()}
              disabled={linking || !manualAdAccountId.trim()}
            >
              {linking ? "Linking..." : "Link account"}
            </PageHeaderButton>
          </Stack>
        </Box>
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
            Add{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12 }}>
              META_ADS_CONFIG_ID
            </Box>{" "}
            (Login for Business config with{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12 }}>
              ads_read
            </Box>{" "}
            +{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12 }}>
              business_management
            </Box>
            ) and{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12 }}>
              META_ADS_REDIRECT_URI
            </Box>{" "}
            to backend{" "}
            <Box component="span" sx={{ fontFamily: dashboardFonts.mono, fontSize: 12.5 }}>.env</Box>
            . See docs/META_ADS_SETUP.md.
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
            onChange={(e) => setPreset(e.target.value as MetaAdsDatePreset)}
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
            Account: {analytics.account.adAccountName ?? analytics.account.adAccountId}
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
            <MetaAdsStatsGrid totals={analytics.totals} />
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
            <ChartCard title="Spend" daily={analytics.daily} metric="cost" />
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
                    Spend
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
                        No campaign data. Click Sync now to fetch from Meta Marketing API.
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
            No Meta Ads account linked
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mb: 2.5, maxWidth: 420, mx: "auto" }}>
            Connect your Meta ad account to sync impressions, clicks, spend, and campaign performance.
          </Typography>
          <PageHeaderButton
            variant="primary"
            onClick={() => void handleConnect()}
            disabled={connecting}
          >
            {connecting ? "Redirecting..." : "Connect Meta Ads"}
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
  daily: MetaAdsAnalyticsSummary["daily"];
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
      <MetaAdsChart daily={daily} metric={metric} />
    </Box>
  );
}
