import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

/** Stock team photo stand-in (not Buffer’s proprietary image). */
const TEAM_PHOTO =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80";

export function LandingSupport() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" id="support" sx={{ bgcolor: "#fff", py: { xs: 7, md: 11 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 4, md: 6 }} alignItems={{ xs: "stretch", md: "center" }}>
          <Box sx={{ flex: "0 1 46%", minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#6B6B6B",
                mb: 1.75,
              }}
            >
              Customer Support
            </Typography>

            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.85rem", md: "2.55rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1.12,
                color: landing.ink,
                mb: 2.25,
              }}
            >
              Human support, worldwide
            </Typography>

            <Typography sx={{ color: "#5A5A5A", fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.65, mb: 3, maxWidth: 460 }}>
              Our global Customer Advocacy team is spread across time zones to make sure help is always nearby. Whether
              you have a quick question, need technical support, or just want to connect, we’re here for you — no bots,
              just real people who care.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3.25 }}>
              <Button
                href="#resources"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: landing.pill,
                  height: 48,
                  px: 2.75,
                  bgcolor: landing.greenCta,
                  color: landing.ink,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#B8E6C9", boxShadow: "none" },
                }}
              >
                Visit the Help Center
              </Button>
              <Button
                href="#support"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: landing.pill,
                  height: 48,
                  px: 2.75,
                  borderColor: landing.ink,
                  borderWidth: 1.5,
                  color: landing.ink,
                  bgcolor: "transparent",
                  "&:hover": {
                    borderWidth: 1.5,
                    borderColor: landing.ink,
                    bgcolor: "rgba(0,0,0,0.03)",
                  },
                }}
              >
                Join Discord
              </Button>
            </Stack>

            <Typography sx={{ color: "#5A5A5A", fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.65, mb: 2.5, maxWidth: 460 }}>
              We prioritize customer connection as a company and you could end up speaking with a teammate in any role at
              SMC, from Marketers to Engineers.
            </Typography>

            <Link
              href="#about"
              underline="always"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: landing.ink,
                fontWeight: 600,
                fontSize: 15.5,
                textUnderlineOffset: 3,
                "&:hover": { color: "#000" },
              }}
            >
              Learn more about our global team
              <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
            </Link>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Box
              component="img"
              src={TEAM_PHOTO}
              alt="Team gathered outdoors"
              sx={{
                width: "100%",
                height: { xs: 260, sm: 320, md: 400 },
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "24px",
                display: "block",
                bgcolor: "#E5E7EB",
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
