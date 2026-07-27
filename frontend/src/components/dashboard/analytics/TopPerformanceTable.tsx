import { useMemo, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { cardSx, useAnalyticsTheme } from "./analyticsTheme";

export type CampaignRow = {
  id: string;
  date: string;
  email: string;
  sent: string;
  clickRate: string;
  openRate: string;
  spamRate: string;
  clickTone?: "good" | "bad" | "neutral";
  openTone?: "good" | "bad" | "neutral";
};

type Props = {
  title?: string;
  rows: CampaignRow[];
  onExport?: () => void;
};

export function TopPerformanceTable({
  title = "Top Performance Campaign",
  rows,
  onExport,
}: Props) {
  const a = useAnalyticsTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(rows.slice(0, 1).map((r) => r.id)),
  );

  const rateColor = (tone?: "good" | "bad" | "neutral") => {
    if (tone === "good") return a.success;
    if (tone === "bad") return a.danger;
    return a.blue;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.email.toLowerCase().includes(q) || r.date.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ ...cardSx(a), p: "18px 20px", minWidth: 0, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: a.font,
            fontSize: 16,
            fontWeight: 700,
            color: a.text,
            flex: 1,
            minWidth: 140,
          }}
        >
          {title}
        </Typography>

        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          size="small"
          sx={{
            width: { xs: "100%", sm: 180 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "999px",
              bgcolor: a.inputBg,
              color: a.text,
              fontSize: 13,
              height: 36,
              fontFamily: a.font,
              "& fieldset": { borderColor: "transparent" },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 16, color: a.textMuted }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          onClick={onExport}
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            fontFamily: a.font,
            fontWeight: 600,
            fontSize: 13,
            color: "#fff",
            bgcolor: a.purple,
            borderRadius: "16px",
            px: 1.75,
            height: 36,
            boxShadow: "none",
            "&:hover": { bgcolor: a.purpleDeep, boxShadow: "none" },
          }}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 640,
            fontFamily: a.font,
          }}
        >
          <Box component="thead">
            <Box component="tr">
              {["", "Date", "Email", "Sent", "Click Rate", "Open Rate", "Spam Rate"].map(
                (h) => (
                  <Box
                    component="th"
                    key={h || "check"}
                    sx={{
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: a.textMuted,
                      pb: 1.25,
                      pr: 1.5,
                      borderBottom: `1px solid ${a.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </Box>
                ),
              )}
            </Box>
          </Box>
          <Box component="tbody">
            {filtered.map((row) => {
              const checked = selected.has(row.id);
              return (
                <Box component="tr" key={row.id}>
                  <Box
                    component="td"
                    sx={{ py: 1.35, pr: 0.5, borderBottom: `1px solid ${a.border}` }}
                  >
                    <IconButton size="small" onClick={() => toggle(row.id)} sx={{ p: 0.25 }}>
                      {checked ? (
                        <CheckBoxRoundedIcon sx={{ fontSize: 18, color: a.success }} />
                      ) : (
                        <CheckBoxOutlineBlankRoundedIcon
                          sx={{ fontSize: 18, color: a.textMuted }}
                        />
                      )}
                    </IconButton>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      pr: 1.5,
                      fontSize: 13,
                      color: a.textSoft,
                      borderBottom: `1px solid ${a.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.date}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      pr: 1.5,
                      borderBottom: `1px solid ${a.border}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: 10,
                          bgcolor: a.inputBg,
                          color: a.textSoft,
                        }}
                      >
                        {row.email.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: a.text,
                          fontFamily: a.font,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      pr: 1.5,
                      fontSize: 13,
                      color: a.text,
                      borderBottom: `1px solid ${a.border}`,
                    }}
                  >
                    {row.sent}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      pr: 1.5,
                      fontSize: 13,
                      fontWeight: 600,
                      color: rateColor(row.clickTone),
                      borderBottom: `1px solid ${a.border}`,
                    }}
                  >
                    {row.clickRate}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      pr: 1.5,
                      fontSize: 13,
                      fontWeight: 600,
                      color: rateColor(row.openTone ?? "good"),
                      borderBottom: `1px solid ${a.border}`,
                    }}
                  >
                    {row.openRate}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.35,
                      fontSize: 13,
                      fontWeight: 600,
                      color: a.danger,
                      borderBottom: `1px solid ${a.border}`,
                    }}
                  >
                    {row.spamRate}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
