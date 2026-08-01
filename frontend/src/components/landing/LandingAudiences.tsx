import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: ["3 channels", "Basic analytics", "Community support"],
  },
  {
    name: "Essentials",
    price: "$6",
    period: "/mo",
    features: ["8 channels", "Advanced analytics", "AI assistant", "Priority queue"],
  },
  {
    name: "Team",
    price: "$12",
    period: "/mo",
    features: ["Unlimited channels", "Approvals", "Team roles", "Custom reports"],
  },
] as const;

export function LandingPricing() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();
  const [yearly, setYearly] = useState(false);

  return (
    <Box component="section" id="pricing" sx={{ bgcolor: landing.bgOff, py: { xs: 7, md: 10 } }}>
      <Box ref={ref} className={className} sx={wrap}>
        <Typography
          component="h2"
          sx={{ textAlign: "center", fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.35rem" }, letterSpacing: "-0.035em", mb: 1 }}
        >
          Choose a plan that’s right for you
        </Typography>
        <Typography sx={{ textAlign: "center", color: landing.muted, mb: 3 }}>
          Flexible pricing that grows with you. From $0/month to get started.
        </Typography>

        <Stack direction="row" justifyContent="center" sx={{ mb: 4 }}>
          <Stack
            direction="row"
            sx={{
              p: 0.5,
              borderRadius: landing.pill,
              bgcolor: "#fff",
              border: `1px solid ${landing.line}`,
              height: 44,
              alignItems: "center",
            }}
          >
            {(["Monthly", "Yearly"] as const).map((label) => {
              const active = label === "Yearly" ? yearly : !yearly;
              return (
                <Button
                  key={label}
                  onClick={() => setYearly(label === "Yearly")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: landing.pill,
                    px: 2.5,
                    height: 36,
                    bgcolor: active ? landing.ink : "transparent",
                    color: active ? "#fff" : landing.ink,
                    "&:hover": { bgcolor: active ? landing.ink : "rgba(0,0,0,0.04)" },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Stack>
        </Stack>

        <Grid container spacing={2.5}>
          {PLANS.map((plan) => (
            <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: 360,
                  bgcolor: landing.pastelPurple,
                  borderRadius: `${landing.radius}px`,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{plan.name}</Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ my: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em" }}>
                    {yearly && plan.price !== "$0" ? `$${Math.max(0, Number(plan.price.slice(1)) * 10)}` : plan.price}
                  </Typography>
                  <Typography sx={{ color: landing.soft }}>{yearly ? "/yr" : plan.period}</Typography>
                </Stack>
                <Stack spacing={1} sx={{ flex: 1, mb: 2.5 }}>
                  {plan.features.map((f) => (
                    <Stack key={f} direction="row" spacing={1} alignItems="center">
                      <CheckRoundedIcon sx={{ fontSize: 18, color: landing.green }} />
                      <Typography sx={{ fontSize: 14 }}>{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  disableElevation
                  fullWidth
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: landing.ink,
                    borderRadius: 2,
                    height: 44,
                    "&:hover": { bgcolor: "#000" },
                  }}
                >
                  Get started
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

type Channel = "x" | "linkedin" | "instagram";

type CommunityMember = {
  handle: string;
  meta: string;
  avatar: string;
  channel: Channel;
};

type VerticalTab = {
  label: string;
  theme: "purple" | "yellow" | "aqua";
  title: ReactNode;
  body: string;
  points: string[];
  communityEyebrow: string;
  members: CommunityMember[];
};

const THEME = {
  purple: {
    panel: "#D5F5F0",
    tabActive: "#CCFBF1",
    accent: "#0F766E",
    check: "#0F766E",
  },
  yellow: {
    panel: "#FFF3C4",
    tabActive: "#FDE68A",
    accent: "#A16207",
    check: "#CA8A04",
  },
  aqua: {
    panel: "#D5F3EE",
    tabActive: "#A7F3D0",
    accent: "#0F766E",
    check: "#0D9488",
  },
} as const;

const TABS: VerticalTab[] = [
  {
    label: "Creators",
    theme: "purple",
    title: (
      <>
        Grow from zero <Box component="span" sx={{ fontWeight: 400 }}>→</Box> one{" "}
        <Box component="span" sx={{ fontWeight: 400 }}>→</Box> one million
      </>
    ),
    body: "Whether you’re just getting started on your creator journey or scaling your audience to new heights, SMC will get your content in front of more people.",
    points: [
      "Save all your ideas as inspiration strikes",
      "Learn exactly what content works best and why",
      "Create once, crosspost everywhere",
    ],
    communityEyebrow: "THE SMC CREATOR COMMUNITY",
    members: [
      {
        handle: "@rita_codes",
        meta: "34.9K FOLLOWERS ON X",
        avatar: "https://i.pravatar.cc/160?img=47",
        channel: "x",
      },
      {
        handle: "@Pauldelabaume",
        meta: "21K FOLLOWERS ON LINKEDIN",
        avatar: "https://i.pravatar.cc/160?img=12",
        channel: "linkedin",
      },
      {
        handle: "@yola_bastos",
        meta: "14.6K FOLLOWERS ON INSTAGRAM",
        avatar: "https://i.pravatar.cc/160?img=32",
        channel: "instagram",
      },
    ],
  },
  {
    label: "Small businesses",
    theme: "yellow",
    title: "Level up your social presence without draining your time",
    body: "Every minute and every dollar counts when you’re running a small business. SMC multiplies your efforts and keeps your online presence thriving with minimal effort.",
    points: [
      "Schedule content weeks or even months in advance",
      "See all your posts in one simple dashboard",
      "World-class customer support",
    ],
    communityEyebrow: "THE SMC SMALL BUSINESS COMMUNITY",
    members: [
      {
        handle: "@midmod.mood",
        meta: "236K FOLLOWERS ON INSTAGRAM",
        avatar: "https://i.pravatar.cc/160?img=20",
        channel: "instagram",
      },
      {
        handle: "@tinalarssonli",
        meta: "12K FOLLOWERS ON LINKEDIN",
        avatar: "https://i.pravatar.cc/160?img=5",
        channel: "linkedin",
      },
      {
        handle: "@vanillapodbakery",
        meta: "5.5K FOLLOWERS ON INSTAGRAM",
        avatar: "https://i.pravatar.cc/160?img=44",
        channel: "instagram",
      },
    ],
  },
  {
    label: "Agencies",
    theme: "aqua",
    title: "The most trusted tool for freelancers and agencies",
    body: "SMC has been helping freelancers, consultants, and agencies grow their client accounts for more than a decade.",
    points: [
      "Intuitive review and approval workflows",
      "Custom access and permissions",
      "Unlimited user invites",
      "Pricing that scales with your business",
      "99% post reliability",
    ],
    communityEyebrow: "THE SMC AGENCY COMMUNITY",
    members: [
      {
        handle: "@redpigeonmedia",
        meta: "2.2K FOLLOWERS ON INSTAGRAM",
        avatar: "https://i.pravatar.cc/160?img=15",
        channel: "instagram",
      },
      {
        handle: "@shoredupdigital",
        meta: "2.5K FOLLOWERS ON INSTAGRAM",
        avatar: "https://i.pravatar.cc/160?img=33",
        channel: "instagram",
      },
    ],
  },
];

function ChannelBadge({ channel }: { channel: Channel }) {
  const styles =
    channel === "x"
      ? { bg: "#000", label: null }
      : channel === "linkedin"
        ? { bg: "#0A66C2", label: "in" }
        : { bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: null };

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: "50%",
        bgcolor: channel === "instagram" ? undefined : styles.bg,
        background: channel === "instagram" ? styles.bg : undefined,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        border: "2.5px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      {channel === "x" ? (
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: 12, height: 12, fill: "#fff" }}
          aria-hidden
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </Box>
      ) : channel === "linkedin" ? (
        <Typography sx={{ fontSize: 11, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>in</Typography>
      ) : (
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: 13, height: 13, fill: "#fff" }}
          aria-hidden
        >
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </Box>
      )}
    </Box>
  );
}

function CommunityCard({ member }: { member: CommunityMember }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "16px",
        px: 2,
        pt: 3,
        pb: 2.5,
        height: "100%",
        minHeight: { xs: 210, md: 230 },
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "relative", width: 84, height: 84, mb: 2 }}>
        <Box
          component="img"
          src={member.avatar}
          alt=""
          sx={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            bgcolor: "#E5E7EB",
          }}
        />
        <ChannelBadge channel={member.channel} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: landing.ink, mb: 1.25, letterSpacing: "-0.01em" }}>
        {member.handle}
      </Typography>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#9A9A9A",
          lineHeight: 1.4,
          textTransform: "uppercase",
          mt: "auto",
        }}
      >
        {member.meta}
      </Typography>
    </Box>
  );
}

