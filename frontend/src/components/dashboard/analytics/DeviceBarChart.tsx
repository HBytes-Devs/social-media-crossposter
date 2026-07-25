import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { cardSx, useAnalyticsTheme } from "./analyticsTheme";

type Props = {
  title?: string;
  months: string[];
  computer: number[];
  mobile: number[];
  tooltip?: { monthIndex: number; series: "computer" | "mobile"; text: string };
};

export function DeviceBarChart({
  title = "Performance By Device Type",
  months,
  computer,
  mobile,
  tooltip,
}: Props) {
  const a = useAnalyticsTheme();
  const width = 520;
  const height = 280;
  const pad = { top: 28, right: 16, bottom: 40, left: 16 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...computer, ...mobile, 1);
  const groupW = innerW / months.length;
  const barW = Math.min(18, groupW * 0.28);
  const gap = 6;

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
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = pad.top + innerH * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke={a.gridLine}
                strokeDasharray="4 6"
              />
            );
          })}

          {months.map((m, i) => {
            const cx = pad.left + groupW * i + groupW / 2;
            const cH = (computer[i] / max) * innerH;
            const mH = (mobile[i] / max) * innerH;
            const cX = cx - barW - gap / 2;
            const mX = cx + gap / 2;
            const cY = pad.top + innerH - cH;
            const mY = pad.top + innerH - mH;
            const showTip = Boolean(tooltip && tooltip.monthIndex === i);
            const tipX = tooltip?.series === "computer" ? cX + barW / 2 : mX + barW / 2;
            const tipY = tooltip?.series === "computer" ? cY : mY;

            return (
              <g key={m}>
                <rect x={cX} y={cY} width={barW} height={cH} rx={6} fill={a.purple} />
                <rect x={mX} y={mY} width={barW} height={mH} rx={6} fill={a.cyan} />
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  fill={a.textMuted}
                  fontSize="11"
                  fontFamily={a.font}
                >
                  {m}
                </text>
                {showTip && tooltip && (
                  <g>
                    <rect
                      x={tipX - 22}
                      y={tipY - 36}
                      width={44}
                      height={26}
                      rx={8}
                      fill={a.purple}
                    />
                    <polygon
                      points={`${tipX - 5},${tipY - 10} ${tipX + 5},${tipY - 10} ${tipX},${tipY - 4}`}
                      fill={a.purple}
                    />
                    <text
                      x={tipX}
                      y={tipY - 18}
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
              </g>
            );
          })}
        </svg>
      </Box>

      <Box sx={{ display: "flex", gap: 2.5, mt: 0.5, px: 0.5 }}>
        {[
          { label: "Computer", color: a.purple },
          { label: "Mobile", color: a.cyan },
        ].map((s) => (
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
