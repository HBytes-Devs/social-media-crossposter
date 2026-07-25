import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AnalyticsDashboardHeader } from "../components/dashboard/analytics/AnalyticsDashboardHeader";
import { AnalyticsStatCard } from "../components/dashboard/analytics/AnalyticsStatCard";
import { DeviceBarChart } from "../components/dashboard/analytics/DeviceBarChart";
import { StatisticLineChart } from "../components/dashboard/analytics/StatisticLineChart";
import {
  TopPerformanceTable,
  type CampaignRow,
} from "../components/dashboard/analytics/TopPerformanceTable";
import { VisitorsPanel, type VisitorRow } from "../components/dashboard/analytics/VisitorsPanel";
import { useAnalyticsTheme } from "../components/dashboard/analytics/analyticsTheme";
import { PageStateLoader } from "../components/ui/PageState";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth, selectToken } from "../store/slices/authSlice";
import type { DashboardData } from "../types";

const MONTHS_LINE = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_BAR = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const DEMO_CLICK = [3.2, 4.1, 5.8, 4.6, 8.0, 6.2, 5.1, 7.4];
const DEMO_OPEN = [5.0, 6.2, 5.4, 7.1, 6.0, 7.8, 6.5, 8.2];
const DEMO_COMPUTER = [42, 55, 38, 48, 65, 50, 44];
const DEMO_MOBILE = [28, 35, 40, 32, 38, 45, 30];

const DEMO_CAMPAIGNS: CampaignRow[] = [
  {
    id: "1",
    date: "1 Aug 2026",
    email: "jaxxon@email.com",
    sent: "1,240",
    clickRate: "42.18%",
    openRate: "68.40%",
    spamRate: "0.12%",
    clickTone: "good",
    openTone: "good",
  },
  {
    id: "2",
    date: "4 Aug 2026",
    email: "amina@studio.io",
    sent: "980",
    clickRate: "31.05%",
    openRate: "54.20%",
    spamRate: "0.28%",
    clickTone: "neutral",
    openTone: "good",
  },
  {
    id: "3",
    date: "9 Aug 2026",
    email: "leo@brand.co",
    sent: "2,110",
    clickRate: "48.62%",
    openRate: "71.15%",
    spamRate: "0.08%",
    clickTone: "good",
    openTone: "good",
  },
  {
    id: "4",
    date: "14 Aug 2026",
    email: "sara@growth.app",
    sent: "760",
    clickRate: "22.40%",
    openRate: "41.90%",
    spamRate: "1.05%",
    clickTone: "bad",
    openTone: "bad",
  },
  {
    id: "5",
    date: "21 Aug 2026",
    email: "noah@agency.dev",
    sent: "1,540",
    clickRate: "39.88%",
    openRate: "62.70%",
    spamRate: "0.19%",
    clickTone: "neutral",
    openTone: "good",
  },
];

const DEMO_VISITORS: VisitorRow[] = [
  { id: "sg", country: "Singapore", flag: "🇸🇬", changePct: 23, bars: [4, 6, 5, 8, 7, 9, 6] },
  { id: "th", country: "Thailand", flag: "🇹🇭", changePct: 12, bars: [3, 5, 4, 6, 5, 7, 5] },
  { id: "bn", country: "Brunei", flag: "🇧🇳", changePct: -8, bars: [5, 4, 6, 3, 4, 5, 3] },
  { id: "de", country: "Germany", flag: "🇩🇪", changePct: 16, bars: [4, 5, 7, 6, 8, 7, 9] },
];

function formatDateRange() {
  return "1 Aug 2026 - 1 Sep 2026";
}

function pct(n: number, digits = 2) {
  return `${n.toFixed(digits)}%`;
}

function buildCampaignRows(data: DashboardData): CampaignRow[] {
  const source = [...data.recent, ...data.upcoming].slice(0, 6);
  if (source.length === 0) return DEMO_CAMPAIGNS;

  return source.map((post, i) => {
    const dateSrc = post.publishedAt ?? post.scheduledFor ?? post.createdAt;
    const date = new Date(dateSrc).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const click = 22 + ((i * 7) % 28);
    const open = 40 + ((i * 9) % 35);
    const spam = 0.08 + (i % 4) * 0.2;
    return {
      id: post.id,
      date,
      email: (post.content || post.finalContent || `post-${i + 1}@smc.app`).slice(0, 28),
      sent: String(120 + i * 85),
      clickRate: pct(click, 2),
      openRate: pct(open, 2),
      spamRate: pct(spam, 2),
      clickTone: click >= 40 ? "good" : click < 25 ? "bad" : "neutral",
      openTone: open >= 55 ? "good" : open < 45 ? "bad" : "neutral",
    };
  });
}

