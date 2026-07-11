import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PRODUCT_VERSION } from "../../lib/productVersion";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsTheme } from "./settingsTheme";

export function AboutPanel() {
  const { colors, fonts } = useSettingsTheme();

  return (
    <SettingsPanel title="About SMC" subtitle="Product version & release channel">
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1.75 }}>
        <Box
          component="span"
          sx={{
            fontFamily: fonts.mono,
            fontSize: 11.5,
            fontWeight: 600,
            px: "10px",
            py: "4px",
            borderRadius: "7px",
            bgcolor: colors.accentSoft,
            color: colors.accentTag,
            border: "1px solid",
            borderColor: colors.accentBorder,
          }}
        >
          v{PRODUCT_VERSION.fullVersion}
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: fonts.body,
            fontSize: 11.5,
            fontWeight: 600,
            px: "10px",
            py: "4px",
            borderRadius: "7px",
            bgcolor: colors.goldSoft,
            color: colors.gold,
            border: "1px solid",
            borderColor: colors.goldBorder,
          }}
        >
          {PRODUCT_VERSION.codename}
        </Box>
      </Box>

      <Typography
        sx={{
          fontSize: 13.5,
          color: colors.textSoft,
          lineHeight: 1.6,
          mb: 1.75,
          fontFamily: fonts.body,
        }}
      >
        {PRODUCT_VERSION.product} — professional cross-posting tool. Abhi{" "}
        <Box component="strong" sx={{ color: colors.text, fontWeight: 600 }}>
          {PRODUCT_VERSION.channel}
        </Box>{" "}
        channel par development chal rahi hai.
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          fontSize: 12,
          color: colors.muted,
          fontFamily: fonts.body,
        }}
      >
        <span>Release {PRODUCT_VERSION.releaseDate}</span>
        <Box
          sx={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            bgcolor: colors.muted,
          }}
        />
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            bgcolor: colors.chipBg,
            border: "1px solid",
            borderColor: colors.line,
            px: "9px",
            py: "4px",
            borderRadius: "7px",
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.textSoft,
          }}
        >
          API {PRODUCT_VERSION.apiVersion}
        </Box>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            bgcolor: colors.chipBg,
            border: "1px solid",
            borderColor: colors.line,
            px: "9px",
            py: "4px",
            borderRadius: "7px",
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.success,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: colors.success,
              boxShadow: `0 0 0 3px ${colors.successGlow}`,
            }}
          />
          {PRODUCT_VERSION.status}
        </Box>
      </Box>
    </SettingsPanel>
  );
}
