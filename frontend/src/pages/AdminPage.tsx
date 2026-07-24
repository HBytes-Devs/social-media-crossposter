import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useAppSelector } from "../store/hooks";
import { selectAuth } from "../store/slices/authSlice";
import type {
  AdminOrganization,
  AdminUserRow,
  SubscriptionTier,
  UserRole,
} from "../types";

function isAdminRole(role: UserRole | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function AdminPage() {
  const { user, token } = useAppSelector(selectAuth);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [orgs, setOrgs] = useState<AdminOrganization[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgTier, setOrgTier] = useState<SubscriptionTier>("MEDIUM");
  const [orgSeats, setOrgSeats] = useState(5);
  const [inviteOrgId, setInviteOrgId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [lastInviteToken, setLastInviteToken] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [usersRes, orgsRes] = await Promise.all([
        api.adminListUsers(token, query),
        api.adminListOrganizations(token),
      ]);
      setUsers(usersRes);
      setOrgs(orgsRes);
      if (!inviteOrgId && orgsRes[0]) {
        setInviteOrgId(orgsRes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [token, query, inviteOrgId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdminRole(user?.role)) {
    return <Navigate to="/" replace />;
  }

  async function patchUser(
    userId: string,
    body: {
      role?: UserRole;
      subscriptionTier?: SubscriptionTier;
      organizationId?: string | null;
    },
  ) {
    if (!token) return;
    setError("");
    setInfo("");
    try {
      await api.adminUpdateUser(token, userId, body);
      setInfo("User updated");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function createOrg() {
    if (!token || !orgName.trim()) return;
    setError("");
    try {
      await api.adminCreateOrganization(token, {
        name: orgName.trim(),
        subscriptionTier: orgTier,
        seatLimit: orgSeats,
      });
      setOrgName("");
      setInfo("Organization created");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function updateOrgTier(orgId: string, subscriptionTier: SubscriptionTier) {
    if (!token) return;
    try {
      await api.adminUpdateOrganization(token, orgId, { subscriptionTier });
      setInfo("Organization plan updated");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function updateOrgSeats(orgId: string, seatLimit: number) {
    if (!token) return;
    try {
      await api.adminUpdateOrganization(token, orgId, { seatLimit });
      setInfo("Seat limit updated");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function createInvite() {
    if (!token || !inviteOrgId || !inviteEmail.trim()) return;
    setError("");
    try {
      const res = await api.adminCreateInvite(token, inviteOrgId, inviteEmail.trim());
      setLastInviteToken(res.token);
      setInviteEmail("");
      setInfo(`Invite created for ${res.email}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    }
  }

  return (
    <Box>
      <PageHeader
        title="Admin"
        subtitle="Manage users, packages, and company accounts"
        actions={
          <Button variant="secondary" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {info && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {info}
        </Typography>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Users" />
        <Tab label="Organizations" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <TextField
            size="small"
            label="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2, maxWidth: 320 }}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {users.map((row) => (
              <Box
                key={row.id}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr 1fr" },
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{row.name ?? "—"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Effective: {row.subscription.tier}
                    {row.subscription.source ? ` (${row.subscription.source})` : ""}
                  </Typography>
                </Box>

                <TextField
                  select
                  size="small"
                  label="Individual plan"
                  value={row.individualTier}
                  onChange={(e) =>
                    void patchUser(row.id, {
                      subscriptionTier: e.target.value as SubscriptionTier,
                    })
                  }
                >
                  {(["FREE", "MEDIUM", "PREMIUM"] as const).map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {tier}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Organization"
                  value={row.organizationId ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    void patchUser(row.id, {
                      organizationId: value === "" ? null : value,
                    });
                  }}
                >
                  <MenuItem value="">None (individual)</MenuItem>
                  {orgs.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Role"
                  value={row.role}
                  disabled={user?.role !== "SUPER_ADMIN"}
                  onChange={(e) =>
                    void patchUser(row.id, { role: e.target.value as UserRole })
                  }
                >
                  {(["USER", "ADMIN", "SUPER_ADMIN"] as const).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ))}
            {!loading && users.length === 0 && (
              <Typography color="text.secondary">No users found.</Typography>
            )}
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr auto" },
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              label="Company name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <TextField
              select
              size="small"
              label="Plan"
              value={orgTier}
              onChange={(e) => setOrgTier(e.target.value as SubscriptionTier)}
            >
              {(["FREE", "MEDIUM", "PREMIUM"] as const).map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {tier}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Seats"
              value={orgSeats}
              onChange={(e) => setOrgSeats(Number(e.target.value) || 1)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <Button onClick={() => void createOrg()}>Create</Button>
          </Box>

          {orgs.map((org) => (
            <Box
              key={org.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr 1fr" },
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight={600}>{org.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {org.seatUsed}/{org.seatLimit} seats · {org.pendingInvites} invites
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                label="Plan"
                value={org.subscriptionTier}
                onChange={(e) =>
                  void updateOrgTier(org.id, e.target.value as SubscriptionTier)
                }
              >
                {(["FREE", "MEDIUM", "PREMIUM"] as const).map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {tier}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Seat limit"
                defaultValue={org.seatLimit}
                onBlur={(e) => {
                  const next = Number(e.target.value) || org.seatLimit;
                  if (next !== org.seatLimit) void updateOrgSeats(org.id, next);
                }}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
          ))}

          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "1.2fr 1.5fr auto" },
              alignItems: "center",
            }}
          >
            <TextField
              select
              size="small"
              label="Invite to org"
              value={inviteOrgId}
              onChange={(e) => setInviteOrgId(e.target.value)}
            >
              {orgs.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Member email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button onClick={() => void createInvite()}>Create invite</Button>
          </Box>

          {lastInviteToken && (
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              Invite token (share with user to accept): <code>{lastInviteToken}</code>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
