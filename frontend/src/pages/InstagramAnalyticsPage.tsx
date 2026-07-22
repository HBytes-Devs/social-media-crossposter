import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";
import { PageHeaderButton } from "../components/ui/PageHeaderButton";
import { PageHeader } from "../components/ui/PageHeader";
import { glassPanelSx } from "../theme/glassSurface";
import { dashboardFonts } from "../components/dashboard/dashboardTheme";

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  label,
  metric,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  metric: string;
  gradient: string;
}) {
  return (
    <Box
      sx={{
        ...glassPanelSx,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${gradient} 0%, transparent 60%)`,
          opacity: 0.07,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {icon}
      </Box>
      <Chip label="Coming soon" size="small" sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.08)", fontSize: 10.5, height: 20, fontWeight: 600 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 22, fontFamily: dashboardFonts.heading, color: "text.disabled", letterSpacing: "-0.3px" }}>
        {metric}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.secondary", fontFamily: dashboardFonts.body }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Roadmap item ─────────────────────────────────────────────────────────────

function RoadmapItem({ label, description }: { label: string; description: string }) {
  return (
    <Box sx={{ display: "flex", gap: 2, py: 1.75, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: "none" } }}>
      <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", bgcolor: "rgba(228,64,95,0.6)", mt: 0.75 }} />
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 13.5, fontFamily: dashboardFonts.body }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25, lineHeight: 1.55 }}>{description}</Typography>
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InstagramAnalyticsPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ fontFamily: dashboardFonts.body, width: "100%", minWidth: 0 }}>
      <PageHeader
        title={
          <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #f58529, #e4405f, #833ab4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InsightsOutlinedIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography
              sx={{ fontFamily: dashboardFonts.heading, fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px" }}
            >
              Instagram Analytics
            </Typography>
            <Chip
              label="Coming soon"
              size="small"
              sx={{
                background: "linear-gradient(135deg, #f58529, #e4405f)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 10.5,
                height: 22,
              }}
            />
          </Stack>
        }
        subtitle="Post reach, impressions, engagement, saves & follower insights"
        actions={
          <>
            <PageHeaderButton variant="outlined" onClick={() => navigate("/accounts")}>
              Manage accounts
            </PageHeaderButton>
            <PageHeaderButton variant="outlined" onClick={() => navigate("/compose")}>
              Compose post
            </PageHeaderButton>
          </>
        }
      />

      {/* Hero banner */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          mb: 2.5,
          background: "linear-gradient(135deg, rgba(245,133,41,0.15) 0%, rgba(228,64,95,0.15) 50%, rgba(131,58,180,0.15) 100%)",
          border: "1px solid rgba(228,64,95,0.25)",
          p: { xs: "28px 24px", sm: "36px 40px" },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={3}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #f58529, #e4405f, #833ab4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 16px 40px -12px rgba(228,64,95,0.45)",
            }}
          >
            <PhotoCameraOutlinedIcon sx={{ fontSize: 38, color: "#fff" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 700, fontSize: 20, mb: 0.75 }}>
              Instagram analytics is coming to SMC
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 14, lineHeight: 1.65, maxWidth: 520 }}>
              We're building full Instagram post insights — reach, impressions, profile visits, saves, and engagement rate —
              all inside your SMC dashboard. Instagram is already connected for publishing; analytics is the next step.
            </Typography>
          </Box>
          <PageHeaderButton
            variant="primary"
            onClick={() => window.open("https://developer.instagram.com", "_blank")}
            sx={{ flexShrink: 0 }}
          >
            Instagram for Developers <OpenInNewOutlinedIcon sx={{ fontSize: 14, ml: 0.5 }} />
          </PageHeaderButton>
        </Stack>
      </Box>

      {/* Preview metric cards */}
      <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 600, fontSize: 15, mb: 1.75, color: "text.secondary" }}>
        Metrics you'll be able to track
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
          gap: 2,
          mb: 2.5,
        }}
      >
        <FeatureCard icon={<TrendingUpOutlinedIcon />} label="Reach" metric="—" gradient="linear-gradient(135deg,#f58529,#e4405f)" />
        <FeatureCard icon={<InsightsOutlinedIcon />} label="Impressions" metric="—" gradient="linear-gradient(135deg,#e4405f,#c13584)" />
        <FeatureCard icon={<FavoriteOutlinedIcon />} label="Likes" metric="—" gradient="linear-gradient(135deg,#c13584,#833ab4)" />
        <FeatureCard icon={<ChatBubbleOutlineOutlinedIcon />} label="Comments" metric="—" gradient="linear-gradient(135deg,#833ab4,#5851db)" />
        <FeatureCard icon={<SaveOutlinedIcon />} label="Saves" metric="—" gradient="linear-gradient(135deg,#5851db,#405de6)" />
        <FeatureCard icon={<BookmarkOutlinedIcon />} label="Profile visits" metric="—" gradient="linear-gradient(135deg,#405de6,#833ab4)" />
      </Box>

      {/* Two-column: roadmap + what's live */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.25,
          mb: 2.25,
        }}
      >
        {/* Roadmap */}
        <Box
          sx={{
            ...glassPanelSx,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: "20px", py: "18px", borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <BarChartOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 600, fontSize: 15.5 }}>
                Analytics roadmap
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ px: "20px", py: "8px" }}>
            <RoadmapItem label="Phase 1 — Post insights" description="Reach, impressions, likes, comments and saves for each post published through SMC." />
            <RoadmapItem label="Phase 2 — Story analytics" description="Story views, exits, and tap-forward metrics." />
            <RoadmapItem label="Phase 3 — Reel performance" description="Play count, average watch time, and engagement rate for Reels." />
            <RoadmapItem label="Phase 4 — Audience insights" description="Follower growth, demographics, and top-performing hours." />
            <RoadmapItem label="Phase 5 — Instagram Ads" description="Paid campaign metrics — spend, reach, CTR, conversions — alongside organic." />
          </Box>
        </Box>

        {/* What's live today */}
        <Box
          sx={{
            ...glassPanelSx,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: "20px", py: "18px", borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <PhotoCameraOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography sx={{ fontFamily: dashboardFonts.heading, fontWeight: 600, fontSize: 15.5 }}>
                What's live today
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ p: "16px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Instagram Business account connect", done: true },
              { label: "Publish image posts to Instagram", done: true },
              { label: "Cross-post from one SMC compose screen", done: true },
              { label: "Instagram post analytics in dashboard", done: false },
              { label: "Reel + Story publishing", done: false },
              { label: "Instagram Ads reporting", done: false },
            ].map(({ label, done }) => (
              <Stack key={label} direction="row" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: done ? "rgba(44,192,140,0.2)" : "rgba(255,255,255,0.06)",
                    border: "1.5px solid",
                    borderColor: done ? "success.main" : "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {done && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />}
                </Box>
                <Typography sx={{ fontSize: 13.5, fontFamily: dashboardFonts.body, color: done ? "text.primary" : "text.secondary" }}>
                  {label}
                </Typography>
                {done && (
                  <Chip label="Live" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(44,192,140,0.15)", color: "success.main", fontWeight: 700 }} />
                )}
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom note */}
      <Box
        sx={{
          ...glassPanelSx,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: "18px 22px",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
          Already publishing to Instagram?
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.7 }}>
          Your Instagram Business account is already connected via Meta OAuth. When analytics launches,
          SMC will automatically track performance for all posts published through the platform — no reconnection needed.
          Make sure your Instagram account is linked to a Facebook Business Page (Meta requirement for insights API).
        </Typography>
        <Stack direction="row" gap={1.25} sx={{ mt: 2 }}>
          <PageHeaderButton variant="primary" onClick={() => navigate("/compose")}>
            Compose & publish now
          </PageHeaderButton>
          <PageHeaderButton variant="outlined" onClick={() => navigate("/accounts")}>
            Check account status
          </PageHeaderButton>
        </Stack>
      </Box>
    </Box>
  );
}
