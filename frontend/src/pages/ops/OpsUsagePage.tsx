import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  OpsAlert,
  OpsLoading,
  OpsMono,
  OpsPage,
  OpsPanel,
  OpsStatusChip,
  OpsTable,
  OpsTableRow,
  OpsToolbar,
} from "../../components/ops/OpsUi";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import { useAppTokens } from "../../theme/AppThemeProvider";
import type { OpsUsage, OpsUserRow } from "../../types";

function actionTone(action: string) {
  if (action === "LOGIN") return "success" as const;
  if (action === "POST_PUBLISH" || action === "POST_CREATE") return "accent" as const;
  if (action === "ADMIN_ACTION") return "warning" as const;
  return "neutral" as const;
}

export function OpsUsagePage() {
  const { token } = useAppSelector(selectAuth);
  const t = useAppTokens();
  const [users, setUsers] = useState<OpsUserRow[]>([]);
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<OpsUsage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    void api.opsListUsers(token).then(setUsers).catch(() => undefined);
  }, [token]);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setData(await api.opsUsage(token, { userId: userId || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const maxHour = data ? Math.max(1, ...data.hourlyBuckets) : 1;

  return (
    <OpsPage>
      <OpsToolbar>
        <TextField
          select
          size="small"
          label="User"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="">All users</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.email}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={() => void load()}>Apply</Button>
      </OpsToolbar>

      {error ? <OpsAlert>{error}</OpsAlert> : null}
      {loading ? <OpsLoading /> : null}

      {!loading && data ? (
        <>
          <OpsPanel title="Hours active (UTC)" subtitle="Intensity by hour of day">
            <Box sx={{ p: 2.25 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
                  gap: 0.55,
                }}
              >
                {data.hourlyBuckets.map((count, hour) => {
                  const intensity = count / maxHour;
                  return (
                    <Box key={hour} sx={{ textAlign: "center" }}>
                      <Box
                        title={`${hour.toString().padStart(2, "0")}:00 — ${count} events`}
                        sx={{
                          height: 56,
                          borderRadius: 1,
                          bgcolor: t.accent,
                          opacity: 0.12 + intensity * 0.88,
                          transition: "opacity 180ms ease, transform 180ms ease",
                          "&:hover": { transform: "translateY(-2px)" },
                        }}
                      />
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 9.5,
                          color: "text.secondary",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      >
                        {hour}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </OpsPanel>

          <OpsPanel title="Daily totals" subtitle="Event counts in selected range">
            <Box sx={{ p: 2, display: "flex", gap: 1.25, flexWrap: "wrap" }}>
              {Object.entries(data.dailyCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, count]) => (
                  <Box
                    key={day}
                    sx={{
                      px: 1.5,
                      py: 1.1,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      minWidth: 112,
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{day}</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 730, letterSpacing: "-0.4px" }}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              {Object.keys(data.dailyCounts).length === 0 ? (
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  No activity in range.
                </Typography>
              ) : null}
            </Box>
          </OpsPanel>

          <OpsPanel title="Recent events" subtitle="Latest telemetry samples">
            <OpsTable
              empty={data.events.length === 0}
              headers={["When", "User", "Action", "Path"]}
            >
              {data.events.map((e) => (
                <OpsTableRow key={e.id}>
                  <TableCell>
                    <OpsMono>{new Date(e.createdAt).toLocaleString()}</OpsMono>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{e.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <OpsStatusChip label={e.action} tone={actionTone(e.action)} />
                  </TableCell>
                  <TableCell>
                    <OpsMono>{e.path ?? "—"}</OpsMono>
                  </TableCell>
                </OpsTableRow>
              ))}
            </OpsTable>
          </OpsPanel>
        </>
      ) : null}
    </OpsPage>
  );
}
