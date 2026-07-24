import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  OpsAlert,
  OpsKpiCard,
  OpsLoading,
  OpsPage,
  OpsPanel,
  OpsStatusChip,
  OpsTierBars,
  opsFonts,
} from "../../components/ops/OpsUi";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsOverview } from "../../types";

const quickLinks = [
  { to: "/ops/errors", label: "Review errors", detail: "Last 24h system failures" },
  { to: "/ops/issues", label: "Triage issues", detail: "Open support & publish flags" },
  { to: "/ops/access", label: "Manage access", detail: "Roles, tiers, suspensions" },
  { to: "/ops/earnings", label: "View earnings", detail: "Estimated MRR breakdown" },
];

export function OpsOverviewPage() {
  const { token } = useAppSelector(selectAuth);
  const [data, setData] = useState<OpsOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .opsOverview(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <OpsLoading />;
  if (error) return <OpsAlert>{error}</OpsAlert>;
  if (!data) return null;

  const healthTone =
    data.errors24h > 20 ? "danger" : data.errors24h > 0 || data.openIssues > 0 ? "warning" : "success";

  return (
    <OpsPage>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: opsFonts.heading,
              fontSize: 26,
              fontWeight: 740,
              letterSpacing: "-0.45px",
            }}
          >
            Command center
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mt: 0.4 }}>
            Snapshot of accounts, revenue estimate, and operational risk.
          </Typography>
        </Box>
        <OpsStatusChip
          label={
            healthTone === "success"
              ? "Systems nominal"
              : healthTone === "warning"
                ? "Attention needed"
                : "Elevated errors"
          }
          tone={healthTone}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
        }}
      >
        <OpsKpiCard
          label="Total users"
          value={data.usersTotal}
          hint={`${data.admins} admins · ${data.superAdmins} super`}
          icon={<PeopleOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Paid accounts"
          value={data.paidUsers}
          hint="Active MEDIUM / PREMIUM"
          tone="accent"
          icon={<PaymentsOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Estimated MRR"
          value={`$${data.estimatedMrr.toLocaleString()}`}
          hint="USD / month · plan prices"
          tone="success"
          icon={<PaymentsOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Posts today"
          value={data.postsToday}
          hint="Created across all users"
          icon={<ArticleOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Open issues"
          value={data.openIssues}
          tone={data.openIssues > 0 ? "warning" : "neutral"}
          hint="OPEN + IN_PROGRESS"
          icon={<ReportProblemOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Errors · 24h"
          value={data.errors24h}
          tone={data.errors24h > 0 ? "danger" : "success"}
          hint="Persisted system / API errors"
          icon={<BugReportOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Admin seats"
          value={data.admins + data.superAdmins}
          hint="Privileged operators"
          icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
        />
        <OpsKpiCard
          label="Free tier"
          value={data.tierDistribution.FREE}
          hint={`${data.tierDistribution.MEDIUM} medium · ${data.tierDistribution.PREMIUM} premium`}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
        }}
      >
        <OpsPanel title="Plan mix" subtitle="Effective tier distribution across users">
          <Box sx={{ p: 2.25 }}>
            <OpsTierBars
              free={data.tierDistribution.FREE}
              medium={data.tierDistribution.MEDIUM}
              premium={data.tierDistribution.PREMIUM}
            />
          </Box>
        </OpsPanel>

        <OpsPanel title="Quick actions" subtitle="Jump to operational queues">
          <Box sx={{ p: 0.75 }}>
            {quickLinks.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ borderRadius: 1.5, py: 1.1, mb: 0.25 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 650 }}>{link.label}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    {link.detail}
                  </Typography>
                </Box>
                <ArrowForwardIosIcon sx={{ fontSize: 12, color: "text.secondary" }} />
              </ListItemButton>
            ))}
          </Box>
        </OpsPanel>
      </Box>
    </OpsPage>
  );
}
