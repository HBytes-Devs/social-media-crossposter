import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useUiLanguage } from "../../i18n/UiLanguageProvider";
import { AuthThreeBackground } from "./AuthThreeBackground";
import "./authSplit.css";

export function AuthBrandPanel() {
  const { t } = useUiLanguage();

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#0A0D16",
        color: "#fff",
        overflow: "hidden",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        p: "56px 64px",
        minHeight: "100vh",
      }}
    >
      <AuthThreeBackground />
      <Box
        className="smc-auth-mesh"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(600px 500px at 15% 15%, rgba(75,95,255,0.18), transparent 60%),
            radial-gradient(500px 450px at 85% 75%, rgba(140,107,255,0.14), transparent 60%),
            radial-gradient(700px 600px at 60% 100%, rgba(75,95,255,0.08), transparent 60%)
          `,
          filter: "blur(6px)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            className="smc-auth-logo-mark"
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(155deg, #7C8CFF 0%, #4B5FFF 55%, #3140D6 100%)",
              boxShadow: `
                0 6px 14px -4px rgba(75,95,255,0.55),
                inset 0 1.5px 0 rgba(255,255,255,0.55),
                inset 0 -4px 8px rgba(0,0,0,0.22)
              `,
              display: "grid",
              placeItems: "center",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: 17,
              textShadow: "0 1px 1px rgba(0,0,0,0.3)",
            }}
          >
            S
          </Box>
          <Typography sx={{ fontSize: 15, letterSpacing: "0.4px", fontWeight: 500, color: "#EDEEF4" }}>
            SMC
          </Typography>
        </Box>
      </Box>

      <Box
        aria-hidden
        sx={{ position: "absolute", top: 52, right: 64, zIndex: 2, width: 76, height: 76 }}
      >
        <Box
          className="smc-auth-float-main"
          sx={{
            position: "absolute",
            width: 64,
            height: 64,
            top: 0,
            left: 0,
            borderRadius: "18px",
            background: "linear-gradient(155deg, #9C88FF 0%, #8C6BFF 45%, #5A3FD8 100%)",
            boxShadow: `
              0 22px 36px -12px rgba(140,107,255,0.55),
              inset 0 2px 0 rgba(255,255,255,0.5),
              inset 0 -6px 12px rgba(0,0,0,0.28)
            `,
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2l8 3.5v6c0 5-3.4 8.6-8 10.5-4.6-1.9-8-5.5-8-10.5v-6L12 2z"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 12l1.8 1.8L15 10.2"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
        <Box
          className="smc-auth-float-mini"
          sx={{
            position: "absolute",
            width: 34,
            height: 34,
            bottom: -8,
            right: -10,
            borderRadius: "11px",
            background: "linear-gradient(155deg, #5BE0B3 0%, #22C08A 55%, #0E8F68 100%)",
            boxShadow: `
              0 10px 18px -6px rgba(34,192,138,0.55),
              inset 0 1.5px 0 rgba(255,255,255,0.55),
              inset 0 -3px 6px rgba(0,0,0,0.25)
            `,
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12l4 4 10-10"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 2, maxWidth: 460, mt: 8 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#A9AEC4",
            mb: 2.25,
          }}
        >
          {t("auth.brand.eyebrow")}
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: { md: 40, lg: 44 },
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            mb: 2.25,
            color: "#F5F6FA",
          }}
        >
          {t("auth.brand.headlineLine1")}
          <br />
          <Box component="em" sx={{ fontStyle: "italic", color: "#B9C0FF" }}>
            {t("auth.brand.headlineLine2")}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 15.5, lineHeight: 1.6, color: "#B7BAC9", maxWidth: 400 }}>
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
            bgcolor: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            width: "fit-content",
            backdropFilter: "blur(6px)",
          }}
        >
          <Box
            className="smc-auth-pulse-dot"
            sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22C08A", flexShrink: 0 }}
          />
          <Typography sx={{ fontSize: 13, color: "#D5D8E4" }}>
            {t("auth.brand.statusPrefix")}{" "}
            <Box component="span" sx={{ color: "#fff", fontWeight: 500 }}>
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
            color: "#9EA3B5",
            borderLeft: "2px solid rgba(255,255,255,0.18)",
            pl: 2,
          }}
        >
          {t("auth.brand.quote")}
          <Box component="span" sx={{ display: "block", mt: 1.25, fontSize: 13, color: "#7B8096" }}>
            {t("auth.brand.quoteAuthor")}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
