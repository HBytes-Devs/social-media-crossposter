import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { landing } from "./landingTheme";

type BrandMarkProps = {
  /** Footer / dark surfaces — teal accent on dark */
  light?: boolean;
  /** Show “Social crossposter” under SMC */
  withTagline?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * Same brand mark as the logged-in sidebar / auth shell: teal soft circle + AutoAwesome + SMC.
 */
export function BrandMark({ light = false, withTagline = false, size = "md" }: BrandMarkProps) {
  const iconBox = size === "lg" ? 44 : size === "sm" ? 32 : 40;
  const iconSize = size === "lg" ? 22 : size === "sm" ? 16 : 19;
  const titleSize = size === "lg" ? 28 : size === "sm" ? 18 : 22;

  return (
    <Stack direction="row" alignItems="center" spacing={1.25} component="span" sx={{ minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: iconBox,
          height: iconBox,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: light ? "rgba(94, 234, 212, 0.15)" : "rgba(15, 118, 110, 0.12)",
          color: light ? landing.accentLight : landing.green,
          boxShadow: light ? "inset 0 0 0 1px rgba(94, 234, 212, 0.22)" : "none",
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: iconSize }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: titleSize,
            letterSpacing: "-0.03em",
            color: light ? landing.accentLight : landing.ink,
            lineHeight: 1.15,
            fontFamily: landing.fonts.heading,
          }}
        >
          {landing.brandName}
        </Typography>
        {withTagline ? (
          <Typography
            sx={{
              fontSize: size === "lg" ? 13 : 12,
              color: light ? "rgba(255,255,255,0.65)" : landing.muted,
              lineHeight: 1.3,
              mt: 0.15,
            }}
          >
            {landing.brandTagline}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
