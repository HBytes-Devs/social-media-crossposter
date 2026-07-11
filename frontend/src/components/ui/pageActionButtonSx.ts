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
    bgcolor: "background.paper",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: t.cardShadow || "0 4px 14px -6px rgba(20,20,40,0.18)",
      borderColor: t.line,
      bgcolor: "background.paper",
    },
  };
}

export function getPageActionPrimarySx(t: AppTokens): SxProps<Theme> {
  return {
    ...pageActionButtonBaseSx,
    background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
    boxShadow: "none",
    color: "#fff",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: `0 10px 24px -8px ${t.accentSoft}`,
      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
    },
  };
}
