import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { cardSx, useAnalyticsTheme } from "./analyticsTheme";

export type VisitorRow = {
  id: string;
  country: string;
  flag: string;
  changePct: number;
  bars: number[];
};

type Props = {
  title?: string;
  rows: VisitorRow[];
  activeId?: string;
};

function MiniBars({
  values,
  active,
  purple,
}: {
  values: number[];
  active: boolean;
  purple: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 28 }}>
      {values.map((v, i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            height: `${Math.max(18, (v / max) * 100)}%`,
            borderRadius: 1,
            bgcolor: active ? "rgba(255,255,255,0.85)" : purple,
            opacity: active ? 1 : 0.55 + (i / values.length) * 0.45,
          }}
        />
      ))}
    </Box>
  );
}

export function VisitorsPanel({ title = "Visitors", rows, activeId }: Props) {
  const a = useAnalyticsTheme();
  const selected = activeId ?? rows[0]?.id;

  return (
    <Box sx={{ ...cardSx(a), p: "18px 20px", minWidth: 0, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.75,
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: a.font,
            fontSize: 16,
            fontWeight: 700,
            color: a.text,
          }}
        >
          {title}
        </Typography>
        <Button
          startIcon={<FilterListRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            fontFamily: a.font,
            fontWeight: 500,
            fontSize: 12.5,
            color: a.textSoft,
            bgcolor: a.inputBg,
            borderRadius: "10px",
            px: 1.5,
            height: 34,
            boxShadow: "none",
            border: `1px solid ${a.border}`,
            "&:hover": { bgcolor: a.chipBg, boxShadow: "none" },
          }}
        >
          Filter
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {rows.map((row) => {
          const active = row.id === selected;
          const up = row.changePct >= 0;
          return (
            <Box
              key={row.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 1.25,
                borderRadius: "14px",
                bgcolor: active ? a.purple : "transparent",
                color: active ? "#fff" : a.text,
                transition: "background 0.15s ease",
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: active ? "rgba(255,255,255,0.18)" : a.inputBg,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {row.flag}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: a.font,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "inherit",
                  }}
                >
                  {row.country}
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: "999px",
                  bgcolor: active
                    ? "rgba(255,255,255,0.18)"
                    : up
                      ? a.successSoft
                      : a.dangerSoft,
                  color: active ? "#fff" : up ? a.success : a.danger,
                  fontFamily: a.font,
                  fontSize: 11.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {up ? "+" : ""}
                {row.changePct}%
              </Box>

              <MiniBars values={row.bars} active={active} purple={a.purple} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
