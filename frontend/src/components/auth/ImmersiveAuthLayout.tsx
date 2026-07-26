import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UiLanguageSelect } from "../ui/UiLanguageSelect";
import { AuthLusionBackground } from "./AuthLusionBackground";
import "./authLusion.css";

/**
 * Persistent auth chrome: Cyber Ocean + brand stay mounted across
 * /login · /register · /forgot-password · /reset-password so WebGL
 * does not tear down/rebuild (that was the navigation glitch).
 */
export function ImmersiveAuthLayout() {
  return (
    <Box
      className="smc-lusion-root"
      sx={{
        position: "relative",
        // 100dvh handles mobile browser chrome; 100vh is the fallback
        height: "100vh",
        "@supports (height: 100dvh)": { height: "100dvh" },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "#010126",
          pointerEvents: "none",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
          <AuthLusionBackground />
        </Box>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(1, 1, 38, 0.45) 100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100vh",
          "@supports (height: 100dvh)": { height: "100dvh" },
          display: "grid",
          placeItems: "center",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 2, lg: 3 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            // Single grid cell so both sides share space, but each positions itself
            // independently — the form stays centered even when the left marketing
            // text is present, hidden, or its content changes.
            gridArea: "1 / 1",
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              gridArea: "1 / 1",
              alignSelf: "center",
              justifySelf: "start",
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: 380,
              pl: { lg: 2 },
              color: "#f2f4f7",
            }}
          >
            <Typography
              className="smc-lusion-fade-in"
              sx={{
                fontFamily: "'Syne', 'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(56px, 7vw, 92px)",
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: "#f7f8fa",
                textShadow: "0 20px 60px rgba(0,0,0,0.45)",
              }}
            >
              SMC
            </Typography>
            <Typography
              className="smc-lusion-fade-in smc-lusion-delay-1"
              sx={{
                mt: 2,
                maxWidth: 340,
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(20px, 2.1vw, 28px)",
                lineHeight: 1.3,
                color: "rgba(232, 236, 240, 0.78)",
              }}
            >
              Crosspost once.
              <br />
              Reach every feed.
            </Typography>
            <Typography
              className="smc-lusion-fade-in smc-lusion-delay-2"
              sx={{
                mt: 2.5,
                fontSize: 12,
                letterSpacing: "0.05em",
                color: "rgba(160, 210, 220, 0.5)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Drag to look · Scroll to zoom
            </Typography>
          </Box>

          {/* Card chrome stays; page content swaps via Outlet */}
          <Box
            className="smc-lusion-card"
            sx={{
              // Independent grid placement: form is always centered in the
              // viewport, regardless of the left marketing column.
              gridArea: "1 / 1",
              alignSelf: "center",
              justifySelf: "center",
              width: "100%",
              maxWidth: 420,
              mt: { xs: 2, lg: 0 },
              p: { xs: "18px 18px 22px", sm: "22px 24px 28px" },
              borderRadius: "18px",
              bgcolor: "rgba(12, 22, 30, 0.72)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: `
                0 30px 80px -20px rgba(0,0,0,0.55),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              backdropFilter: "blur(22px) saturate(1.2)",
              WebkitBackdropFilter: "blur(22px) saturate(1.2)",
              pointerEvents: "auto",
              maxHeight: "calc(100dvh - 32px)",
              overflowY: "auto",
              // nicer scrollbar inside the dark card
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.2) transparent",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: { xs: 1.75, lg: 2 },
              }}
            >
              <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "baseline", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: "-0.02em",
                    color: "#f5f6f8",
                  }}
                >
                  SMC
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
                <Box
                  sx={{
                    "& .MuiSelect-select, & .MuiTypography-root, & button": {
                      color: "rgba(235,238,242,0.85) !important",
                    },
                  }}
                >
                  <UiLanguageSelect compact />
                </Box>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "9px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <ThemeToggle size="small" />
                </Box>
              </Box>
            </Box>

            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
