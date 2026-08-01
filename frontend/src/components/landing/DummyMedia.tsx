import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

type DummyProps = {
  height: number | string | Record<string, number | string>;
  width?: number | string | Record<string, number | string>;
  label?: string;
  radius?: number | string;
  bgcolor?: string;
  sx?: SxProps<Theme>;
};

/** Fixed-size media placeholder (Buffer image/logo slots). */
export function DummyMedia({
  height,
  width = "100%",
  label = "Image",
  radius = 12,
  bgcolor = "#E5E7EB",
  sx = {},
}: DummyProps) {
  return (
    <Box
      aria-hidden
      sx={[
        {
          width,
          height,
          borderRadius: radius,
          bgcolor,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label ? (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.04em" }}>
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}

export function DummyLogo({ w = 88, h = 28 }: { w?: number; h?: number }) {
  return <DummyMedia width={w} height={h} label="" bgcolor="#D1D5DB" radius={4} sx={{ border: 0 }} />;
}

export function DummyAvatar({ size = 48, color = "#C4B5FD" }: { size?: number; color?: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        flexShrink: 0,
        border: "2px solid #fff",
      }}
    />
  );
}
