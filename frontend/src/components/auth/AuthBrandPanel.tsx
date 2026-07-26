import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useUiLanguage } from "../../i18n/UiLanguageProvider";
import "./authSplit.css";

export function AuthBrandPanel() {
  const { t } = useUiLanguage();

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#0B1220",
        color: "#fff",
        overflow: "hidden",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        p: "56px 64px",
        minHeight: "100vh",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(900px 520px at 8% -10%, rgba(45, 212, 191, 0.16), transparent 55%),
            radial-gradient(700px 480px at 100% 20%, rgba(30, 64, 175, 0.18), transparent 50%),
            radial-gradient(800px 500px at 40% 110%, rgba(15, 118, 110, 0.14), transparent 55%)
          `,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(145deg, #2DD4BF 0%, #0F766E 100%)",
              boxShadow: "0 8px 18px -6px rgba(15, 118, 110, 0.55)",
              display: "grid",
              placeItems: "center",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            S
          </Box>
          <Typography sx={{ fontSize: 15, letterSpacing: "0.04em", fontWeight: 600, color: "#E8EEF7" }}>
            SMC
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 2, maxWidth: 460, mt: 8 }}>
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A8BA3",
            mb: 2,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {t("auth.brand.eyebrow")}
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: { md: 38, lg: 44 },
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            mb: 2.25,
            color: "#F5F8FC",
          }}
        >
          {t("auth.brand.headlineLine1")}
          <br />
          <Box component="span" sx={{ color: "#5EEAD4" }}>
            {t("auth.brand.headlineLine2")}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.6, color: "#9AABC0", maxWidth: 400 }}>
          {t("auth.brand.subcopy")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mt: 4.5,
            py: 1.5,
            px: 2,
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            width: "fit-content",
          }}
        >
          <Box
            className="smc-auth-pulse-dot"
            sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2DD4BF", flexShrink: 0 }}
          />
          <Typography sx={{ fontSize: 13, color: "#C5D0DE" }}>
            {t("auth.brand.statusPrefix")}{" "}
            <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>
              {t("auth.brand.statusHighlight")}
            </Box>
            {t("auth.brand.statusSuffix")}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 2, maxWidth: 420 }}>
        <Typography
          sx={{
            fontSize: 14.5,
            lineHeight: 1.65,
            color: "#8A9BB0",
            borderLeft: "2px solid rgba(45, 212, 191, 0.35)",
            pl: 2,
          }}
        >
          {t("auth.brand.quote")}
          <Box component="span" sx={{ display: "block", mt: 1.25, fontSize: 13, color: "#6B7C90" }}>
            {t("auth.brand.quoteAuthor")}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
