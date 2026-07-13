import type { CSSProperties } from "react";
import type { PaperProps } from "@mui/material/Paper";
import type { ResponsiveStyleValue } from "@mui/system";

type TypographySystemProps = Pick<
  CSSProperties,
  "fontWeight" | "fontFamily" | "textAlign" | "display"
>;

declare module "@mui/material/Typography" {
  interface TypographyOwnProps extends TypographySystemProps {}
}

declare module "@mui/material/Stack" {
  interface StackOwnProps {
    alignItems?: ResponsiveStyleValue<CSSProperties["alignItems"]>;
    justifyContent?: ResponsiveStyleValue<CSSProperties["justifyContent"]>;
    flexWrap?: ResponsiveStyleValue<CSSProperties["flexWrap"]>;
    flexShrink?: ResponsiveStyleValue<CSSProperties["flexShrink"]>;
    gap?: ResponsiveStyleValue<number | string>;
    display?: ResponsiveStyleValue<CSSProperties["display"]>;
  }
}

declare module "@mui/material/Modal" {
  interface ModalOwnProps {
    disableEscapeKeyDown?: boolean;
  }
}

declare module "@mui/material/TextField" {
  interface BaseTextFieldProps {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    SelectProps?: Record<string, unknown>;
  }
}

declare module "@mui/material/Checkbox" {
  interface CheckboxProps {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }
}

declare module "@mui/material/Menu" {
  interface MenuProps {
    PaperProps?: Partial<PaperProps>;
  }
}
