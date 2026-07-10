import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { PlatformGrid } from "../components/accounts/PlatformCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  connectPlatform,
  disconnectAccount,
  fetchAccounts,
  fetchPlatforms,
  selectAccounts,
} from "../store/slices/accountsSlice";

export function AccountsPage() {
  const dispatch = useAppDispatch();
  const {
    items: accounts,
    platforms,
    loading,
    platformsLoading,
    connecting,
    error,
  } = useAppSelector(selectAccounts);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  function refreshAll() {
    dispatch(fetchAccounts());
    dispatch(fetchPlatforms());
  }

  const configuredCount = platforms.filter((p) => p.configured).length;

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Connected Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Social platforms connect karo taake post publish ho sake
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card
        title="How to connect?"
        description="Manual username/password enter nahi hota — sirf OAuth"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2" color="text.primary">
            Har platform <strong>OAuth</strong> se connect hota hai. Ek click par official login
            popup khulta hai.
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5, color: "text.secondary", fontSize: 14 }}>
            <li>Neeche se platform choose karo</li>
            <li>
              <strong>Connect</strong> dabao — popup mein authorize karo
            </li>
            <li>
              Wapas aake <strong>Refresh</strong> dabao
            </li>
          </Box>
          {configuredCount < platforms.length && (
            <Alert severity="warning" sx={{ mt: 0.5 }}>
              {platforms.length - configuredCount} platform(s) ke liye abhi{" "}
              <code>backend/.env</code> mein API keys add karni hain. &quot;Setup required&quot;
              wale cards dekho.
            </Alert>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="secondary" onClick={refreshAll}>
            Refresh list
          </Button>
        </Box>
      </Card>

      <Card title="Platforms" description={`${configuredCount} configured · ${platforms.length} total`}>
        {loading || platformsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <PlatformGrid
            platforms={platforms}
            accounts={accounts}
            connectingPlatform={connecting}
            onConnect={(slug) => dispatch(connectPlatform(slug))}
            onDisconnect={(id) => dispatch(disconnectAccount(id))}
          />
        )}
      </Card>
    </Box>
  );
}
