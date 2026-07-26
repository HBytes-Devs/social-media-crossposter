import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/** Form header + body for professional auth pages (theme-aware). */
export function ImmersiveAuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Box>
      <Typography
        component="h1"
        sx={{
          fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(20px, 2.1vw, 28px)",
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          color: "text.primary",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          lineHeight: 1.45,
          color: "text.secondary",
          mb: 2.25,
        }}
      >
        {subtitle}
      </Typography>

      <Box>{children}</Box>

      {footer && (
        <Box sx={{ mt: 2, pt: 1.75, borderTop: "1px solid", borderColor: "divider" }}>
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
      sx={{
        height: 46,
        borderRadius: "10px",
        textTransform: "none",
        fontSize: 14.5,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "#F0FDFA",
        background: "linear-gradient(145deg, #14B8A6 0%, #0F766E 55%, #115E59 100%)",
        boxShadow: `
          0 10px 24px -8px rgba(15, 118, 110, 0.45),
          inset 0 1px 0 rgba(255,255,255,0.25)
        `,
        gap: 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          background: "linear-gradient(145deg, #2DD4BF 0%, #0D9488 55%, #0F766E 100%)",
          boxShadow: "0 14px 28px -8px rgba(15, 118, 110, 0.55)",
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
        "&.Mui-disabled": {
          color: "rgba(240,253,250,0.8)",
          background: "linear-gradient(145deg, #14B8A6 0%, #0F766E 55%, #115E59 100%)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "#F0FDFA" }} />
      ) : (
        <>
          {children}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </>
      )}
    </Button>
  );
}
