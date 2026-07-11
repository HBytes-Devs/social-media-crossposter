import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { useSettingsTheme } from "./settingsTheme";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SettingsPanel({ title, subtitle, children }: Props) {
  const { colors, fonts, panelSx } = useSettingsTheme();

  return (
    <Box sx={{ ...panelSx, mb: "18px" }}>
      <Typography
        sx={{
          fontFamily: fonts.heading,
          fontSize: 16,
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: 12.5,
            color: colors.muted,
            mt: 0.5,
            mb: 2.5,
            fontFamily: fonts.body,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
}
