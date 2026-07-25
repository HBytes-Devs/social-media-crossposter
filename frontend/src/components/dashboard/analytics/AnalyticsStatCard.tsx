import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { cardSx, useAnalyticsTheme } from "./analyticsTheme";

type Props = {
  label: string;
  value: string;
  changePct: number;
  changeLabel?: string;
  sparkline: number[];
  tone?: "up" | "down";
  sparkColor?: string;
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 88;
  const h = 40;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 0.01);
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

export function AnalyticsStatCard({
  label,
  value,
  changePct,
  changeLabel = "Last 1 month",
  sparkline,
  tone,
  sparkColor,
}: Props) {
  const a = useAnalyticsTheme();
  const isUp = tone ? tone === "up" : changePct >= 0;
  const abs = Math.abs(changePct);
  const lineColor = sparkColor ?? (isUp ? a.blue : a.danger);

  return (
    <Box sx={{ ...cardSx(a), p: "18px 20px", minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: a.font,
          fontSize: 13,
          fontWeight: 500,
          color: a.textSoft,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          mt: 1.25,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: a.font,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.6px",
              color: a.text,
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            {isUp ? (
              <TrendingUpRoundedIcon sx={{ fontSize: 14, color: a.success }} />
            ) : (
              <TrendingDownRoundedIcon sx={{ fontSize: 14, color: a.danger }} />
            )}
            <Typography
              sx={{
                fontFamily: a.font,
                fontSize: 12,
                fontWeight: 600,
                color: isUp ? a.success : a.danger,
              }}
            >
              {abs}%
            </Typography>
            <Typography
              sx={{
                fontFamily: a.font,
                fontSize: 12,
                color: a.textMuted,
              }}
            >
              {changeLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, mb: 0.25 }}>
          <Sparkline values={sparkline} color={lineColor} />
        </Box>
      </Box>
    </Box>
  );
}
