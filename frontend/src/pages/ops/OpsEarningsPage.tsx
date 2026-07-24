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
  tierTone,
} from "../../components/ops/OpsUi";
import { api } from "../../lib/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import type { OpsEarnings } from "../../types";

export function OpsEarningsPage() {
  const { token } = useAppSelector(selectAuth);
  const [data, setData] = useState<OpsEarnings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .opsEarnings(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <OpsLoading />;
  if (error) return <OpsAlert>{error}</OpsAlert>;
  if (!data) return null;

  return (
    <OpsPage>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        }}
      >
        <OpsKpiCard
          label="Estimated MRR"
          value={`$${data.estimatedMrr.toLocaleString()}`}
          hint={`${data.currency} · plan list prices`}
          tone="success"
        />
        <OpsKpiCard label="Paid accounts" value={data.paidCount} tone="accent" />
        <OpsKpiCard
          label="New paid signal · 24h"
          value={data.newPaid24h}
          hint="Based on recent account updates"
          tone={data.newPaid24h > 0 ? "warning" : "neutral"}
        />
      </Box>

      <OpsAlert tone="info">{data.note}</OpsAlert>

      <OpsPanel title="Paid accounts" subtitle="Contributors to estimated MRR">
        <OpsTable
          empty={data.paidAccounts.length === 0}
          headers={[
            "Account",
            "Tier",
            "Source",
            { label: "MRR", align: "right" },
            "Updated",
          ]}
        >
          {data.paidAccounts.map((row) => (
            <OpsTableRow key={row.id}>
              <TableCell>
                <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
                  {row.name || "—"}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  {row.email}
                </Typography>
              </TableCell>
              <TableCell>
                <OpsStatusChip label={row.tier} tone={tierTone(row.tier)} />
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, textTransform: "capitalize" }}>
                  {row.source}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                  ${row.mrr}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {new Date(row.updatedAt).toLocaleString()}
                </Typography>
              </TableCell>
            </OpsTableRow>
          ))}
        </OpsTable>
      </OpsPanel>
    </OpsPage>
  );
}
