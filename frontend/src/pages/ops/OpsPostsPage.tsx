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
} from "../../components/ops/OpsUi";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsPostRow } from "../../types";

function statusTone(status: string) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  if (status === "PARTIAL" || status === "PUBLISHING") return "warning" as const;
  if (status === "SCHEDULED") return "info" as const;
  return "neutral" as const;
}

export function OpsPostsPage() {
  const { token } = useAppSelector(selectAuth);
  const [posts, setPosts] = useState<OpsPostRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setPosts(
        await api.opsPosts(token, {
          q: q || undefined,
          status: status || undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [token, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <OpsPage>
      <OpsToolbar>
        <TextField
          size="small"
          placeholder="Search content or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="DRAFT">DRAFT</MenuItem>
          <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
          <MenuItem value="PUBLISHING">PUBLISHING</MenuItem>
          <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
          <MenuItem value="FAILED">FAILED</MenuItem>
          <MenuItem value="PARTIAL">PARTIAL</MenuItem>
        </TextField>
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </OpsToolbar>

      {error ? <OpsAlert>{error}</OpsAlert> : null}

      {loading ? (
        <OpsLoading />
      ) : (
        <OpsPanel title="Global feed" subtitle={`${posts.length} posts`}>
          <OpsTable
            empty={posts.length === 0}
            headers={["When", "Author", "Status", "Platforms", "Preview"]}
          >
            {posts.map((p) => (
              <OpsTableRow key={p.id}>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {new Date(p.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
                    {p.userName || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    {p.userEmail}
                  </Typography>
                </TableCell>
                <TableCell>
                  <OpsStatusChip label={p.status} tone={statusTone(p.status)} />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5 }}>
                    {p.platforms.join(", ") || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 380 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={p.contentPreview}
                  >
                    {p.contentPreview || "—"}
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