export function DashboardPage() {
  const a = useAnalyticsTheme();
  const token = useAppSelector(selectToken);
  const { user, loading: authLoading } = useAppSelector(selectAuth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const canViewAnalytics =
    user?.subscription?.tier === "MEDIUM" || user?.subscription?.tier === "PREMIUM";

  useEffect(() => {
    if (!token || authLoading) return;
    setLoading(true);
    api
      .getDashboard(token, { analytics: canViewAnalytics })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token, authLoading, canViewAnalytics]);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const stats = useMemo(() => {
    const published = data?.posts.published ?? 2981;
    const scheduled = data?.posts.scheduled ?? 0;
    const failed = data?.posts.failed ?? 0;
    const openRate = Math.min(92, 48 + (published % 30) + scheduled * 0.4);
    const clickRate = Math.min(70, 28 + (published % 20) + scheduled * 0.25);
    const unsubRate = Math.min(18, 2 + failed * 1.2 + (published % 7) * 0.3);

    return {
      sent: published.toLocaleString(),
      open: pct(openRate),
      click: pct(clickRate),
      unsub: pct(unsubRate),
      openChange: openRate >= 60 ? -14 : 9,
      clickChange: clickRate >= 35 ? 21 : -6,
      unsubChange: unsubRate >= 8 ? 15 : -4,
      sentChange: 19,
    };
  }, [data]);

  const campaigns = useMemo(
    () => (data ? buildCampaignRows(data) : DEMO_CAMPAIGNS),
    [data],
  );

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (r) => r.email.toLowerCase().includes(q) || r.date.toLowerCase().includes(q),
    );
  }, [campaigns, search]);

  if (loading || authLoading) {
    return <PageStateLoader label="Loading dashboard..." />;
  }

  if (error && !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const exportCsv = () => {
    const header = "Date,Email,Sent,Click Rate,Open Rate,Spam Rate";
    const lines = filteredCampaigns.map(
      (r) => `${r.date},${r.email},${r.sent},${r.clickRate},${r.openRate},${r.spamRate}`,
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        fontFamily: a.font,
        color: a.text,
        bgcolor: a.pageBg,
        borderRadius: { xs: "16px", md: "24px" },
        border: `1px solid ${a.border}`,
        p: { xs: 2, sm: 2.5, lg: 3 },
        mx: { xs: -0.5, sm: -1, lg: -1.5 },
        mb: { xs: -1, lg: -2 },
        minHeight: { md: "calc(100vh - 48px)" },
        transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
      }}
    >
      <AnalyticsDashboardHeader
        search={search}
        onSearchChange={setSearch}
        dateLabel={formatDateRange()}
        displayName={displayName}
        email={user?.email}
        initials={initials || "U"}
        onExport={exportCsv}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          mb: 2.25,
        }}
      >
        <AnalyticsStatCard
          label="Email Sent"
          value={stats.sent}
          changePct={stats.sentChange}
          sparkline={[12, 18, 14, 22, 20, 28, 24, 32]}
          tone="up"
          sparkColor={a.blue}
        />
        <AnalyticsStatCard
          label="Open Rate"
          value={stats.open}
          changePct={stats.openChange}
          sparkline={[30, 28, 26, 24, 22, 20, 18, 16]}
          tone="down"
          sparkColor={a.danger}
        />
        <AnalyticsStatCard
          label="Click Rate"
          value={stats.click}
          changePct={stats.clickChange}
          sparkline={[10, 14, 12, 18, 16, 22, 20, 26]}
          tone="up"
          sparkColor={a.blue}
        />
        <AnalyticsStatCard
          label="Unsubscribe Rate"
          value={stats.unsub}
          changePct={stats.unsubChange}
          sparkline={[8, 10, 9, 12, 11, 14, 13, 16]}
          tone="down"
          sparkColor={a.danger}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(0, 1fr)" },
          mb: 2.25,
          alignItems: "stretch",
        }}
      >
        <StatisticLineChart
          months={MONTHS_LINE}
          series={[
            { label: "Click Rate", color: a.purple, values: DEMO_CLICK },
            { label: "Open Rate", color: a.cyan, values: DEMO_OPEN },
          ]}
          tooltip={{ monthIndex: 4, seriesIndex: 0, text: "8%" }}
        />
        <DeviceBarChart
          months={MONTHS_BAR}
          computer={DEMO_COMPUTER}
          mobile={DEMO_MOBILE}
          tooltip={{ monthIndex: 4, series: "computer", text: "65%" }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.7fr) minmax(0, 1fr)" },
          alignItems: "stretch",
        }}
      >
        <TopPerformanceTable rows={filteredCampaigns} onExport={exportCsv} />
        <VisitorsPanel rows={DEMO_VISITORS} activeId="sg" />
      </Box>
    </Box>
  );
}
