import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
};

const variantMap = {
  primary: { mui: "contained", color: "primary" },
  secondary: { mui: "outlined", color: "inherit" },
  ghost: { mui: "text", color: "inherit" },
  danger: { mui: "contained", color: "error" },
} as const satisfies Record<
  NonNullable<ButtonProps["variant"]>,
  { mui: NonNullable<MuiButtonProps["variant"]>; color: NonNullable<MuiButtonProps["color"]> }
>;

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
