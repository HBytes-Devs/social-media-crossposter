import type { SxProps, Theme } from "@mui/material/styles";

/** Soft glass panels — ocean shows through, content stays readable. */
export const glassPanelSx: SxProps<Theme> = {
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? "rgba(16, 18, 36, 0.68)" : "rgba(255, 255, 255, 0.78)",
  backdropFilter: "blur(18px) saturate(1.2)",
  WebkitBackdropFilter: "blur(18px) saturate(1.2)",
  backgroundImage: "none",
};

export function glassPaperOverrides(isDark: boolean) {
  return {
    backgroundImage: "none",
    backgroundColor: isDark ? "rgba(16, 18, 36, 0.68)" : "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(18px) saturate(1.2)",
    WebkitBackdropFilter: "blur(18px) saturate(1.2)",
  };
}
