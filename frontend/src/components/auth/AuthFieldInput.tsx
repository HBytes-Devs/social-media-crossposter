import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./authSplit.css";

type Variant = "email" | "password" | "name" | "code";

const BADGE_STYLES: Record<Variant, { bg: string; shadow: string }> = {
  email: {
    bg: "linear-gradient(155deg, #7C8CFF 0%, #4B5FFF 55%, #3140D6 100%)",
    shadow: "0 3px 7px -2px rgba(75,95,255,0.5)",
  },
  password: {
    bg: "linear-gradient(155deg, #B08CFF 0%, #8C6BFF 55%, #5A3FD8 100%)",
    shadow: "0 3px 7px -2px rgba(140,107,255,0.5)",
  },
  name: {
    bg: "linear-gradient(155deg, #5BE0B3 0%, #22C08A 55%, #0E8F68 100%)",
    shadow: "0 3px 7px -2px rgba(34,192,138,0.5)",
  },
  code: {
    bg: "linear-gradient(155deg, #FFD080 0%, #F5A623 55%, #D48806 100%)",
    shadow: "0 3px 7px -2px rgba(245,166,35,0.5)",
  },
};

function BadgeIcon({ variant }: { variant: Variant }) {
  if (variant === "email") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden>
        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 6h20v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "name") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "code") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden>
      <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  variant: Variant;
  requiredMark?: boolean;
};

export function AuthFieldInput({ label, variant, requiredMark = true, id, ...inputProps }: Props) {
  const inputId = id ?? `auth-${variant}`;
  const badge = BADGE_STYLES[variant];

  return (
    <Box sx={{ mb: 2.25 }}>
      <Typography
        component="label"
        htmlFor={inputId}
        sx={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "text.primary",
          mb: "7px",
        }}
      >
        {label}
        {requiredMark && (
          <Box component="sup" sx={{ color: "#4B5FFF", fontSize: 11, ml: 0.25 }}>
            *
          </Box>
        )}
      </Typography>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Box
          className="smc-auth-icon-badge"
          sx={{
            position: "absolute",
            left: 9,
            zIndex: 2,
            width: 26,
            height: 26,
            borderRadius: "8px",
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            color: "#fff",
            background: badge.bg,
            boxShadow: `
              ${badge.shadow},
              inset 0 1px 0 rgba(255,255,255,0.45),
              inset 0 -2px 4px rgba(0,0,0,0.18)
            `,
          }}
        >
          <BadgeIcon variant={variant} />
        </Box>
        <Box
          component="input"
          id={inputId}
          {...inputProps}
          sx={{
            width: "100%",
            height: 44,
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#F6F7FA",
            py: 0,
            pl: "46px",
            pr: 1.75,
            fontSize: 14.5,
            fontFamily: "inherit",
            color: "text.primary",
            outline: "none",
            transition: "border-color .15s ease, background .15s ease, box-shadow .15s ease",
            "&::placeholder": { color: "text.disabled" },
            "&:focus": {
              borderColor: "#4B5FFF",
              bgcolor: "background.paper",
              boxShadow: "0 0 0 3px rgba(75,95,255,0.12)",
            },
          }}
        />
      </Box>
    </Box>
  );
}
