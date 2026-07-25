import { createTheme, type PaletteMode } from "@mui/material/styles";
import type { AppTokens } from "./appTokens";
import { glassPaperOverrides } from "./glassSurface";

export function createAppTheme(mode: PaletteMode, tokens: AppTokens) {
  const isDark = mode === "dark";
  const glass = glassPaperOverrides(isDark);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.accent,
        light: tokens.accent2,
        dark: isDark ? "#4338ca" : "#1d4ed8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? "#64748b" : "#475569",
      },
      error: {
        main: tokens.danger,
      },
      success: {
        main: tokens.success,
      },
      warning: {
        main: tokens.warn,
      },
      action: {
        hover: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.04)",
        selected: isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.08)",
      },
      background: {
        default: tokens.pageBg,
        paper: tokens.surface,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textSecondary,
      },
      divider: tokens.border,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: tokens.fonts.body,
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? "#334155 #0f172a" : "#cbd5e1 #f8fafc",
            backgroundColor: tokens.pageBg,
            color: tokens.textPrimary,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 16,
            paddingBlock: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            ...glass,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            ...glass,
            border: `1px solid ${tokens.border}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          fullWidth: true,
        },
      },
      MuiSelect: {
        defaultProps: {
          size: "small",
        },
      },
      MuiMenu: {
        defaultProps: {
          transitionDuration: 200,
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: tokens.accentSoft,
              "&:hover": {
                backgroundColor: tokens.accentSoft,
              },
            },
          },
        },
      },
    },
  });
}
