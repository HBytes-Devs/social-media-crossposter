import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import { appFonts } from "../../theme/appTokens";
import {
  WelcomeFeatureIcons,
  WelcomeFloatingIcons,
  WelcomeHeroIcon3D,
} from "./WelcomeIcon3D";
import "./onboarding.css";

type Props = {
  open: boolean;
  onStartTour: () => void;
  onSkip: () => void;
};

export function WelcomeModal({ open, onStartTour, onSkip }: Props) {
  const { user } = useAppSelector(selectAuth);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <Modal
      open={open}
      aria-labelledby="smc-welcome-title"
      disableEscapeKeyDown
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <Box className="smc-welcome-backdrop" sx={{ outline: "none", width: "100%", maxWidth: 580 }}>
        <Box
          className="smc-welcome-card"
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "28px",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: `
              0 1px 0 rgba(255,255,255,0.06) inset,
              0 40px 100px -24px rgba(91,95,239,0.45),
              0 24px 48px -20px rgba(15,23,42,0.35)
            `,
            px: { xs: 3.5, sm: 5 },
            py: { xs: 4, sm: 5 },
            minHeight: { xs: 480, sm: 520 },
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,95,239,0.12), transparent 60%)",
              pointerEvents: "none",
            },
          }}
        >
          <WelcomeFloatingIcons />

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              className="smc-welcome-confetti-dot"
              sx={{
                position: "absolute",
                width: i % 2 === 0 ? 7 : 5,
                height: i % 2 === 0 ? 7 : 5,
                borderRadius: i % 3 === 0 ? "50%" : "2px",
                bgcolor: ["#5B5FEF", "#06B6D4", "#8B5CF6", "#F59E0B", "#10B981", "#0A66C2"][i],
                left: `${12 + i * 14}%`,
                bottom: 28,
                boxShadow: "0 4px 8px rgba(15,23,42,0.2)",
                animationDelay: `${i * 0.3}s`,
                pointerEvents: "none",
              }}
            />
          ))}

          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <WelcomeHeroIcon3D />

            <Typography
              id="smc-welcome-title"
              className="smc-welcome-text-1 smc-welcome-shimmer-title"
              sx={{
                fontFamily: appFonts.heading,
                fontSize: { xs: 28, sm: 34 },
                fontWeight: 800,
                letterSpacing: "-0.5px",
                mb: 1.25,
              }}
            >
              Welcome, {firstName}!
            </Typography>

            <Typography
              className="smc-welcome-text-2"
              sx={{
                fontFamily: appFonts.body,
                fontSize: { xs: 15, sm: 16.5 },
                color: "text.secondary",
                lineHeight: 1.6,
                mb: 2,
                px: { sm: 1 },
              }}
            >
              SMC mein aapka swagat hai — ek hi jagah se LinkedIn aur Reddit par post karo.
            </Typography>

            <WelcomeFeatureIcons />

            <Typography
              className="smc-welcome-text-3"
              sx={{
                fontFamily: appFonts.body,
                fontSize: 14,
                color: "text.secondary",
                opacity: 0.85,
                mb: 3,
                px: { sm: 0.5 },
              }}
            >
              Chota sa tour lein ya seedha dashboard par jayein — aap decide karein.
            </Typography>

            <Box
              className="smc-welcome-actions"
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: { sm: 1 } }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={onStartTour}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  py: 1.5,
                  borderRadius: "14px",
                  background: "linear-gradient(145deg, #6d71ff 0%, #5B5FEF 45%, #4338ca 100%)",
                  boxShadow: `
                    0 1px 0 rgba(255,255,255,0.2) inset,
                    0 14px 32px -12px rgba(91,95,239,0.65),
                    0 6px 12px -4px rgba(67,56,202,0.35)
                  `,
                  "&:hover": {
                    background: "linear-gradient(145deg, #7579ff 0%, #6366f1 45%, #4f46e5 100%)",
                    boxShadow: `
                      0 1px 0 rgba(255,255,255,0.25) inset,
                      0 18px 36px -12px rgba(91,95,239,0.75)
                    `,
                    transform: "translateY(-1px)",
                  },
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                Take a quick tour
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={onSkip}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  py: 0.75,
                  color: "text.secondary",
                }}
              >
                Skip for now — go to dashboard
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
