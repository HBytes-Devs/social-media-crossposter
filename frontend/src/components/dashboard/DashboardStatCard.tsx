import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { glassPanelSx } from "../../theme/glassSurface";
import { StatIcon3D, type Stat3DVariant } from "../ui/icons3d/DashboardIcons3D";
import { dashboardFonts, useDashboardTheme } from "./dashboardTheme";

type Props = {
  variant: Stat3DVariant;
  label: string;
  value: number;
  foot?: ReactNode;
  highlighted?: boolean;
  onClick?: () => void;
};

export function DashboardStatCard({
  variant,
  label,
  value,
  foot,
  highlighted,
  onClick,
}: Props) {
  const { colors } = useDashboardTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        ...glassPanelSx,
        border: "1px solid",
        borderColor: highlighted ? colors.accentBorder : "divider",
        borderRadius: "16px",
        p: "20px 22px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: highlighted
          ? `0 0 0 3px ${colors.highlightRing}`
          : "0 10px 28px -20px rgba(15,23,42,0.12)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 18px 36px -16px rgba(20,20,40,0.28)",
            }
          : undefined,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: dashboardFonts.body,
              fontSize: 12.5,
              fontWeight: 500,
              color: colors.inkSoft,
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontFamily: dashboardFonts.mono,
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-1px",
              mt: 1.5,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          {foot && (
            <Box
              sx={{
                mt: 0.75,
                fontSize: 12,
                color: colors.muted,
                fontFamily: dashboardFonts.body,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {foot}
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 0.25, filter: "drop-shadow(0 4px 8px rgba(15,23,42,0.08))" }}>
          <StatIcon3D variant={variant} size={56} />
        </Box>
      </Box>
    </Box>
  );
}

export type { Stat3DVariant as StatVariant };
