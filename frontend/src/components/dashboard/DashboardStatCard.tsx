import LinkIcon from "@mui/icons-material/Link";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { dashboardFonts, useDashboardTheme } from "./dashboardTheme";

export type StatVariant = "accounts" | "scheduled" | "published" | "drafts";

const iconMap: Record<StatVariant, ReactNode> = {
  accounts: <LinkIcon sx={{ fontSize: 15 }} />,
  scheduled: <ScheduleOutlinedIcon sx={{ fontSize: 15 }} />,
  published: <CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />,
  drafts: <MenuBookOutlinedIcon sx={{ fontSize: 15 }} />,
};

type Props = {
  variant: StatVariant;
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
  const iconBg: Record<StatVariant, { bg: string; color: string }> = {
    accounts: { bg: colors.surface2, color: colors.inkSoft },
    scheduled: { bg: colors.goldSoft, color: colors.gold },
    published: { bg: colors.successSoft, color: colors.success },
    drafts: { bg: colors.accentSoft, color: colors.accent },
  };
  const iconStyle = iconBg[variant];

  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: highlighted ? colors.accentBorder : "divider",
        borderRadius: "16px",
        p: "20px 22px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: highlighted ? `0 0 0 3px ${colors.highlightRing}` : "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 14px 30px -18px rgba(20,20,40,0.28)",
            }
          : undefined,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconStyle.bg,
            color: iconStyle.color,
          }}
        >
          {iconMap[variant]}
        </Box>
      </Box>

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
  );
}
