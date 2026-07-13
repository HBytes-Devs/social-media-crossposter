import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UiLanguageSelect } from "../ui/UiLanguageSelect";
import { AuthBrandPanel } from "./AuthBrandPanel";

type Props = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  footerDivider?: boolean;
};

export function AuthSplitShell({
  title,
  subtitle,
  children,
  footer,
  footerDivider = true,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        minHeight: "100vh",
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "background.default" : "#F6F7FA"),
      }}
    >
      <AuthBrandPanel />

      <Box
        sx={{
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "32px 20px", sm: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.25,
              mb: 5,
            }}
          >
            <UiLanguageSelect compact />
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                border: "0.5px solid",
                borderColor: "divider",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ThemeToggle size="small" />
            </Box>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "-0.01em",
              mb: 0.75,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 14.5, color: "text.secondary", mb: 4 }}>{subtitle}</Typography>

          {children}

          {footer && (
            <>
              {footerDivider && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    my: 3.5,
                    color: "text.disabled",
                    fontSize: 12,
                    "&::before, &::after": {
                      content: '""',
                      flex: 1,
                      height: "1px",
                      bgcolor: "divider",
                    },
                  }}
                >
                  or
                </Box>
              )}
              {!footerDivider && <Box sx={{ mt: 3.5 }} />}
              {footer}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

type CtaProps = {
  children: ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
};

export function AuthCtaButton({ children, loading, type = "submit", onClick }: CtaProps) {
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
        letterSpacing: "0.01em",
        color: "#fff",
        background: "linear-gradient(155deg, #6B7BFF 0%, #4B5FFF 45%, #3B4EE0 100%)",
        boxShadow: `
          0 10px 22px -6px rgba(75,95,255,0.55),
          inset 0 1.5px 0 rgba(255,255,255,0.35),
          inset 0 -3px 6px rgba(0,0,0,0.15)
        `,
        gap: 1,
        "&:hover": {
          background: "linear-gradient(155deg, #7583ff 0%, #5568ff 45%, #4350e8 100%)",
          boxShadow: "0 10px 24px -6px rgba(75,95,255,0.65)",
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
        "&.Mui-disabled": {
          color: "rgba(255,255,255,0.85)",
          background: "linear-gradient(155deg, #6B7BFF 0%, #4B5FFF 45%, #3B4EE0 100%)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "#fff" }} />
      ) : (
        <>
          {children}
          <ArrowForwardIcon sx={{ fontSize: 15 }} />
        </>
      )}
    </Button>
  );
}
