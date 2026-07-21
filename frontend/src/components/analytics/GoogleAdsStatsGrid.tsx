import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { GoogleAdsMetricTotals } from "../../types";

type Props = {
  totals: GoogleAdsMetricTotals;
  compact?: boolean;
};

const METRICS: Array<{
  key: keyof GoogleAdsMetricTotals;
  label: string;
  format?: "currency" | "percent";
}> = [
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "cost", label: "Cost", format: "currency" },
  { key: "conversions", label: "Conversions" },
  { key: "ctr", label: "CTR", format: "percent" },
];

export function GoogleAdsStatsGrid({ totals, compact = false }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: compact
          ? { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }
          : { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
        gap: compact ? 1.5 : 1.25,
      }}
    >
      {METRICS.map((metric) => (
        <Stat
          key={metric.key}
          label={metric.label}
          value={formatValue(totals[metric.key], metric.format)}
          compact={compact}
        />
      ))}
    </Box>
  );
}

function formatValue(value: number | string, format?: "currency" | "percent") {
  if (typeof value === "string") return value;
  if (format === "currency") {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (format === "percent") return `${value.toFixed(2)}%`;
  return value.toLocaleString();
}

function Stat({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        px: compact ? 1.5 : 1.75,
        py: compact ? 1.25 : 1.5,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.03)",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant={compact ? "subtitle1" : "h6"}
        fontWeight={700}
        color="text.primary"
        sx={{ mt: 0.5, lineHeight: 1.2 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
