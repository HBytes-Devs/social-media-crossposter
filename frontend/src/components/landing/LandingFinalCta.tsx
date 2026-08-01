import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { landing, wrap } from "./landingTheme";
import { useLandingReveal } from "./useLandingReveal";

const STATS = [
  { title: "MAU", subtitle: "Monthly active users", value: "239,586" },
  { title: "Total customers", subtitle: "Total customers", value: "79,056" },
  { title: "Teammates", subtitle: "Across 15 countries", value: "73" },
  { title: "ARR", subtitle: "Annual recurring revenue", value: "$25.8M" },
] as const;

export function LandingAbout() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" id="about" sx={{ bgcolor: "#fff", py: { xs: 7, md: 11 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          justifyContent="space-between"
          sx={{ mb: { xs: 4, md: 5 } }}
        >
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 640 }}>
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
              About us
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.85rem", md: "2.55rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1.12,
                color: landing.ink,
                mb: 2,
              }}
            >
              We are an open company
            </Typography>
            <Typography sx={{ color: "#5A5A5A", fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.65 }}>
              Since 2013, we’ve shared SMC’s finances, team salaries, and other key metrics openly. Our commitment to
              transparency is rooted in our belief that it fosters trust, keeps us accountable, and helps drive positive
              change within our industry.
            </Typography>
          </Box>

          <Button
            href="#about"
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: landing.pill,
              height: 48,
              px: 2.75,
              flexShrink: 0,
              alignSelf: { xs: "flex-start", md: "flex-start" },
              mt: { md: 4.5 },
              borderColor: landing.ink,
              borderWidth: 1.5,
              color: landing.ink,
              bgcolor: "#fff",
              "&:hover": {
                borderWidth: 1.5,
                borderColor: landing.ink,
                bgcolor: "rgba(0,0,0,0.03)",
              },
            }}
          >
            Open dashboard
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {STATS.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: 168,
                  bgcolor: "#fff",
                  border: `1px solid ${landing.line}`,
                  borderRadius: "16px",
                  p: 2.75,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: landing.ink, letterSpacing: "-0.02em" }}>
                  {s.title}
                </Typography>
                <Typography sx={{ mt: 0.35, fontSize: 13.5, color: landing.soft, fontWeight: 500 }}>{s.subtitle}</Typography>
                <Typography
                  sx={{
                    mt: "auto",
                    pt: 3,
                    fontWeight: 800,
                    fontSize: { xs: 28, md: 32 },
                    letterSpacing: "-0.04em",
                    color: landing.ink,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export function LandingFinalCta() {
  const { ref, className } = useLandingReveal<HTMLDivElement>();

  return (
    <Box component="section" sx={{ bgcolor: landing.bgOff, py: { xs: 5, md: 8 } }}>
      <Box ref={ref} className={className} sx={{ ...wrap, maxWidth: 1120 }}>
        <Box
          sx={{
            bgcolor: "#C8F0C8",
            borderRadius: "28px",
            border: "3px solid #fff",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
            textAlign: "center",
            px: { xs: 3, md: 6 },
            py: { xs: 7, md: 9 },
            minHeight: { xs: 280, md: 320 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.85rem", md: "2.75rem" },
              letterSpacing: "-0.045em",
              mb: { xs: 3.5, md: 4 },
              lineHeight: 1.15,
              color: landing.ink,
              maxWidth: 560,
            }}
          >
            Grow your social presence with confidence
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            disableElevation
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
              bgcolor: landing.ink,
              color: "#fff",
              borderRadius: landing.pill,
              height: 52,
              px: 3.5,
              "&:hover": { bgcolor: "#000" },
            }}
          >
            Get started for free
          </Button>
          <Typography sx={{ mt: 2.25, fontSize: 15, fontWeight: 500, color: landing.ink }}>
            No credit card needed. Free forever.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

type FooterLink = { label: string; href?: string; badge?: string };
type FooterGroup = { title: string; links: FooterLink[] };
type FooterColumn = { groups: FooterGroup[] };

const FOOTER_ACCENT = landing.footerAccent;
const FOOTER_BG = landing.footer;

const FOOTER_COLS: FooterColumn[] = [
  {
    groups: [
      {
        title: "Features",
        links: [
          { label: "Create" },
          { label: "Publish" },
          { label: "Community" },
          { label: "Insights", badge: "New" },
          { label: "Collaborate" },
        ],
      },
      {
        title: "Tools",
        links: [
          { label: "AI Assistant" },
          { label: "Start Page" },
          { label: "Integrations" },
          { label: "iOS App" },
          { label: "Android App" },
          { label: "Browser Extension" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Channels",
        links: [
          { label: "Bluesky" },
          { label: "Facebook" },
          { label: "Google Business Profile" },
          { label: "Instagram" },
          { label: "LinkedIn" },
          { label: "Mastodon" },
          { label: "Pinterest" },
          { label: "Threads" },
          { label: "TikTok" },
          { label: "X" },
          { label: "YouTube" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Made for",
        links: [
          { label: "Creators" },
          { label: "Small Business" },
          { label: "Agencies" },
          { label: "Nonprofits" },
          { label: "Higher Education" },
          { label: "Developers" },
          { label: "Startups" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Resources",
        links: [
          { label: "Blog" },
          { label: "Template Library" },
          { label: "Social Media Benchmarks" },
          { label: "Resource Library" },
          { label: "Social Media Terms Glossary" },
          { label: "Free Marketing Tools" },
          { label: "AI Social Media Post Generator" },
          { label: "Compare SMC" },
          { label: "Our Community" },
          { label: "SMC API" },
          { label: "Developer Docs" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Support",
        links: [
          { label: "Help Center" },
          { label: "Status" },
          { label: "Changelog" },
          { label: "Request a Feature" },
        ],
      },
      {
        title: "Transparency",
        links: [
          { label: "Open Hub" },
          { label: "Transparent Metrics" },
          { label: "Transparent Pricing" },
          { label: "Transparent Salaries" },
          { label: "Product Roadmap" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Company",
        links: [
          { label: "About" },
          { label: "Careers" },
          { label: "Press" },
          { label: "Partner Program" },
          { label: "Legal" },
          { label: "Sitemap" },
        ],
      },
    ],
  },
];

function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <Box
      component="a"
      href="#about"
      aria-label={label}
      sx={{
        width: 24,
        height: 24,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        opacity: 0.95,
        flexShrink: 0,
        "&:hover": { opacity: 1, color: FOOTER_ACCENT },
      }}
    >
      <Box component="svg" viewBox="0 0 24 24" sx={{ width: 18, height: 18, fill: "currentColor" }} aria-hidden>
        <path d={path} />
      </Box>
    </Box>
  );
}

const SOCIALS = [
  {
    label: "Instagram",
    path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  },
  {
    label: "Facebook",
    path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z",
  },
  {
    label: "Bluesky",
    path: "M12 10.8c-1.087-2.114-4.046-6.014-6.798-7.932C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.03-.01.06-.02.089-.03-.03.01-.059.02-.088.03-2.67.297-5.568-.628-6.383-3.364C.378 9.418 0 4.458 0 3.768c0-.688.139-1.86.902-2.203.659-.299 1.664-.621 4.3 1.303C7.954 4.786 10.913 8.686 12 10.8c1.087-2.114 4.046-6.014 6.798-7.932C21.434.944 22.439 1.266 23.098 1.565c.763.343.902 1.515.902 2.203 0 .69-.378 5.65-.624 6.479-.815 2.736-3.713 3.66-6.383 3.364-.03-.01-.06-.02-.089-.03.03.01.059.02.088.03 2.67.297 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.303C16.046 4.786 13.087 8.686 12 10.8z",
  },
  {
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
  {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Threads",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.07c0-3.517.85-6.37 2.495-8.42C5.845 1.345 8.598.163 12.18.138h.014c2.582.017 4.687.647 6.252 1.871 1.313 1.028 2.186 2.39 2.66 4.15l-2.24.686c-.35-1.302-.967-2.287-1.886-3.01-1.14-.9-2.74-1.354-4.773-1.36-2.845.02-4.96.91-6.29 2.644-1.2 1.56-1.81 3.85-1.81 6.81s.61 5.25 1.81 6.81c1.33 1.734 3.445 2.624 6.29 2.645 2.607-.01 4.464-.616 5.682-1.85 1.392-1.41 1.782-3.49 1.782-4.87v-.66h-5.73V9.5h8.05v1.56c0 2.2-.52 4.19-1.54 5.92-1.07 1.81-2.66 3.16-4.72 4.02-1.8.75-3.9 1.13-6.24 1.14H12.186z",
  },
] as const;

const LEGAL = ["Privacy", "Terms", "Security"] as const;

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: FOOTER_BG,
        color: "#fff",
        borderTopLeftRadius: { xs: 28, md: 48 },
        borderTopRightRadius: { xs: 28, md: 48 },
        pt: { xs: 7, md: 10 },
        pb: { xs: 5, md: 6 },
        mt: { xs: 1, md: 2 },
        overflowX: "hidden",
        overflowY: "visible",
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ ...wrap, maxWidth: 1180 }}>
        <Grid container spacing={{ xs: 4, md: 3 }} sx={{ mb: { xs: 7, md: 10 } }}>
          {FOOTER_COLS.map((col, colIdx) => (
            <Grid key={colIdx} size={{ xs: 6, sm: 4, md: 2 }}>
              <Stack spacing={3.5}>
                {col.groups.map((group) => (
                  <Box key={group.title}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: FOOTER_ACCENT,
                        mb: 1.75,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {group.title}
                    </Typography>
                    <Stack spacing={1.35}>
                      {group.links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href ?? "#"}
                          underline="none"
                          sx={{
                            color: "rgba(255,255,255,0.92)",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.35,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                            width: "fit-content",
                            "&:hover": { color: FOOTER_ACCENT },
                          }}
                        >
                          {l.label}
                          {l.badge ? (
                            <Box
                              component="span"
                              sx={{
                                bgcolor: FOOTER_ACCENT,
                                color: FOOTER_BG,
                                fontSize: 10,
                                fontWeight: 800,
                                px: 0.75,
                                py: 0.15,
                                borderRadius: 0.75,
                                lineHeight: 1.4,
                                letterSpacing: "0.02em",
                              }}
                            >
                              {l.badge}
                            </Box>
                          ) : null}
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-end" },
            gap: { xs: 3.5, md: 4 },
          }}
        >
          <Link href="#top" underline="none" sx={{ display: "inline-flex", flexShrink: 0 }}>
            <BrandMark light size="lg" withTagline />
          </Link>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", md: "flex-end" },
              gap: 1.75,
              minWidth: 0,
            }}
          >
            <Box
              component="button"
              type="button"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: "transparent",
                border: 0,
                p: 0,
                m: 0,
                cursor: "pointer",
                color: FOOTER_ACCENT,
                fontFamily: "inherit",
                lineHeight: 1,
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 18, height: 18, fill: "currentColor", flexShrink: 0 }}
                aria-hidden
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </Box>
              <Box component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
                English
              </Box>
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.75 }}>
              {SOCIALS.map((s) => (
                <SocialIcon key={s.label} label={s.label} path={s.path} />
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                columnGap: 1,
                rowGap: 0.5,
                color: "rgba(255,255,255,0.88)",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              <Box component="span">Copyright ©{new Date().getFullYear()} SMC</Box>
              {LEGAL.map((item) => (
                <Box key={item} component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                  <Box component="span" aria-hidden>
                    |
                  </Box>
                  <Link href="#" underline="hover" sx={{ color: "inherit", "&:hover": { color: FOOTER_ACCENT } }}>
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
