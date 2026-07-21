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
    <Box className="smc-lusion-root" sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, lg: 5 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 980,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "center",
            gap: { xs: 0, lg: 5 },
          }}
        >
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: 380,
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
              width: "100%",
              maxWidth: 420,
              flex: { lg: "0 0 420px" },
              mx: { xs: "auto", lg: 0 },
              mt: { xs: 2, lg: 0 },
              p: { xs: "28px 24px", sm: "36px 32px" },
              borderRadius: "20px",
              bgcolor: "rgba(12, 22, 30, 0.72)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: `
                0 30px 80px -20px rgba(0,0,0,0.55),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              backdropFilter: "blur(22px) saturate(1.2)",
              WebkitBackdropFilter: "blur(22px) saturate(1.2)",
              pointerEvents: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: { xs: 3, lg: 4 },
              }}
            >
              <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "baseline", gap: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "-0.03em",
                    color: "#f5f6f8",
                  }}
                >
                  SMC
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
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
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
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
