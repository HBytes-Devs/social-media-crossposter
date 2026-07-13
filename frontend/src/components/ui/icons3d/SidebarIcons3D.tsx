import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { Icon3D } from "../Icon3D";

export type SidebarIconId =
  | "dashboard"
  | "compose"
  | "calendar"
  | "accounts"
  | "settings"
  | "posts-all"
  | "posts-published"
  | "posts-scheduled"
  | "posts-drafts"
  | "posts-trashed";

type IconConfig = {
  gradient: [string, string, string];
  shadow: string;
  round?: boolean;
  render: (size: number) => ReactNode;
};

const ICONS: Record<SidebarIconId, IconConfig> = {
  dashboard: {
    gradient: ["#8b83ff", "#5B5FEF", "#4338ca"],
    shadow: "rgba(91,95,239,0.5)",
    render: (s) => <DashboardOutlinedIcon sx={{ fontSize: s * 0.48 }} />,
  },
  compose: {
    gradient: ["#7dd3fc", "#38bdf8", "#0284c7"],
    shadow: "rgba(56,189,248,0.45)",
    render: (s) => <EditOutlinedIcon sx={{ fontSize: s * 0.48 }} />,
  },
  calendar: {
    gradient: ["#93c5fd", "#60a5fa", "#3B82F6"],
    shadow: "rgba(59,130,246,0.45)",
    render: (s) => <CalendarMonthOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  accounts: {
    gradient: ["#6ee7b7", "#34D399", "#059669"],
    shadow: "rgba(16,185,129,0.45)",
    render: (s) => <LinkOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  settings: {
    gradient: ["#cbd5e1", "#94a3b8", "#64748b"],
    shadow: "rgba(100,116,139,0.35)",
    round: true,
    render: (s) => <SettingsOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  "posts-all": {
    gradient: ["#a5b4fc", "#6366F1", "#4f46e5"],
    shadow: "rgba(99,102,241,0.45)",
    render: (s) => <ArticleOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  "posts-published": {
    gradient: ["#6ee7b7", "#34D399", "#10B981"],
    shadow: "rgba(16,185,129,0.5)",
    round: true,
    render: (s) => <CheckOutlinedIcon sx={{ fontSize: s * 0.46, fontWeight: 800 }} />,
  },
  "posts-scheduled": {
    gradient: ["#fde68a", "#FBBF24", "#f59e0b"],
    shadow: "rgba(245,158,11,0.5)",
    round: true,
    render: (s) => <ScheduleOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  "posts-drafts": {
    gradient: ["#818cf8", "#6366F1", "#4f46e5"],
    shadow: "rgba(99,102,241,0.45)",
    render: (s) => <DraftsOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
  "posts-trashed": {
    gradient: ["#fca5a5", "#f87171", "#ef4444"],
    shadow: "rgba(239,68,68,0.4)",
    render: (s) => <DeleteOutlineOutlinedIcon sx={{ fontSize: s * 0.46 }} />,
  },
};

type Props = {
  id: SidebarIconId;
  active?: boolean;
  size?: number;
};

export function SidebarNavIcon3D({ id, active = false, size = 28 }: Props) {
  const config = ICONS[id];
  const iconSize = Math.round(size * 0.92);

  return (
    <Box
      className={`smc-sidebar-icon-3d${active ? " smc-sidebar-icon-3d--active" : ""}`}
      sx={{
        display: "grid",
        placeItems: "center",
        width: size + 4,
        height: size + 4,
        filter: active ? "brightness(1.08) saturate(1.1)" : undefined,
      }}
    >
      <Icon3D
        gradient={config.gradient}
        shadowColor={config.shadow}
        size={iconSize}
        round={config.round}
        className="smc-sidebar-icon-3d__badge"
      >
        {config.render(iconSize)}
      </Icon3D>
    </Box>
  );
}
