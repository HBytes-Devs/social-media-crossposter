import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UiLanguageSelect } from "../ui/UiLanguageSelect";
import { AuthBrandPanel } from "./AuthBrandPanel";

/**
 * Professional split auth layout — brand panel + form panel.
 * Chrome stays mounted across login / register / forgot / reset.
 *
 * The right panel uses a two-row grid:
 *   1. Header row (auto) — language + theme, pinned at top
 *   2. Form row (1fr)    — form content centered here, scrollable
 *
 * This keeps the language selector in the SAME pixel position on every
 * auth page, regardless of how tall the form is.
 */
export function ProfessionalAuthLayout() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        height: "100vh",
        height: "100dvh",
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "background.default" : "#F4F6F8"),
        overflow: "hidden",
      }}
    >
      <AuthBrandPanel />

      <Box
        sx={{
          position: "relative",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#1A1C31" : "#FFFFFF",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          height: "100vh",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {/* Gradient overlay — mirrors the brand-panel's ambient lighting */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? `
                  radial-gradient(900px 520px at 92% -10%, rgba(45, 212, 191, 0.12), transparent 55%),
                  radial-gradient(700px 480px at 0% 30%, rgba(94, 234, 212, 0.08), transparent 50%),
                  radial-gradient(800px 500px at 60% 110%, rgba(15, 118, 110, 0.10), transparent 55%)
                `
                : `
                  radial-gradient(900px 520px at 92% -10%, rgba(45, 212, 191, 0.18), transparent 55%),
                  radial-gradient(700px 480px at 0% 30%, rgba(125, 211, 252, 0.18), transparent 50%),
                  radial-gradient(800px 500px at 60% 110%, rgba(94, 234, 212, 0.16), transparent 55%)
                `,
          }}
        />
        {/* Subtle dot pattern — same treatment as the brand panel */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)"
                : "radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Row 1 — fixed header: language + theme toggle. Never moves. */}
        <Box
          sx={{
            position: { md: "sticky" },
            top: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(26, 28, 49, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                background: "linear-gradient(145deg, #2DD4BF 0%, #0F766E 100%)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              S
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 650,
                fontSize: 15,
                letterSpacing: "0.02em",
                color: "text.primary",
              }}
            >
              SMC
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { xs: 0, md: "auto" } }}>
            <UiLanguageSelect compact />
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ThemeToggle size="small" />
            </Box>
          </Box>
        </Box>

        {/* Row 2 — form area, centered, scrollable if too tall */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: "16px 20px", sm: "20px 32px" },
            overflow: "auto",
            minHeight: 0, // allow children to shrink for overflow
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.18)",
              borderRadius: 3,
            },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400, my: "auto" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
