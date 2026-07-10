import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
};

const variantMap = {
  primary: { mui: "contained" as const, color: "primary" as const },
  secondary: { mui: "outlined" as const, color: "inherit" as const },
  ghost: { mui: "text" as const, color: "inherit" as const },
  danger: { mui: "contained" as const, color: "error" as const },
};

export function Button({
  variant = "primary",
  loading,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const mapped = variantMap[variant];
  const fullWidth = className.includes("w-full");

  return (
    <MuiButton
      type={type}
      variant={mapped.mui}
      color={mapped.color}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      className={className}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
      sx={{
        minWidth: 0,
        ...(variant === "secondary" && {
          color: "text.primary",
          borderColor: "divider",
          "&:hover": {
            borderColor: "text.secondary",
            bgcolor: "action.hover",
          },
        }),
        ...(variant === "ghost" && {
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }),
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
