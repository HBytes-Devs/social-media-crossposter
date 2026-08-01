import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

/**
 * Buffer ChannelsSection — beige banner:
 * left heading · channel tiles on dashed line · arrow → tilted brand tile.
 */

const TILE = 48;
const BRAND = 64;

type Channel = { name: string; bg: string; icon: ReactNode };

function IconIn({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 800, fontSize: 15, lineHeight: 1, fontFamily: "Arial, sans-serif" }}>
      in
    </Typography>
  );
}

function IconAt({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
      @
    </Typography>
  );
}

function IconP({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 800, fontSize: 18, lineHeight: 1, fontFamily: "Georgia, serif" }}>
      P
    </Typography>
  );
}

function IconPlay({ color = "#fff" }: { color?: string }) {
  return (
    <Box
      component="span"
      sx={{
        width: 0,
        height: 0,
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
        borderLeft: `10px solid ${color}`,
        ml: "2px",
      }}
    />
  );
}

function IconX({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 800, fontSize: 16, lineHeight: 1 }}>
      𝕏
    </Typography>
  );
}

function IconF({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 800, fontSize: 20, lineHeight: 1, fontFamily: "Arial, sans-serif" }}>
      f
    </Typography>
  );
}

function IconCloud({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
      ✦
    </Typography>
  );
}

function IconStore({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 700, fontSize: 14, lineHeight: 1 }}>
      ▤
    </Typography>
  );
}

function IconCam({ color = "#fff" }: { color?: string }) {
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "5px",
        border: `2px solid ${color}`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }} />
    </Box>
  );
}

function IconM({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 800, fontSize: 16, lineHeight: 1 }}>
      m
    </Typography>
  );
}

function IconNote({ color = "#fff" }: { color?: string }) {
  return (
    <Typography component="span" sx={{ color, fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
      ♪
    </Typography>
  );
}

/** SMC destination mark — matches app teal brand. */
function BrandMarkIcon() {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(94, 234, 212, 0.18)",
        color: "#5EEAD4",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "-0.02em",
      }}
    >
      S
    </Box>
  );
}

const CHANNELS: Channel[] = [
  { name: "LinkedIn", bg: "#0A66C2", icon: <IconIn /> },
  { name: "Threads", bg: "#000000", icon: <IconAt /> },
  { name: "Pinterest", bg: "#E60023", icon: <IconP /> },
  { name: "Bluesky", bg: "#0085FF", icon: <IconCloud /> },
  { name: "YouTube", bg: "#FF0000", icon: <IconPlay /> },
  { name: "X", bg: "#111111", icon: <IconX /> },
  { name: "Google Business", bg: "#1A73E8", icon: <IconStore /> },
  { name: "Instagram", bg: "#E4405F", icon: <IconCam /> },
  { name: "Mastodon", bg: "#6364FF", icon: <IconM /> },
  { name: "TikTok", bg: "#010101", icon: <IconNote /> },
  { name: "Facebook", bg: "#1877F2", icon: <IconF /> },
];

function ChannelTile({ channel }: { channel: Channel }) {
  return (
    <Box
      title={`SMC × ${channel.name}`}
      sx={{
        position: "relative",
        zIndex: 1,
        width: TILE,
        height: TILE,
        borderRadius: 2.5,
        bgcolor: channel.bg,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      }}
    >
      {channel.icon}
    </Box>
  );
}

export function LandingPlatforms() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" id="platforms" sx={{ bgcolor: "#fff", py: { xs: 5, md: 7 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Box
          sx={{
            bgcolor: "#F4F1EA",
            borderRadius: "24px",
            px: { xs: 2.5, md: 4 },
            py: { xs: 3, md: 3.5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 3, md: 3 },
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 22, md: 26 },
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              color: landing.ink,
              flexShrink: 0,
              width: { md: 180 },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Connect your
            <Box component="br" sx={{ display: { xs: "none", md: "block" } }} />
            {" "}
            favorite accounts
          </Typography>

          {/* Icons + dashed connector + brand tile */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                overflowX: "auto",
                overflowY: "hidden",
                py: 1,
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 },
              }}
            >
              {/* Dashed connector line */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  left: TILE / 2,
                  right: 0,
                  top: "50%",
                  height: 0,
                  borderTop: "2px dashed #3A3A3A",
                  transform: "translateY(-50%)",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />

              <Stack direction="row" spacing={{ xs: 1.25, md: 1.5 }} alignItems="center" sx={{ position: "relative", zIndex: 1, px: 0.25 }}>
                {CHANNELS.map((c) => (
                  <ChannelTile key={c.name} channel={c} />
                ))}
              </Stack>
            </Box>

            {/* Arrow head */}
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "8px solid #3A3A3A",
                display: { xs: "none", sm: "block" },
              }}
            />

            {/* Destination brand tile (tilted) */}
            <Box
              sx={{
                flexShrink: 0,
                width: BRAND,
                height: BRAND,
                borderRadius: 2.75,
                bgcolor: "#2A2A2A",
                display: "grid",
                placeItems: "center",
                transform: "rotate(8deg)",
                boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
              }}
              title="SMC"
            >
              <BrandMarkIcon />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
