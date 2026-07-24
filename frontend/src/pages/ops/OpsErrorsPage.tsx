import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
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
import type { OpsErrorRow } from "../../types";

export function OpsErrorsPage() {
  const { token } = useAppSelector(selectAuth);
  const [rows, setRows] = useState<OpsErrorRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setRows(await api.opsErrors(token));
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load errors");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <OpsPage>
      <OpsToolbar
        meta={
          updatedAt ? (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              Auto-refresh · last update {updatedAt.toLocaleTimeString()}
            </Typography>
          ) : undefined
        }
      >
        <OpsStatusChip label="Streaming" tone="success" />
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </OpsToolbar>

      {error ? <OpsAlert>{error}</OpsAlert> : null}

      {loading && rows.length === 0 ? (
        <OpsLoading />
      ) : (
        <OpsPanel title="Error log" subtitle={`${rows.length} recent entries`}>
          <OpsTable
            empty={rows.length === 0}
            headers={["When", "Level", "Path", "User", "Message"]}
          >
            {rows.map((r) => (
              <OpsTableRow key={r.id}>
                <TableCell>
                  <OpsMono>{new Date(r.createdAt).toLocaleString()}</OpsMono>
                </TableCell>
                <TableCell>
                  <OpsStatusChip
                    label={r.level}
                    tone={r.level === "error" ? "danger" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  <OpsMono>{r.path ?? "—"}</OpsMono>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5 }}>{r.userEmail ?? "—"}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 460 }}>
                  <Typography
                    sx={{ fontSize: 13 }}
                    title={r.stack ?? r.message}
                  >
                    {r.message}
                  </Typography>
                </TableCell>
              </OpsTableRow>
            ))}
          </OpsTable>
        </OpsPanel>
      )}
    </OpsPage>
  );
}
