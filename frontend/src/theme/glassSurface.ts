import type { SxProps, Theme } from "@mui/material/styles";

/** Soft panels — readable in light & dark, no ocean dependency. */
export const glassPanelSx: SxProps<Theme> = {
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? "#161A22" : "#FFFFFF",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  backgroundImage: "none",
  border: "1px solid",
  borderColor: (theme) =>
    theme.palette.mode === "dark" ? "#2A303C" : "#E7EAF0",
  boxShadow: (theme) =>
    theme.palette.mode === "dark"
      ? "0 12px 40px rgba(0,0,0,0.35)"
      : "0 8px 28px rgba(15, 23, 42, 0.05)",
};

export function glassPaperOverrides(isDark: boolean) {
  return {
    backgroundImage: "none",
    backgroundColor: isDark ? "#161A22" : "#FFFFFF",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    border: `1px solid ${isDark ? "#2A303C" : "#E7EAF0"}`,
    boxShadow: isDark
      ? "0 12px 40px rgba(0,0,0,0.35)"
      : "0 8px 28px rgba(15, 23, 42, 0.05)",
  };
}
