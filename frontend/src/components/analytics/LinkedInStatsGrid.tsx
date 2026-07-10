import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { LinkedInPostAnalytics } from "../../types";

type Props = {
  stats: LinkedInPostAnalytics;
  compact?: boolean;
};

export function LinkedInStatsGrid({ stats, compact = false }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: compact
          ? { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }
          : { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
        gap: compact ? 1.5 : 0,
        borderTop: compact ? 0 : 1,
        borderColor: "divider",
        ...(compact
          ? {}
          : {
              "& > *": {
                borderColor: "divider",
                borderRight: { sm: 1 },
                borderBottom: { xs: 1, sm: 0 },
              },
              "& > *:nth-of-type(2n)": { borderRight: { xs: 0, sm: 1 } },
              "& > *:last-child": { borderRight: 0 },
            }),
      }}
    >
      <Stat label="Impressions" value={stats.impressions} compact={compact} />
      <Stat label="Reached" value={stats.membersReached} compact={compact} />
      <Stat label="Reactions" value={stats.reactions} compact={compact} />
      {!compact && <Stat label="Comments" value={stats.comments} compact={compact} />}
      {!compact && <Stat label="Reshares" value={stats.reshares} compact={compact} />}
      {compact && <Stat label="Comments" value={stats.comments} compact={compact} />}
    </Box>
  );
}

function Stat({
  label,
  value,
  compact,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        px: compact ? 1.5 : 2,
        py: compact ? 1.25 : 1.75,
        borderRadius: compact ? 2 : 0,
        bgcolor: compact ? "action.hover" : "transparent",
        textAlign: { xs: "center", sm: compact ? "left" : "left" },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}
      >
        {label}
      </Typography>
      <Typography
        variant={compact ? "subtitle1" : "h6"}
        fontWeight={700}
        color="text.primary"
        sx={{ mt: 0.5, lineHeight: 1.2 }}
      >
        {value.toLocaleString()}
      </Typography>
    </Box>
  );
}
