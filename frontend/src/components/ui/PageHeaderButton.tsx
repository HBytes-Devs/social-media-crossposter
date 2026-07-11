import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { useAppTokens } from "../../theme/AppThemeProvider";
import { getPageActionOutlinedSx, getPageActionPrimarySx } from "./pageActionButtonSx";

type Props = Omit<MuiButtonProps, "variant"> & {
  variant?: "outlined" | "primary";
};

export function PageHeaderButton({
  variant = "outlined",
  sx,
  children,
  ...props
}: Props) {
  const tokens = useAppTokens();
  const variantSx =
    variant === "primary" ? getPageActionPrimarySx(tokens) : getPageActionOutlinedSx(tokens);

  return (
    <MuiButton
      variant={variant === "primary" ? "contained" : "outlined"}
      color={variant === "primary" ? "primary" : "inherit"}
      disableElevation
      sx={[variantSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
