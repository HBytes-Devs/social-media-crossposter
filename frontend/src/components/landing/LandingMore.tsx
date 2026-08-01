import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

/**
 * Buffer “…and so much more!” — 4 equal cards (screenshot match):
 * pastel mock header on top + white title / body / Learn more below.
 */

function CardShell({
  headerBg,
  mock,
  title,
  body,
}: {
  headerBg: string;
  mock: ReactNode;
  title: string;
  body: string;
}) {
  return (
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
      <Box
        sx={{
          bgcolor: headerBg,
          px: 2,
          pt: 2,
          pb: 2,
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mock}
      </Box>
      <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", mb: 0.75, color: landing.ink }}>
          {title}
        </Typography>
        <Typography sx={{ color: landing.muted, fontSize: 14, lineHeight: 1.55, flex: 1, mb: 1.75 }}>
          {body}
        </Typography>
        <Link
          href="#features"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 700,
            fontSize: 14,
            color: landing.ink,
            width: "fit-content",
            "&:hover": { color: landing.green },
          }}
        >
          Learn more <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Link>
      </Box>
    </Box>
  );
}

function CollaborateMock() {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderRadius: 2,
        p: 1.5,
        boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ height: 56, borderRadius: 1.5, bgcolor: "#BBF7D0", mb: 1.25 }} />
      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.25 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#93C5FD", flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: landing.ink }}>thomas@tennispros.com</Typography>
          <Typography sx={{ fontSize: 10, color: landing.muted, lineHeight: 1.35 }}>
            Let’s add “DM or visit the link in bio to book”
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Box
          sx={{
            flex: 1,
            bgcolor: landing.green,
            color: "#fff",
            textAlign: "center",
            borderRadius: 1.25,
            py: 0.7,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Approve post
        </Box>
        <Box
          sx={{
            flex: 1,
            bgcolor: "#F04438",
            color: "#fff",
            textAlign: "center",
            borderRadius: 1.25,
            py: 0.7,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Reject
        </Box>
      </Stack>
    </Box>
  );
}

function MobileMock() {
  return (
    <Box sx={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", py: 0.5 }}>
      <Box
        sx={{
          width: 120,
          bgcolor: "#111",
          borderRadius: 3,
          p: 0.75,
          boxShadow: "0 14px 32px rgba(0,0,0,0.2)",
        }}
      >
        <Box sx={{ bgcolor: "#fff", borderRadius: 2.25, p: 1, minHeight: 150 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 800, mb: 0.75 }}>Your Queue</Typography>
          <Typography sx={{ fontSize: 9, color: landing.soft, mb: 0.75 }}>Tomorrow 11:45 AM</Typography>
          <Box sx={{ height: 70, borderRadius: 1.5, bgcolor: "#FDE68A", mb: 0.75 }} />
          <Box sx={{ height: 8, width: "80%", bgcolor: "#E5E7EB", borderRadius: 1 }} />
        </Box>
      </Box>
      <Box sx={{ position: "absolute", left: 8, top: 28, width: 28, height: 28, borderRadius: "50%", bgcolor: "#111", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        𝕏
      </Box>
      <Box sx={{ position: "absolute", right: 6, bottom: 36, width: 28, height: 28, borderRadius: "50%", bgcolor: "#000", color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        @
      </Box>
    </Box>
  );
}

function StartPageMock() {
  return (
    <Stack direction="row" spacing={1} alignItems="stretch" sx={{ width: "100%" }}>
      <Box
        sx={{
          flex: 1.1,
          bgcolor: "#fff",
          borderRadius: 2,
          p: 1.25,
          boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
          minHeight: 150,
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#F9A8D4" }} />
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 800 }}>Melisa</Typography>
            <Typography sx={{ fontSize: 8, color: landing.soft }}>Women Leadership Coach</Typography>
          </Box>
        </Stack>
        <Stack spacing={0.6}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ height: 22, borderRadius: 1, bgcolor: i === 0 ? landing.greenSoft : "#F3F4F6" }} />
          ))}
        </Stack>
      </Box>
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
        {["#C4B5FD", "#86EFAC", "#FCD34D", "#F9A8D4"].map((c) => (
          <Box key={c} sx={{ borderRadius: 1.5, bgcolor: c, minHeight: 48, boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }} />
        ))}
      </Box>
    </Stack>
  );
}

function AiMock() {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderRadius: 2,
        p: 1.75,
        boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
        border: "1px solid rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 1.25 }}>AI Assistant</Typography>
      <Box sx={{ bgcolor: "#F5F5F5", borderRadius: 1.5, px: 1.25, py: 1.5, mb: 1.5, minHeight: 56 }}>
        <Typography sx={{ fontSize: 12, color: landing.soft }}>What do you want to write about?</Typography>
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          bgcolor: "#7C3AED",
          color: "#fff",
          borderRadius: 1.5,
          px: 1.75,
          py: 0.85,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 16 }} />
        Generate
      </Box>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: 28,
          bottom: 22,
          width: 14,
          height: 18,
          bgcolor: "#111",
          clipPath: "polygon(0 0, 100% 70%, 55% 70%, 75% 100%, 55% 100%, 35% 70%, 0 70%)",
          opacity: 0.9,
        }}
      />
    </Box>
  );
}

const ITEMS = [
  {
    title: "Collaborate",
    body: "Manage, edit, and approve social media posts from your team.",
    headerBg: "#FFE4DE",
    mock: <CollaborateMock />,
  },
  {
    title: "Mobile app",
    body: "Manage your social media accounts from anywhere.",
    headerBg: "#EDE7FF",
    mock: <MobileMock />,
  },
  {
    title: "Start page",
    body: "Turn your social bio into a powerful, personalized hub.",
    headerBg: "#FFE8D6",
    mock: <StartPageMock />,
  },
  {
    title: "AI assistant",
    body: "Brainstorm ideas, rewrite content, and craft platform-specific posts.",
    headerBg: "#D4F5EC",
    mock: <AiMock />,
  },
] as const;

export function LandingMore() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Typography
          component="h2"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: { xs: "1.85rem", md: "2.5rem" },
            letterSpacing: "-0.04em",
            mb: { xs: 4, md: 5 },
            color: landing.ink,
          }}
        >
          …and so much more!
        </Typography>

        <Grid container spacing={2.5}>
          {ITEMS.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <CardShell headerBg={item.headerBg} mock={item.mock} title={item.title} body={item.body} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
