import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import "./icons3d.css";

export type Icon3DProps = {
  children: ReactNode;
  gradient: [string, string, string?];
  shadowColor: string;
  size?: number;
  className?: string;
  round?: boolean;
};

export function Icon3D({
  children,
  gradient,
  shadowColor,
  size = 52,
  className = "",
  round = false,
}: Icon3DProps) {
  const [top, mid, bottom = mid] = gradient;
  const radius = round ? "50%" : `${Math.round(size * 0.26)}px`;

  return (
    <Box
      className={`smc-icon-3d ${className}`.trim()}
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: `linear-gradient(145deg, ${top} 0%, ${mid} 50%, ${bottom} 100%)`,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        boxShadow: `
          0 1px 0 rgba(255,255,255,0.5) inset,
          0 -3px 0 rgba(0,0,0,0.1) inset,
          0 16px 32px -12px ${shadowColor},
          0 8px 16px -6px rgba(15,23,42,0.22),
          0 2px 4px rgba(15,23,42,0.12)
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "2px",
          borderRadius: round ? "50%" : `${Math.max(Math.round(size * 0.26) - 2, 4)}px`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 45%, transparent 100%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          border: "1px solid rgba(255,255,255,0.24)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center" }}>
        {children}
      </Box>
    </Box>
  );
}

export function IconPedestal({
  children,
  size = 64,
  active = false,
}: {
  children: ReactNode;
  size?: number;
  active?: boolean;
}) {
  return (
    <Box
      className="smc-icon-pedestal"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        border: "1px solid",
        borderColor: active ? "primary.light" : "divider",
        ...(active
          ? {
              boxShadow:
                "0 0 0 4px rgba(91,95,239,0.12), 0 12px 28px -10px rgba(91,95,239,0.35), inset 0 2px 6px rgba(255,255,255,0.95)",
            }
          : {}),
      }}
    >
      {children}
    </Box>
  );
}
