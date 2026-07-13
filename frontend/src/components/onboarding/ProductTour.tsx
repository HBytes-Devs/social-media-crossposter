import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { TOUR_STEPS } from "../../lib/onboarding";
import { appFonts } from "../../theme/appTokens";
import "./onboarding.css";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  active: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
};

const PAD = 8;

function measureTarget(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  el.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

export function ProductTour({ active, step, onNext, onPrev, onSkip, onFinish }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const current = TOUR_STEPS[step];
  const isLast = step >= TOUR_STEPS.length - 1;

  const updateRect = useCallback(() => {
    if (!active || !current) {
      setRect(null);
      return;
    }
    setRect(measureTarget(current.target));
  }, [active, current]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    const t = window.setTimeout(updateRect, 120);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      window.clearTimeout(t);
    };
  }, [updateRect, step]);

  if (!active || !current) return null;

  const tooltipTop = rect ? Math.min(rect.top + rect.height + 16, window.innerHeight - 220) : 120;
  const tooltipLeft = rect
    ? Math.min(Math.max(rect.left, 16), window.innerWidth - 340)
    : 16;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        pointerEvents: "none",
      }}
    >
      {rect && (
        <Box
          className="smc-tour-spotlight"
          sx={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 1401,
          }}
        />
      )}

      {!rect && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(8,10,28,0.72)",
            pointerEvents: "auto",
            zIndex: 1400,
          }}
        />
      )}

      <Box
        className="smc-tour-tooltip"
        sx={{
          position: "fixed",
          top: tooltipTop,
          left: tooltipLeft,
          width: 320,
          maxWidth: "calc(100vw - 32px)",
          bgcolor: "background.paper",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 24px 60px -16px rgba(0,0,0,0.45)",
          p: 2.5,
          pointerEvents: "auto",
          zIndex: 1402,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Typography
            sx={{
              fontFamily: appFonts.heading,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {current.title}
          </Typography>
          <IconButton size="small" onClick={onSkip} aria-label="Skip tour" sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontFamily: appFonts.body,
            fontSize: 13.5,
            color: "text.secondary",
            lineHeight: 1.55,
            mb: 2,
          }}
        >
          {current.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: appFonts.body, fontWeight: 600 }}>
            {step + 1} / {TOUR_STEPS.length}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.75 }}>
            <Button
              size="small"
              disabled={step === 0}
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={onPrev}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Back
            </Button>
            <Button
              size="small"
              variant="contained"
              endIcon={!isLast ? <ArrowForwardIcon sx={{ fontSize: 16 }} /> : undefined}
              onClick={isLast ? onFinish : onNext}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #5B5FEF, #8B5CF6)",
                boxShadow: "none",
              }}
            >
              {isLast ? "Finish" : "Next"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 1.75 }}>
          {TOUR_STEPS.map((s, i) => (
            <Box
              key={s.id}
              sx={{
                width: i === step ? 18 : 6,
                height: 6,
                borderRadius: 999,
                bgcolor: i === step ? "primary.main" : "action.selected",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
