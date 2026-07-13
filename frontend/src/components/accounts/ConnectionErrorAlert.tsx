import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import {
  describeConnectionIssue,
  getAccountConnectionStatus,
  isAuthConnectionError,
} from "../../lib/accountTokenHealth";
import type { SocialAccount } from "../../types";

type Props = {
  accounts: SocialAccount[];
  selectedAccountIds?: string[];
  publishError?: string | null;
  onDismiss?: () => void;
};

export function ConnectionErrorAlert({
  accounts,
  selectedAccountIds,
  publishError,
  onDismiss,
}: Props) {
  const scoped =
    selectedAccountIds && selectedAccountIds.length > 0
      ? accounts.filter((a) => selectedAccountIds.includes(a.id))
      : accounts;

  const connectionMessages = scoped
    .map((account) => describeConnectionIssue(account))
    .filter((msg): msg is string => Boolean(msg));

  const expiredCount = scoped.filter(
    (a) => getAccountConnectionStatus(a) === "expired",
  ).length;

  const publishConnectionError =
    publishError && isAuthConnectionError(publishError)
      ? `${publishError} — Accounts page se platform reconnect karo.`
      : null;

  const message =
    publishConnectionError ??
    (connectionMessages.length > 0 ? connectionMessages.join(" ") : null);

  if (!message) return null;

  const severity =
    expiredCount > 0 || publishConnectionError ? "error" : "warning";

  return (
    <Alert
      severity={severity}
      onClose={onDismiss}
      sx={{ mb: 1.5 }}
      action={
        <Button component={RouterLink} to="/accounts" color="inherit" size="small">
          Fix connection
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