export function LandingAudiences() {
  const [tab, setTab] = useState(0);
  const { ref, className } = useLandingReveal<HTMLDivElement>();
  const active = TABS[tab] ?? TABS[0]!;
  const theme = THEME[active.theme];

  return (
    <Box component="section" id="audiences" ref={ref} className={className} sx={{ bgcolor: "#fff", py: { xs: 7, md: 10 } }}>
      <Box sx={{ ...wrap, maxWidth: 1120 }}>
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
          Whoever you are, we’ve got you covered
        </Typography>

        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: { xs: 4.5, md: 5.5 } }}>
          {TABS.map((t, i) => {
            const activeTab = i === tab;
            const tTheme = THEME[t.theme];
            return (
              <Button
                key={t.label}
                onClick={() => setTab(i)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: landing.pill,
                  px: 3,
                  height: 46,
                  flexShrink: 0,
                  bgcolor: activeTab ? tTheme.tabActive : "#fff",
                  color: landing.ink,
                  border: "1.5px solid #1A1A1A",
                  boxShadow: "none",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: activeTab ? tTheme.tabActive : "rgba(0,0,0,0.03)",
                    border: "1.5px solid #1A1A1A",
                  },
                }}
              >
                {t.label}
              </Button>
            );
          })}
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 4, md: 6 }} alignItems="stretch">
          <Box sx={{ flex: "0 1 40%", minWidth: 0, pt: { md: 0.5 } }}>
            <Typography
              component="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1.12,
                mb: 2,
                color: landing.ink,
                maxWidth: 400,
              }}
            >
              {active.title}
            </Typography>
            <Typography sx={{ color: "#6B6B6B", fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.65, mb: 3.25, maxWidth: 430 }}>
              {active.body}
            </Typography>
            <Stack spacing={1.9}>
              {active.points.map((p) => (
                <Stack key={p} direction="row" spacing={1.35} alignItems="flex-start">
                  <CheckRoundedIcon sx={{ color: theme.check, fontSize: 22, mt: "1px", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 15.5, fontWeight: 500, color: "#6B6B6B", lineHeight: 1.45 }}>{p}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: theme.panel,
              borderRadius: "24px",
              p: { xs: 2.25, md: 2.75 },
              transition: "background-color 0.25s ease",
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.accent,
                mb: 2.25,
              }}
            >
              {active.communityEyebrow}
            </Typography>
            <Grid container spacing={1.75}>
              {active.members.map((m) => (
                <Grid key={m.handle} size={{ xs: 12, sm: active.members.length > 2 ? 4 : 6 }}>
                  <CommunityCard member={m} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
