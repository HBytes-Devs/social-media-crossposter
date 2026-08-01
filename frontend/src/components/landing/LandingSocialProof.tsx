import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { DummyMedia } from "./DummyMedia";
import { landing, wrap } from "./landingTheme";

/**
 * Buffer SocialProofLogosSection — directly under hero:
 * animated count + continuous logo slider.
 */
const TARGET = 239_586;
const LOGO_H = 40;
const LOGO_WIDTHS = [100, 120, 88, 130, 96, 112, 84, 124, 92, 108, 118, 86];

export function LandingSocialProof() {
  const [count, setCount] = useState(100_000);

  useEffect(() => {
    const t0 = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - t) ** 3;
      setCount(Math.floor(100_000 + (TARGET - 100_000) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(TARGET);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const logos = [...LOGO_WIDTHS, ...LOGO_WIDTHS];

  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#fff",
        pt: { xs: 5, md: 6 },
        pb: { xs: 5, md: 7 },
        overflow: "hidden",
        borderBottom: `1px solid ${landing.line}`,
      }}
    >
      <Box sx={{ ...wrap, textAlign: "center", mb: { xs: 4, md: 5 } }}>
        <Typography
          component="h2"
          sx={{
            fontWeight: 600,
            fontSize: { xs: 22, sm: 26, md: 30 },
            letterSpacing: "-0.025em",
            color: landing.ink,
            lineHeight: 1.35,
            maxWidth: 720,
            mx: "auto",
          }}
        >
          <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {count.toLocaleString("en-US")}
          </Box>{" "}
          creators, brands, and agencies using SMC
        </Typography>
      </Box>

      <Box
        sx={{
          overflow: "hidden",
          maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <Box
          className="landing-logo-marquee"
          sx={{ display: "flex", width: "max-content", gap: { xs: 4, md: 6 }, alignItems: "center", py: 1.5, px: 2 }}
        >
          {logos.map((w, i) => (
            <DummyMedia
              key={`${w}-${i}`}
              width={w}
              height={LOGO_H}
              label=""
              bgcolor="#C8C8C8"
              radius={3}
              sx={{ border: 0, opacity: 0.75, flexShrink: 0 }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
