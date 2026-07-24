import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  OpsAlert,
  OpsKpiCard,
  OpsLoading,
  OpsPage,
  OpsPanel,
  OpsStatusChip,
  OpsTable,
  OpsTableRow,
  OpsTierBars,
  tierTone,
} from "../../components/ops/OpsUi";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsSubscriptions } from "../../types";

export function OpsSubscriptionsPage() {
  const { token } = useAppSelector(selectAuth);
  const [data, setData] = useState<OpsSubscriptions | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .opsSubscriptions(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <OpsLoading />;
  if (error) return <OpsAlert>{error}</OpsAlert>;
  if (!data) return null;

  const free = data.effectiveByTier.FREE ?? 0;
  const medium = data.effectiveByTier.MEDIUM ?? 0;
  const premium = data.effectiveByTier.PREMIUM ?? 0;

  return (
    <OpsPage>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        }}
      >
        <OpsKpiCard label="Free" value={free} />
        <OpsKpiCard label="Medium" value={medium} tone="accent" />
        <OpsKpiCard label="Premium" value={premium} tone="success" />
      </Box>

      <OpsPanel title="Effective tier mix" subtitle="Resolved from org / individual / premier rules">
        <Box sx={{ p: 2.25 }}>
          <OpsTierBars free={free} medium={medium} premium={premium} />
        </Box>
      </OpsPanel>

      <OpsPanel
        title="Organization plans"
        subtitle={`${data.organizations.length} companies`}
      >
        <OpsTable
          empty={data.organizations.length === 0}
          headers={[
            "Organization",
            "Tier",
            "Status",
            { label: "Seats", align: "right" },
            "Created",
          ]}
        >
          {data.organizations.map((org) => (
            <OpsTableRow key={org.id}>
              <TableCell>
                <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{org.name}</Typography>
              </TableCell>
              <TableCell>
                <OpsStatusChip
                  label={org.subscriptionTier}
                  tone={tierTone(org.subscriptionTier)}
                />
              </TableCell>
              <TableCell>
                <OpsStatusChip
                  label={org.subscriptionStatus}
                  tone={org.subscriptionStatus === "ACTIVE" ? "success" : "warning"}
                />
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
                  {org.seatUsed}/{org.seatLimit}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {new Date(org.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
            </OpsTableRow>
          ))}
        </OpsTable>
      </OpsPanel>
    </OpsPage>
  );
}
