import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import {
  OpsAlert,
  OpsLoading,
  OpsPage,
  OpsPanel,
  OpsStatusChip,
  OpsTable,
  OpsTableRow,
  OpsToolbar,
  issueStatusTone,
} from "../../components/ops/OpsUi";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsIssueRow, SupportIssueStatus } from "../../types";

export function OpsIssuesPage() {
  const { token } = useAppSelector(selectAuth);
  const [rows, setRows] = useState<OpsIssueRow[]>([]);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setRows(await api.opsIssues(token, filter || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createIssue() {
    if (!token || !title.trim() || !body.trim()) return;
    setError("");
    try {
      await api.opsCreateIssue(token, { title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function setStatus(id: string, status: SupportIssueStatus) {
    if (!token) return;
    try {
      await api.opsUpdateIssue(token, id, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <OpsPage>
      <OpsToolbar>
        <TextField
          select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="OPEN">OPEN</MenuItem>
          <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
          <MenuItem value="RESOLVED">RESOLVED</MenuItem>
        </TextField>
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </OpsToolbar>

      {error ? <OpsAlert>{error}</OpsAlert> : null}

      <OpsPanel title="Create issue" subtitle="File a manual ops ticket">
        <Box
          sx={{
            p: 2,
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr auto" },
            alignItems: "start",
          }}
        >
          <TextField
            size="small"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            size="small"
            label="Details"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button onClick={() => void createIssue()}>Add issue</Button>
        </Box>
      </OpsPanel>

      {loading ? (
        <OpsLoading />
      ) : (
        <OpsPanel title="Triage queue" subtitle={`${rows.length} issues`}>
          <OpsTable
            empty={rows.length === 0}
            headers={["When", "Issue", "Source", "User", "Priority", "Status"]}
          >
            {rows.map((r) => (
              <OpsTableRow key={r.id}>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{r.title}</Typography>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.body}
                  </Typography>
                </TableCell>
                <TableCell>
                  <OpsStatusChip
                    label={r.source}
                    tone={r.source === "PUBLISH_FAIL" ? "danger" : "neutral"}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5 }}>{r.userEmail ?? "—"}</Typography>
                </TableCell>
                <TableCell>
                  <OpsStatusChip
                    label={r.priority}
                    tone={
                      r.priority === "high"
                        ? "danger"
                        : r.priority === "low"
                          ? "neutral"
                          : "warning"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <OpsStatusChip
                      label={r.status.replace("_", " ")}
                      tone={issueStatusTone(r.status)}
                    />
                    <TextField
                      select
                      size="small"
                      value={r.status}
                      onChange={(e) =>
                        void setStatus(r.id, e.target.value as SupportIssueStatus)
                      }
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="OPEN">OPEN</MenuItem>
                      <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                      <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                    </TextField>
                  </Box>
                </TableCell>
              </OpsTableRow>
            ))}
          </OpsTable>
        </OpsPanel>
      )}
    </OpsPage>
  );
}
