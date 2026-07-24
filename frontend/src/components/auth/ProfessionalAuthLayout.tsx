import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UiLanguageSelect } from "../ui/UiLanguageSelect";
import { AuthBrandPanel } from "./AuthBrandPanel";

/**
 * Professional split auth layout — brand panel + form panel.
 * Chrome stays mounted across login / register / forgot / reset.
 */
export function ProfessionalAuthLayout() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        minHeight: "100vh",
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "background.default" : "#F4F6F8"),
      }}
    >
      <AuthBrandPanel />

      <Box
        sx={{
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "28px 20px", sm: 6 },
          minHeight: { xs: "100vh", md: "auto" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: { xs: 3.5, md: 5 },
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
                  fontFamily: "'Syne', 'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                S
              </Box>
              <Box
                component="span"
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 650,
                  fontSize: 15,
                  letterSpacing: "0.02em",
                  color: "text.primary",
                }}
              >
                SMC
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, ml: "auto" }}>
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

          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
