import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

/**
 * Buffer core features — 2×2 cards (screenshot match):
 * colored mock header on top + white text block below.
 */

function MockWindow({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {title ? (
        <Typography sx={{ px: 1.5, pt: 1.25, pb: 0.5, fontSize: 12, fontWeight: 700, color: landing.ink }}>
          {title}
        </Typography>
      ) : null}
      <Box sx={{ px: 1.5, pb: 1.5 }}>{children}</Box>
    </Box>
  );
}

function PublishMock() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="stretch" sx={{ height: "100%" }}>
      <Box sx={{ flex: 1.2, minWidth: 0 }}>
        <MockWindow title="Create Post">
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            {["#0A66C2", "#E4405F", "#1877F2", "#111"].map((c) => (
              <Box key={c} sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: c }} />
            ))}
          </Stack>
          <Box sx={{ bgcolor: "#F5F5F5", borderRadius: 1.5, p: 1.25, minHeight: 72, mb: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: landing.ink, lineHeight: 1.4 }}>
              Registration opens this Sunday!
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {["Pineapple", "Sourdough", "Topping"].map((t) => (
              <Box
                key={t}
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 99,
                  bgcolor: "#EEF2FF",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#4338CA",
                }}
              >
                {t}
              </Box>
            ))}
          </Stack>
        </MockWindow>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <MockWindow title="January 2026">
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.4 }}>
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const active = day === 21;
              return (
                <Box
                  key={day}
                  sx={{
                    height: 18,
                    borderRadius: 0.75,
                    fontSize: 9,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: active ? landing.green : "transparent",
                    color: active ? "#fff" : landing.soft,
                  }}
                >
                  {day}
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              mt: 1,
              display: "inline-flex",
              bgcolor: landing.green,
              color: "#fff",
              px: 1,
              py: 0.4,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            3:00 PM
          </Box>
          <Box
            sx={{
              mt: 1,
              bgcolor: landing.green,
              color: "#fff",
              textAlign: "center",
              borderRadius: 1.5,
              py: 0.75,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Schedule Posts
          </Box>
        </MockWindow>
      </Box>
    </Stack>
  );
}

function CreateMock() {
  return (
    <Box sx={{ position: "relative", height: "100%", minHeight: 200 }}>
      <Stack direction="row" spacing={1} sx={{ opacity: 0.55, height: "100%" }}>
        {["Todo", "Review"].map((col) => (
          <Box key={col} sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 0.75, color: landing.ink }}>{col}</Typography>
            <Stack spacing={0.75}>
              {[0, 1].map((n) => (
                <Box key={n} sx={{ bgcolor: "#fff", borderRadius: 1.5, p: 0.75, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                  <Box sx={{ height: 36, borderRadius: 1, bgcolor: n ? "#FDE68A" : "#BBF7D0", mb: 0.5 }} />
                  <Box sx={{ height: 8, width: "70%", bgcolor: "#E5E7EB", borderRadius: 1 }} />
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "88%",
          maxWidth: 280,
          bgcolor: "#fff",
          borderRadius: 2.5,
          p: 2,
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 1.5 }}>Generate Ideas</Typography>
        <Typography sx={{ fontSize: 10, color: landing.soft, mb: 0.35 }}>What is your business about?</Typography>
        <Box sx={{ bgcolor: "#F5F5F5", borderRadius: 1, px: 1, py: 0.75, mb: 1, fontSize: 11, fontWeight: 600 }}>
          A training and fitness brand
        </Box>
        <Typography sx={{ fontSize: 10, color: landing.soft, mb: 0.35 }}>What is your target audience?</Typography>
        <Box sx={{ bgcolor: "#F5F5F5", borderRadius: 1, px: 1, py: 0.75, mb: 1.5, fontSize: 11, fontWeight: 600 }}>
          Busy working professionals worldwide
        </Box>
        <Box
          sx={{
            bgcolor: landing.green,
            color: "#fff",
            textAlign: "center",
            borderRadius: 1.5,
            py: 1,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Generate Ideas
        </Box>
      </Box>
    </Box>
  );
}

function CommunityMock() {
  return (
    <MockWindow title="Inbox">
      <Stack spacing={1}>
        {["Nice post!", "When is the next drop?", "Love this 🔥"].map((t, i) => (
          <Stack key={t} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: ["#C4B5FD", "#86EFAC", "#FCD34D"][i] }} />
            <Box sx={{ flex: 1, bgcolor: "#F5F5F5", borderRadius: 1.5, px: 1.25, py: 0.85 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{t}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </MockWindow>
  );
}

function InsightsMock() {
  return (
    <MockWindow title="All channels">
      <Stack direction="row" spacing={1} sx={{ mb: 1.25 }}>
        {["12.4k", "3.8k", "4.2%"].map((v) => (
          <Box key={v} sx={{ flex: 1, bgcolor: "#F5F5F5", borderRadius: 1.5, py: 1, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{v}</Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ height: 90, borderRadius: 1.5, bgcolor: "#F5F5F5", position: "relative", overflow: "hidden" }}>
        <Box component="svg" viewBox="0 0 220 80" sx={{ width: "100%", height: "100%" }}>
          <polyline fill="none" stroke={landing.green} strokeWidth="3" points="0,55 40,48 80,52 120,28 160,34 220,18" />
        </Box>
      </Box>
    </MockWindow>
  );
}

const CARDS = [
  {
    eyebrow: "PUBLISH",
    title: "The most complete set of publishing integrations, ever",
    body: "Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon and X.",
    headerBg: "#EAD8FC",
    mock: <PublishMock />,
  },
  {
    eyebrow: "CREATE",
    title: "Turn any idea into the perfect post",
    body: "Whether you’re flying solo or working with a team, SMC has all the features to help you create, organize, and repurpose your content for any channel. There’s also an AI Assistant if you need it.",
    headerBg: "#D3F2C7",
    mock: <CreateMock />,
  },
  {
    eyebrow: "COMMUNITY",
    title: "Reply to comments in a flash",
    body: "Engage with your audience across all your channels at 10x speed. SMC will help you triage and respond to comments from one simple dashboard.",
    headerBg: "#FFF4CC",
    mock: <CommunityMock />,
  },
  {
    eyebrow: "INSIGHTS",
    title: "Answers, not just analytics",
    body: "Whether it’s basic analytics or in-depth reporting, SMC will help you learn what works and how to improve.",
    headerBg: "#DCECFF",
    mock: <InsightsMock />,
  },
] as const;

export function LandingFeatures() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" id="features" sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Typography
          component="h2"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Core features
        </Typography>

        <Grid container spacing={2.5}>
          {CARDS.map((card) => (
            <Grid key={card.eyebrow} size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: "100%",
                  bgcolor: "#fff",
                  borderRadius: "16px",
                  border: `1px solid ${landing.line}`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Colored mock header — screenshot layout */}
                <Box
                  sx={{
                    bgcolor: card.headerBg,
                    px: { xs: 2, md: 2.5 },
                    pt: { xs: 2, md: 2.5 },
                    pb: { xs: 2, md: 2.5 },
                    minHeight: { xs: 220, md: 260 },
                  }}
                >
                  {card.mock}
                </Box>

                {/* White text block */}
                <Box sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: landing.green,
                      mb: 1,
                    }}
                  >
                    {card.eyebrow}
                  </Typography>
                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.25rem", md: "1.45rem" },
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                      mb: 1.25,
                      color: landing.ink,
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography sx={{ color: landing.muted, fontSize: 15, lineHeight: 1.6, flex: 1, mb: 2 }}>
                    {card.body}
                  </Typography>
                  <Link
                    href="#pricing"
                    underline="none"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontWeight: 700,
                      fontSize: 15,
                      color: landing.ink,
                      width: "fit-content",
                      "&:hover": { color: landing.green },
                    }}
                  >
                    Learn more <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                  </Link>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
