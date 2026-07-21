import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTokens } from "../../theme/appTokens";

export const pageActionButtonBaseSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  lineHeight: 1,
  height: 44,
  minHeight: 44,
  maxHeight: 44,
  padding: "0 14px",
  paddingBlock: "0",
  paddingInline: "14px",
  borderRadius: "10px",
  minWidth: 0,
  "& .MuiButton-startIcon": {
    margin: 0,
    marginRight: "6px",
  },
};

export function getPageActionOutlinedSx(t: AppTokens): SxProps<Theme> {
  return {
    ...pageActionButtonBaseSx,
    borderColor: t.line,
    color: "text.primary",
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px)",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: t.cardShadow || "0 4px 14px -6px rgba(20,20,40,0.18)",
      borderColor: t.line,
      bgcolor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)",
    },
  };
}

export function getPageActionPrimarySx(t: AppTokens): SxProps<Theme> {
  return {
    ...pageActionButtonBaseSx,
    background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
    boxShadow: "none",
    color: "#ffffff",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: `0 10px 24px -8px ${t.accentSoft}`,
      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
      color: "#ffffff",
    },
    "&.Mui-disabled": {
      background: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(16,24,40,0.08)",
      color: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.45)" : "rgba(16,24,40,0.38)",
      opacity: 1,
      boxShadow: "none",
      border: "1px solid",
      borderColor: t.line,
    },
  };
}
