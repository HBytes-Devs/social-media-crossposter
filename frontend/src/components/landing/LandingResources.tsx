import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

type ResourceCard = {
  title: string;
  body: string;
  bg: string;
  tall?: boolean;
  mock: ReactNode;
};

function MockWindow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <Box
      sx={{
        bgcolor: dark ? "#1C1C1E" : "#fff",
        borderRadius: "12px 12px 0 0",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        overflow: "hidden",
        border: dark ? "1px solid #333" : "1px solid rgba(0,0,0,0.06)",
        mx: "auto",
        width: "92%",
      }}
    >
      <Stack direction="row" spacing={0.6} sx={{ px: 1.25, py: 1, bgcolor: dark ? "#2A2A2C" : "#F3F4F6" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <Box key={c} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c }} />
        ))}
      </Stack>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Box>
  );
}

function MockTools() {
  return (
    <MockWindow dark>
      <Typography sx={{ color: "#A1A1AA", fontSize: 10, fontWeight: 600, mb: 1, textAlign: "center" }}>
        Social Media AI Assistant
      </Typography>
      <Box
        sx={{
          bgcolor: "#2C2C2E",
          borderRadius: 2,
          px: 1.5,
          py: 1.25,
          border: "1px solid #3F3F46",
          mb: 1.25,
        }}
      >
        <Typography sx={{ color: "#71717A", fontSize: 11 }}>What do you want to write about?</Typography>
      </Box>
      <Stack direction="row" spacing={0.75}>
        {["Ideas", "Rewrite", "Hashtags"].map((t) => (
          <Box
            key={t}
            sx={{
              flex: 1,
              bgcolor: "#2C2C2E",
              borderRadius: 1.5,
              py: 1,
              textAlign: "center",
              border: "1px solid #3F3F46",
            }}
          >
            <Typography sx={{ color: "#D4D4D8", fontSize: 9, fontWeight: 600 }}>{t}</Typography>
          </Box>
        ))}
      </Stack>
    </MockWindow>
  );
}

function MockGlossary() {
  const terms = [
    { letter: "A", word: "Affiliate marketing", def: "Promoting products for a commission." },
    { letter: "A", word: "Algorithm", def: "Rules that rank content in feeds." },
    { letter: "B", word: "Bio link", def: "A single link in your profile." },
  ];
  return (
    <MockWindow>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: landing.ink, mb: 0.75, letterSpacing: "-0.02em" }}>
        Social Media Terms: A–Z
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.25, flexWrap: "wrap" }}>
        {"ABCDEFGHIJKLM".split("").map((l) => (
          <Box
            key={l}
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              bgcolor: l === "A" ? landing.green : "#F3F4F6",
              color: l === "A" ? "#fff" : "#9CA3AF",
              fontSize: 8,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
            }}
          >
            {l}
          </Box>
        ))}
      </Stack>
      <Stack spacing={0.75}>
        {terms.map((t) => (
          <Box key={t.word} sx={{ borderBottom: "1px solid #F3F4F6", pb: 0.6 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: landing.ink }}>{t.word}</Typography>
            <Typography sx={{ fontSize: 9, color: landing.soft }}>{t.def}</Typography>
          </Box>
        ))}
      </Stack>
    </MockWindow>
  );
}

function MockMarketing101() {
  return (
    <MockWindow>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: landing.ink, mb: 1, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
        Your Everything Guide to Social Media Marketing
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ pt: 0.5 }}>
        {[landing.pastelPink, landing.pastelBlue, landing.pastelGreen].map((c, i) => (
          <Box
            key={c}
            sx={{
              width: 52,
              height: 88,
              borderRadius: 2,
              bgcolor: c,
              border: "2px solid #111",
              boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              transform: i === 1 ? "translateY(-6px)" : "none",
              p: 0.75,
            }}
          >
            <Box sx={{ height: 8, width: "60%", bgcolor: "rgba(0,0,0,0.15)", borderRadius: 0.5, mb: 0.5, mx: "auto" }} />
            <Box sx={{ height: 28, bgcolor: "rgba(255,255,255,0.7)", borderRadius: 1, mb: 0.5 }} />
            <Box sx={{ height: 6, width: "80%", bgcolor: "rgba(0,0,0,0.12)", borderRadius: 0.5, mb: 0.35 }} />
            <Box sx={{ height: 6, width: "55%", bgcolor: "rgba(0,0,0,0.1)", borderRadius: 0.5 }} />
          </Box>
        ))}
      </Stack>
    </MockWindow>
  );
}

