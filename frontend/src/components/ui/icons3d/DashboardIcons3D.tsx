import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import Box from "@mui/material/Box";
import { PlatformBrandIcon } from "../../accounts/PlatformIcons";
import { Icon3D, IconPedestal } from "../Icon3D";
import { PLATFORM_META } from "../../../lib/platforms";

export type Stat3DVariant = "accounts" | "scheduled" | "published" | "drafts";

export function StatIcon3D({ variant, size = 58 }: { variant: Stat3DVariant; size?: number }) {
  switch (variant) {
    case "accounts":
      return (
        <Icon3D
          gradient={["#60a5fa", "#3B82F6", "#2563eb"]}
          shadowColor="rgba(59,130,246,0.55)"
          size={size}
        >
          <GroupsOutlinedIcon sx={{ fontSize: Math.round(size * 0.46) }} />
        </Icon3D>
      );
    case "scheduled":
      return (
        <Box sx={{ position: "relative", width: size, height: size }}>
          <Icon3D
            gradient={["#93c5fd", "#60a5fa", "#3B82F6"]}
            shadowColor="rgba(59,130,246,0.45)"
            size={size}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: Math.round(size * 0.44) }} />
          </Icon3D>
          <Box sx={{ position: "absolute", right: -4, bottom: -2 }}>
            <Icon3D
              gradient={["#fde68a", "#FBBF24", "#f59e0b"]}
              shadowColor="rgba(245,158,11,0.5)"
              size={Math.round(size * 0.42)}
              round
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: Math.round(size * 0.2) }} />
            </Icon3D>
          </Box>
        </Box>
      );
    case "published":
      return (
        <Icon3D
          gradient={["#6ee7b7", "#34D399", "#10B981"]}
          shadowColor="rgba(16,185,129,0.5)"
          size={size}
          round
        >
          <CheckOutlinedIcon sx={{ fontSize: Math.round(size * 0.44), fontWeight: 800 }} />
        </Icon3D>
      );
    case "drafts":
      return (
        <Icon3D
          gradient={["#818cf8", "#6366F1", "#4f46e5"]}
          shadowColor="rgba(99,102,241,0.5)"
          size={size}
        >
          <FolderOpenOutlinedIcon sx={{ fontSize: Math.round(size * 0.44) }} />
        </Icon3D>
      );
  }
}

const PLATFORM_3D: Record<
  string,
  { gradient: [string, string, string]; shadow: string; round?: boolean }
> = {
  LINKEDIN: { gradient: ["#3d8fd9", "#0A66C2", "#084a8a"], shadow: "rgba(10,102,194,0.5)" },
  INSTAGRAM: { gradient: ["#f58529", "#e4405f", "#833ab4"], shadow: "rgba(228,64,95,0.45)" },
  FACEBOOK: { gradient: ["#4a90f0", "#1877F2", "#0d5dbf"], shadow: "rgba(24,119,242,0.45)" },
  TWITTER: { gradient: ["#4b5563", "#1f2937", "#0f172a"], shadow: "rgba(15,23,42,0.45)" },
  REDDIT: { gradient: ["#ff6633", "#FF4500", "#cc3700"], shadow: "rgba(255,69,0,0.5)", round: true },
};

export function PlatformIcon3D({
  platform,
  size = 36,
  active = true,
}: {
  platform: string;
  size?: number;
  active?: boolean;
}) {
  const meta = PLATFORM_3D[platform] ?? {
    gradient: ["#94a3b8", "#64748b", "#475569"] as [string, string, string],
    shadow: "rgba(100,116,139,0.4)",
  };
  const dim = !active;

  return (
    <Icon3D
      gradient={
        dim
          ? (["#cbd5e1", "#94a3b8", "#64748b"] as [string, string, string])
          : meta.gradient
      }
      shadowColor={dim ? "rgba(100,116,139,0.25)" : meta.shadow}
      size={size}
      round={meta.round}
    >
      {platform === "LINKEDIN" ||
      platform === "REDDIT" ||
      platform === "FACEBOOK" ||
      platform === "INSTAGRAM" ||
      platform === "TWITTER" ? (
        <PlatformBrandIcon
          platformId={platform}
          sx={{
            fontSize: Math.round(size * (meta.round ? 0.52 : 0.48)),
            opacity: dim ? 0.85 : 1,
          }}
        />
      ) : (
        <Box component="span" sx={{ fontSize: Math.round(size * 0.34), fontWeight: 800 }}>
          {PLATFORM_META[platform]?.icon ?? "?"}
        </Box>
      )}
    </Icon3D>
  );
}

export function PlatformPedestal3D({
  platform,
  active,
  label,
}: {
  platform: string;
  active: boolean;
  label: string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minWidth: 80 }}>
      <IconPedestal size={62} active={active}>
        <PlatformIcon3D platform={platform} size={38} active={active} />
      </IconPedestal>
      <Box
        component="span"
        sx={{
          fontSize: 10.5,
          fontWeight: 500,
          color: active ? "text.primary" : "text.secondary",
          textAlign: "center",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

export function BoltIcon3D({ size = 40 }: { size?: number }) {
  return (
    <Icon3D
      gradient={["#a5b4fc", "#6366F1", "#4f46e5"]}
      shadowColor="rgba(99,102,241,0.5)"
      size={size}
      round
    >
      <BoltOutlinedIcon sx={{ fontSize: Math.round(size * 0.48) }} />
    </Icon3D>
  );
}

export function SendIcon3D({ size = 28 }: { size?: number }) {
  return (
    <Icon3D
      gradient={["#8b83ff", "#5B5FEF", "#4338ca"]}
      shadowColor="rgba(91,95,239,0.45)"
      size={size}
      round
    >
      <SendOutlinedIcon sx={{ fontSize: Math.round(size * 0.42), transform: "rotate(-28deg)" }} />
    </Icon3D>
  );
}

export function ScheduleEmptyIcon3D({ size = 72 }: { size?: number }) {
  return <StatIcon3D variant="scheduled" size={size} />;
}

export function PublishedEmptyIcon3D({ size = 72 }: { size?: number }) {
  return <StatIcon3D variant="published" size={size} />;
}
