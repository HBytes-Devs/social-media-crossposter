import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { cardSx, useAnalyticsTheme } from "./analyticsTheme";

type Series = {
  label: string;
  color: string;
  values: number[];
};

type Props = {
  title?: string;
  months: string[];
  series: [Series, Series];
  tooltip?: { monthIndex: number; seriesIndex: 0 | 1; text: string };
  yMax?: number;
};

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function StatisticLineChart({
  title = "Statistic Email Data",
  months,
  series,
  tooltip,
  yMax = 10,
}: Props) {
  const a = useAnalyticsTheme();
  const width = 640;
  const height = 280;
  const pad = { top: 28, right: 24, bottom: 40, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const yTicks = [0, 2, 4, 6, 8, 10];

  const toPoints = (values: number[]) =>
    values.map((v, i) => ({
      x: pad.left + (i / Math.max(values.length - 1, 1)) * innerW,
      y: pad.top + innerH - (Math.min(v, yMax) / yMax) * innerH,
    }));

  const paths = series.map((s) => ({
    ...s,
    points: toPoints(s.values),
    d: smoothPath(toPoints(s.values)),
  }));

  const tipSeries = tooltip ? paths[tooltip.seriesIndex] : null;
  const tipPoint = tipSeries?.points[tooltip!.monthIndex];

  return (
    <Box sx={{ ...cardSx(a), p: "20px 22px", minWidth: 0, height: "100%" }}>
      <Typography
        sx={{
          fontFamily: a.font,
          fontSize: 16,
          fontWeight: 700,
          color: a.text,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" role="img">
          {yTicks.map((tick) => {
            const y = pad.top + innerH - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke={a.gridLine}
                  strokeDasharray="4 6"
                />
                <text
                  x={pad.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={a.textMuted}
                  fontSize="11"
                  fontFamily={a.font}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {months.map((m, i) => {
            const x = pad.left + (i / Math.max(months.length - 1, 1)) * innerW;
            return (
              <text
                key={m}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fill={a.textMuted}
                fontSize="11"
                fontFamily={a.font}
              >
                {m}
              </text>
            );
          })}

          {paths.map((s) => (
            <path
              key={s.label}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {paths.map((s) =>
            s.points.map((p, i) => (
              <circle key={`${s.label}-${i}`} cx={p.x} cy={p.y} r={3.2} fill={s.color} />
            )),
          )}

          {tipPoint && tooltip && (
            <g>
              <rect
                x={tipPoint.x - 22}
                y={tipPoint.y - 36}
                width={44}
                height={26}
                rx={8}
                fill={a.purple}
              />
              <polygon
                points={`${tipPoint.x - 5},${tipPoint.y - 10} ${tipPoint.x + 5},${tipPoint.y - 10} ${tipPoint.x},${tipPoint.y - 4}`}
                fill={a.purple}
              />
              <text
                x={tipPoint.x}
                y={tipPoint.y - 18}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="700"
                fontFamily={a.font}
              >
                {tooltip.text}
              </text>
            </g>
          )}
        </svg>
      </Box>

      <Box sx={{ display: "flex", gap: 2.5, mt: 0.5, px: 0.5 }}>
        {series.map((s) => (
          <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
            <Typography
              sx={{
                fontFamily: a.font,
                fontSize: 12,
                color: a.textSoft,
                fontWeight: 500,
              }}
            >
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
