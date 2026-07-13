import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import Box from "@mui/material/Box";
import type { CSSProperties, ReactNode } from "react";
import { LinkedInIcon, RedditIcon } from "../accounts/PlatformIcons";
import { Icon3D } from "../ui/Icon3D";

type Floating3DIcon = {
  id: string;
  left: string;
  top: string;
  delay: string;
  rotate: number;
  node: ReactNode;
};

const FLOATING_3D_ICONS: Floating3DIcon[] = [
  {
    id: "linkedin",
    left: "10%",
    top: "14%",
    delay: "0s",
    rotate: -8,
    node: (
      <Icon3D
        gradient={["#3d8fd9", "#0A66C2", "#084a8a"]}
        shadowColor="rgba(10,102,194,0.55)"
        size={54}
      >
        <LinkedInIcon sx={{ fontSize: 28 }} />
      </Icon3D>
    ),
  },
  {
    id: "reddit",
    left: "80%",
    top: "16%",
    delay: "0.35s",
    rotate: 10,
    node: (
      <Icon3D
        gradient={["#ff6633", "#FF4500", "#cc3700"]}
        shadowColor="rgba(255,69,0,0.5)"
        size={50}
        round
      >
        <RedditIcon sx={{ fontSize: 26 }} />
      </Icon3D>
    ),
  },
  {
    id: "compose",
    left: "86%",
    top: "58%",
    delay: "0.7s",
    rotate: -6,
    node: (
      <Icon3D
        gradient={["#7c75ff", "#5B5FEF", "#4346c9"]}
        shadowColor="rgba(91,95,239,0.55)"
        size={48}
      >
        <EditOutlinedIcon sx={{ fontSize: 24 }} />
      </Icon3D>
    ),
  },
  {
    id: "calendar",
    left: "6%",
    top: "62%",
    delay: "1s",
    rotate: 8,
    node: (
      <Icon3D
        gradient={["#22d3ee", "#06B6D4", "#0891b2"]}
        shadowColor="rgba(6,182,212,0.5)"
        size={48}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 24 }} />
      </Icon3D>
    ),
  },
];

export function WelcomeFloatingIcons() {
  return (
    <>
      {FLOATING_3D_ICONS.map((item) => (
        <Box
          key={item.id}
          className="smc-welcome-float-3d"
          sx={{
            position: "absolute",
            left: item.left,
            top: item.top,
            pointerEvents: "none",
            zIndex: 0,
            "--smc-float-tilt": `${item.rotate}deg`,
            animationDelay: item.delay,
            filter: "drop-shadow(0 10px 20px rgba(15,23,42,0.15))",
          } as CSSProperties}
        >
          {item.node}
        </Box>
      ))}
    </>
  );
}

export function WelcomeHeroIcon3D() {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", mb: 3, perspective: "800px" }}>
      <Box
        className="smc-welcome-pulse-ring"
        sx={{
          position: "absolute",
          inset: -18,
          borderRadius: "28px",
          border: "2px solid",
          borderColor: "primary.main",
        }}
      />
      <Box className="smc-welcome-hero-tilt" sx={{ position: "relative", transformStyle: "preserve-3d" }}>
        <Icon3D
          gradient={["#8b83ff", "#5B5FEF", "#4338ca"]}
          shadowColor="rgba(91,95,239,0.65)"
          size={96}
        >
          <RocketLaunchOutlinedIcon sx={{ fontSize: 46, transform: "translateY(-2px)" }} />
        </Icon3D>
        <Box
          className="smc-welcome-orbit-dot"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 14,
            height: 14,
            ml: "-7px",
            mt: "-7px",
            borderRadius: "50%",
            background: "linear-gradient(145deg, #67e8f9, #06B6D4)",
            boxShadow: "0 4px 12px rgba(6,182,212,0.6), 0 1px 0 rgba(255,255,255,0.4) inset",
          }}
        />
      </Box>
    </Box>
  );
}

export function WelcomeFeatureIcons() {
  const features = [
    {
      icon: <LinkedInIcon sx={{ fontSize: 22 }} />,
      label: "LinkedIn",
      gradient: ["#3d8fd9", "#0A66C2", "#084a8a"] as [string, string, string],
      shadow: "rgba(10,102,194,0.45)",
    },
    {
      icon: <RedditIcon sx={{ fontSize: 22 }} />,
      label: "Reddit",
      gradient: ["#ff6633", "#FF4500", "#cc3700"] as [string, string, string],
      shadow: "rgba(255,69,0,0.4)",
      round: true,
    },
    {
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />,
      label: "Schedule",
      gradient: ["#22d3ee", "#06B6D4", "#0891b2"] as [string, string, string],
      shadow: "rgba(6,182,212,0.4)",
    },
  ];

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5, mb: 3, flexWrap: "wrap" }}>
      {features.map((f) => (
        <Box key={f.label} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
          <Icon3D gradient={f.gradient} shadowColor={f.shadow} size={44} round={"round" in f ? f.round : false}>
            {f.icon}
          </Icon3D>
          <Box component="span" sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>
            {f.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// Re-export for convenience
export { Icon3D } from "../ui/Icon3D";