function MockBestTime() {
  return (
    <Box sx={{ position: "relative", height: 150, px: 1 }}>
      {[
        { top: 8, left: "4%", rotate: "-6deg", color: "#F9A8D4", label: "Best day" },
        { top: 18, left: "22%", rotate: "2deg", color: "#C4B5FD", label: "Best time" },
        { top: 36, left: "40%", rotate: "-3deg", color: "#A78BFA", label: "Weekday evenings" },
      ].map((card) => (
        <Box
          key={card.label}
          sx={{
            position: "absolute",
            top: card.top,
            left: card.left,
            width: "58%",
            bgcolor: "#fff",
            borderRadius: 2,
            p: 1.25,
            boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
            transform: `rotate(${card.rotate})`,
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: landing.ink, mb: 0.75 }}>{card.label}</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.4,
            }}
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  aspectRatio: "1",
                  borderRadius: 0.4,
                  bgcolor: card.color,
                  opacity: 0.25 + ((i * 7) % 10) / 12,
                }}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function MockBlog() {
  return (
    <MockWindow>
      <Stack direction="row" spacing={1}>
        <Box sx={{ flex: 1.4 }}>
          <Box sx={{ height: 72, borderRadius: 1.5, bgcolor: landing.pastelBlue, mb: 1 }} />
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: landing.ink, lineHeight: 1.3, mb: 0.5 }}>
            How to Make Money on Instagram in 2026
          </Typography>
          <Typography sx={{ fontSize: 8, color: landing.soft, lineHeight: 1.4 }}>
            Practical tips for creators building revenue from social.
          </Typography>
        </Box>
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          {["Scheduling tips", "Hashtag strategy", "Creator trends"].map((t) => (
            <Box key={t} sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: landing.pastelYellow, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 8, fontWeight: 600, color: landing.ink, lineHeight: 1.25 }}>{t}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </MockWindow>
  );
}

const CARDS: ResourceCard[] = [
  {
    title: "Free Marketing Tools",
    body: "A collection of free tools to make your social media marketing easier and more effective",
    bg: "#CCFBF1",
    mock: <MockTools />,
  },
  {
    title: "Social Media Glossary",
    body: "A glossary of the most popular terms to help you make sense of all the social media lingo",
    bg: "#D5F5EF",
    mock: <MockGlossary />,
  },
  {
    title: "Social Media Resources",
    body: "A collection of articles and interviews packed with tips, stories, and insights to level up your social media marketing game",
    bg: "#FEF3C7",
    tall: true,
    mock: <MockBlog />,
  },
  {
    title: "Social Media Marketing 101",
    body: "Your go-to guide for mastering the basics of social media and beyond",
    bg: "#F8CFC4",
    mock: <MockMarketing101 />,
  },
  {
    title: "Best Time to Post",
    body: "Discover the best times to post on social media to maximize your engagement",
    bg: "#E0F2F1",
    mock: <MockBestTime />,
  },
];

function ResourceTile({ card }: { card: ResourceCard }) {
  return (
    <Box
      component="a"
      href="#resources"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: card.tall ? { xs: 420, md: "100%" } : { xs: 340, md: 360 },
        bgcolor: card.bg,
        borderRadius: "24px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
          "& .resource-arrow": { transform: "translateX(4px)" },
        },
      }}
    >
      <Box sx={{ px: { xs: 2.5, md: 3 }, pt: { xs: 2.5, md: 3 }, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 18, md: 20 },
              letterSpacing: "-0.03em",
              color: landing.ink,
              lineHeight: 1.2,
              pr: 1,
            }}
          >
            {card.title}
          </Typography>
          <ArrowForwardRoundedIcon
            className="resource-arrow"
            sx={{
              fontSize: 22,
              color: landing.ink,
              flexShrink: 0,
              mt: 0.25,
              transition: "transform 0.2s ease",
            }}
          />
        </Stack>
        <Typography sx={{ color: "#4B4B4B", fontSize: { xs: 14, md: 15 }, lineHeight: 1.5, maxWidth: 340 }}>
          {card.body}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pt: 1,
          minHeight: card.tall ? 220 : 160,
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", transform: "translateY(12px)" }}>{card.mock}</Box>
      </Box>
    </Box>
  );
}

export function LandingResources() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  // Desktop order for CSS grid areas: tools | glossary | resources(tall)
  //                                     m101  | besttime | resources
  const desktopOrder = [CARDS[0], CARDS[1], CARDS[2], CARDS[3], CARDS[4]] as ResourceCard[];

  return (
    <Box component="section" sx={{ bgcolor: "#fff", py: { xs: 7, md: 11 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Typography
          component="h2"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: { xs: "1.85rem", md: "2.45rem" },
            letterSpacing: "-0.04em",
            mb: 1.25,
            color: landing.ink,
          }}
        >
          Fuel your social media success
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: landing.muted,
            fontSize: { xs: 15.5, md: 17 },
            mb: { xs: 4, md: 5 },
            maxWidth: 520,
            mx: "auto",
          }}
        >
          Everything you need to level up your social strategy—in one place.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 2.5 },
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gridTemplateRows: { md: "1fr 1fr" },
            gridAutoRows: { xs: "auto" },
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            "& > *:nth-of-type(1)": { order: { xs: 1, md: 0 }, gridColumn: { md: "1" }, gridRow: { md: "1" }, minWidth: 0 },
            "& > *:nth-of-type(2)": { order: { xs: 2, md: 0 }, gridColumn: { md: "2" }, gridRow: { md: "1" }, minWidth: 0 },
            "& > *:nth-of-type(3)": { order: { xs: 5, md: 0 }, gridColumn: { md: "3" }, gridRow: { md: "1 / span 2" }, minWidth: 0 },
            "& > *:nth-of-type(4)": { order: { xs: 3, md: 0 }, gridColumn: { md: "1" }, gridRow: { md: "2" }, minWidth: 0 },
            "& > *:nth-of-type(5)": { order: { xs: 4, md: 0 }, gridColumn: { md: "2" }, gridRow: { md: "2" }, minWidth: 0 },
          }}
        >
          {desktopOrder.map((card) => (
            <ResourceTile key={card.title} card={card} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
