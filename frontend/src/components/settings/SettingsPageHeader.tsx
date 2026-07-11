import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useSettingsTheme } from "./settingsTheme";

type Props = {
  title: string;
  subtitle: string;
};

export function SettingsPageHeader({ title, subtitle }: Props) {
  const { colors, fonts } = useSettingsTheme();

  return (
    <Box sx={{ mb: 3.75 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "11px",
            flexShrink: 0,
            bgcolor: colors.accentSoft,
            border: "1px solid",
            borderColor: colors.accentBorder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.accent,
            mt: "2px",
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: "-0.4px",
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: colors.muted,
              fontSize: 13.5,
              mt: 0.625,
              fontFamily: fonts.body,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
