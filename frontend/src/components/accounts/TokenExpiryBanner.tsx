import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getAccountTokenIssues } from "../../lib/accountTokenHealth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAccounts, selectAccounts } from "../../store/slices/accountsSlice";

export function TokenExpiryBanner() {
  const dispatch = useAppDispatch();
  const { items: accounts } = useAppSelector(selectAccounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const issues = getAccountTokenIssues(accounts);
  if (issues.length === 0) return null;

  const expired = issues.filter((i) => i.kind === "expired");
  const expiringSoon = issues.filter((i) => i.kind === "expiring_soon");
  const severity = expired.length > 0 ? "error" : "warning";

  const names = issues
    .map((i) => i.account.accountName ?? i.account.platform)
    .join(", ");

  return (
    <Alert
      severity={severity}
      sx={{ borderRadius: 0 }}
      action={
        <Button component={RouterLink} to="/accounts" color="inherit" size="small">
          Reconnect
        </Button>
      }
    >
      {expired.length > 0
        ? `Account token expire ho gaya: ${names}. Dubara connect karo taake posts publish hon.`
        : `Account token jald expire hoga: ${names}. Accounts page se reconnect karo.`}
      {expiringSoon.length > 0 && expired.length > 0 ? ` (${expiringSoon.length} expiring soon)` : null}
    </Alert>
  );
}
