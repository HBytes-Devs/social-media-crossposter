import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useComposeTheme } from "./composeTheme";

export function ComposerPageHeader() {
  const { colors, fonts } = useComposeTheme();

  return (
    <Box sx={{ mb: 2.75 }}>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: colors.accent,
          bgcolor: colors.accentSoft,
          px: "10px",
          py: "4px",
          borderRadius: 999,
          mb: 1.25,
        }}
      >
        ● Compose
      </Box>
      <Typography
        sx={{
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: 28,
          color: colors.textPrimary,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          mb: 0.5,
        }}
      >
        New post
      </Typography>
      <Typography
        sx={{
          m: 0,
          color: colors.textSecondary,
          fontSize: 14.5,
          fontFamily: fonts.body,
          lineHeight: 1.45,
        }}
      >
        Write once, publish everywhere — hashtags, language and images all in one place.
      </Typography>
    </Box>
  );
}
