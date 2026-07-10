import { createTheme, type PaletteMode } from "@mui/material/styles";

const brand = {
  main: "#2563eb",
  light: "#3b82f6",
  dark: "#1d4ed8",
  contrastText: "#ffffff",
};

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: brand,
      secondary: {
        main: isDark ? "#64748b" : "#475569",
      },
      error: {
        main: "#dc2626",
      },
      success: {
        main: isDark ? "#22c55e" : "#16a34a",
      },
      warning: {
        main: isDark ? "#f59e0b" : "#d97706",
      },
      action: {
        hover: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.04)",
        selected: isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.08)",
      },
      background: {
        default: isDark ? "#020617" : "#f8fafc",
        paper: isDark ? "#0f172a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
      },
      divider: isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.12)",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
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
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.1)"}`,
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
    },
  });
}
