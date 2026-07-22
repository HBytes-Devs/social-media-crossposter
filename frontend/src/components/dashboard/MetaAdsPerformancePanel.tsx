import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { MetaAdsChart } from "../analytics/MetaAdsChart";
import { MetaAdsStatsGrid } from "../analytics/MetaAdsStatsGrid";
import { glassPanelSx } from "../../theme/glassSurface";
import { dashboardFonts } from "./dashboardTheme";
import type { MetaAdsAnalyticsSummary } from "../../types";

type Props = {
  analytics: MetaAdsAnalyticsSummary | null;
  analyticsLocked?: boolean;
};

export function MetaAdsPerformancePanel({
  analytics,
  analyticsLocked = false,
}: Props) {
  const navigate = useNavigate();

  const connected = Boolean(analytics?.account);
  const hasData =
    !analyticsLocked &&
    connected &&
    (analytics?.totals.impressions ?? 0) + (analytics?.totals.clicks ?? 0) > 0;

  return (
    <Box
      sx={{
        ...glassPanelSx,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: "24px 26px",
        mb: 2.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 16.5,
              fontWeight: 600,
            }}
          >
            Meta Ads performance
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
            {analytics?.account?.adAccountName ?? analytics?.account?.adAccountId ?? "Connect Meta Ads for campaign analytics"}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate("/meta-ads")}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {connected ? "View details" : "Connect Meta Ads"}
        </Button>
      </Box>

      {analyticsLocked ? (
        <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
          Meta Ads analytics is available on Medium and Premium plans.
        </Typography>
      ) : !connected ? (
        <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
          Link your Meta Ads account to see impressions, clicks, spend, conversions, and CTR.
        </Typography>
      ) : hasData ? (
        <>
          <MetaAdsStatsGrid totals={analytics!.totals} compact />
          <Box sx={{ mt: 2.5 }}>
            <MetaAdsChart daily={analytics!.daily} metric="clicks" height={160} />
          </Box>
          {analytics!.topCampaigns.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Top campaigns
              </Typography>
              {analytics!.topCampaigns.slice(0, 3).map((campaign) => (
                <Box
                  key={campaign.campaignId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontSize: 13 }}>{campaign.campaignName}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                    ${campaign.cost.toFixed(2)} · {campaign.clicks.toLocaleString()} clicks
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : (
        <Box>
          <Typography color="text.secondary" sx={{ fontSize: 13.5, mb: 1.5 }}>
            Account connected. Sync data to load metrics.
          </Typography>
          <Link component={RouterLink} to="/meta-ads" sx={{ fontWeight: 600, fontSize: 13 }}>
            Open Meta Ads analytics →
          </Link>
        </Box>
      )}
    </Box>
  );
}
