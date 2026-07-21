import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import "./authLusion.css";

type Props = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Auth form body only — rendered inside ImmersiveAuthLayout's glass card.
 * Does not remount WebGL (layout owns the ocean).
 */
export function ImmersiveAuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Box className="smc-lusion-card-swap">
      <Typography
        component="h1"
        sx={{
          fontFamily: "'Syne', 'Sora', sans-serif",
          fontWeight: 650,
          fontSize: { xs: 26, sm: 30 },
          letterSpacing: "-0.03em",
          color: "#f5f6f8",
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 14.5,
          lineHeight: 1.5,
          color: "rgba(200, 210, 215, 0.72)",
          mb: 3.5,
        }}
      >
        {subtitle}
      </Typography>

      <Box className="smc-lusion-form">{children}</Box>

      {footer && (
        <Box sx={{ mt: 3.25, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}

type CtaProps = {
  children: ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
};

export function ImmersiveAuthCta({ children, loading, type = "submit", onClick }: CtaProps) {
  return (
    <Button
      type={type}
      fullWidth
      disabled={loading}
      onClick={onClick}
      className="smc-lusion-cta"
      sx={{
        height: 48,
        borderRadius: "12px",
        textTransform: "none",
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "#062028",
        background: "linear-gradient(120deg, #e8f4f0 0%, #7eb8b0 48%, #3a8a82 100%)",
        boxShadow: `
          0 12px 28px -8px rgba(60, 130, 120, 0.4),
          inset 0 1px 0 rgba(255,255,255,0.65)
        `,
        gap: 1,
        transition: "transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease",
        "&:hover": {
          background: "linear-gradient(120deg, #f2faf7 0%, #8ec8c0 48%, #4a9a92 100%)",
          boxShadow: "0 16px 36px -8px rgba(60, 130, 120, 0.5)",
          transform: "translateY(-2px)",
          filter: "brightness(1.03)",
        },
        "&:active": { transform: "translateY(0)" },
        "&.Mui-disabled": {
          color: "rgba(6,32,40,0.7)",
          background: "linear-gradient(120deg, #e8f4f0 0%, #7eb8b0 48%, #3a8a82 100%)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "#062028" }} />
      ) : (
        <>
          {children}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </>
      )}
    </Button>
  );
}
