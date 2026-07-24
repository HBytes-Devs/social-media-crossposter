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
  roleTone,
  tierTone,
} from "../../components/ops/OpsUi";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsUserRow, SubscriptionTier, UserRole } from "../../types";

type Props = { accessMode?: boolean };

function formatPlatform(platform: string): string {
  const map: Record<string, string> = {
    LINKEDIN: "LinkedIn",
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    X: "X",
    REDDIT: "Reddit",
  };
  return map[platform] ?? platform;
}

export function OpsUsersPage({ accessMode = false }: Props) {
  const { token } = useAppSelector(selectAuth);
  const [users, setUsers] = useState<OpsUserRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setUsers(await api.opsListUsers(token, query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(
    userId: string,
    body: {
      role?: UserRole;
      subscriptionTier?: SubscriptionTier;
      isSuspended?: boolean;
    },
  ) {
    if (!token) return;
    setError("");
    setInfo("");
    try {
      await api.opsUpdateUser(token, userId, body);
      setInfo("User updated successfully");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <OpsPage>
      <OpsToolbar>
        <TextField
          size="small"
          placeholder="Search email or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </OpsToolbar>

      {error ? <OpsAlert>{error}</OpsAlert> : null}
      {info ? <OpsAlert tone="success">{info}</OpsAlert> : null}

      {loading ? (
        <OpsLoading />
      ) : (
        <OpsPanel
          title={accessMode ? "Privileged actions" : "User directory"}
          subtitle={`${users.length} accounts`}
        >
          <OpsTable
            empty={users.length === 0}
            headers={[
              "User",
              "Role",
              "Plan",
              "Connected accounts",
              "Organization",
              { label: "Posts today", align: "right" },
              "Last active",
              "Status",
              ...(accessMode ? [{ label: "Actions", align: "right" as const }] : []),
            ]}
          >
            {users.map((u) => (
              <OpsTableRow key={u.id}>
                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
                    {u.name || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    {u.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {accessMode ? (
                    <TextField
                      select
                      size="small"
                      value={u.role}
                      onChange={(e) => void patch(u.id, { role: e.target.value as UserRole })}
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="USER">USER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                      <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
                    </TextField>
                  ) : (
                    <OpsStatusChip label={u.role.replace("_", " ")} tone={roleTone(u.role)} />
                  )}
                </TableCell>
                <TableCell>
                  {accessMode ? (
                    <TextField
                      select
                      size="small"
                      value={u.individualTier}
                      onChange={(e) =>
                        void patch(u.id, {
                          subscriptionTier: e.target.value as SubscriptionTier,
                        })
                      }
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="FREE">FREE</MenuItem>
                      <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                      <MenuItem value="PREMIUM">PREMIUM</MenuItem>
                    </TextField>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                      <OpsStatusChip
                        label={u.subscription.tier}
                        tone={tierTone(u.subscription.tier)}
                      />
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        {u.subscription.source ?? "individual"}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 320 }}>
                  {(u.connectedAccounts?.length ?? 0) === 0 ? (
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                      None linked
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
                      <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 650 }}>
                        {u.connectedAccounts.length} linked
                      </Typography>
                      {u.connectedAccounts.map((a) => (
                        <Box
                          key={a.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            minWidth: 0,
                            px: 0.75,
                            py: 0.45,
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "action.hover",
                          }}
                        >
                          <OpsStatusChip
                            label={formatPlatform(a.platform)}
                            tone={a.platform === "LINKEDIN" || a.platform === "FACEBOOK" ? "accent" : "info"}
                          />
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={`${a.accountName || a.accountId} (${a.accountId})`}
                          >
                            {a.accountName || a.accountId}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13 }}>{u.organization?.name ?? "—"}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{u.postsToday}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <OpsStatusChip
                    label={u.isSuspended ? "Suspended" : "Active"}
                    tone={u.isSuspended ? "danger" : "success"}
                  />
                </TableCell>
                {accessMode ? (
                  <TableCell align="right">
                    <Button
                      variant={u.isSuspended ? "secondary" : "danger"}
                      onClick={() => void patch(u.id, { isSuspended: !u.isSuspended })}
                    >
                      {u.isSuspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </TableCell>
                ) : null}
              </OpsTableRow>
            ))}
          </OpsTable>
        </OpsPanel>
      )}
    </OpsPage>
  );
}
