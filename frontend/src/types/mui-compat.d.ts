import type { CSSProperties } from "react";
import type { PaperProps } from "@mui/material/Paper";
import type { ResponsiveStyleValue } from "@mui/system";

/**
 * MUI v9 removed system props from the public API; prefer `sx` at call sites.
 * These Typography shims keep existing `fontWeight` / `display` usages typing
 * until they are migrated. Do not re-add removed APIs like `inputProps` —
 * those are ignored at runtime and leak onto the DOM.
 */
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
    SelectProps?: Record<string, unknown>;
  }
}

declare module "@mui/material/Menu" {
  interface MenuProps {
    PaperProps?: Partial<PaperProps>;
  }
}
