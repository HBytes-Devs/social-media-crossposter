import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GoogleAdsDailyMetric } from "../../types";

type Props = {
  daily: GoogleAdsDailyMetric[];
  metric?: "clicks" | "impressions" | "cost" | "conversions";
  height?: number;
};

export function GoogleAdsChart({ daily, metric = "clicks", height = 180 }: Props) {
  if (daily.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No daily data for this range
        </Typography>
      </Box>
    );
  }

  const values = daily.map((row) => row[metric]);
  const max = Math.max(...values, 1);
  const width = 640;
  const padding = 24;
  const chartHeight = height - padding * 2;
  const step = daily.length > 1 ? (width - padding * 2) / (daily.length - 1) : 0;

  const points = daily
    .map((row, index) => {
      const x = padding + index * step;
      const y = padding + chartHeight - (row[metric] / max) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const label = metric.charAt(0).toUpperCase() + metric.slice(1);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Daily {label}
      </Typography>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="googleAdsLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4285F4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4285F4" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
            );
          })}
          <polyline
            fill="none"
            stroke="#4285F4"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
          <polygon
            fill="url(#googleAdsLine)"
            points={`${padding},${padding + chartHeight} ${points} ${padding + (daily.length - 1) * step},${padding + chartHeight}`}
          />
        </svg>
      </Box>
    </Box>
  );
}
