import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlatformGrid } from "../components/accounts/PlatformCard";
import { platformFonts } from "../components/accounts/platformConnectionTheme";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearAccountsError,
  connectPlatform,
  disconnectAccount,
  fetchAccounts,
  fetchPlatforms,
  selectAccounts,
} from "../store/slices/accountsSlice";

export function AccountsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);
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

  useEffect(() => {
    const connected = searchParams.get("connected");
    const account = searchParams.get("account");
    const oauthError = searchParams.get("oauth_error");

    if (connected) {
      setOauthMessage(
        account
          ? `${connected.toUpperCase()} connected: ${account}`
          : `${connected.toUpperCase()} account connected successfully`,
      );
      dispatch(fetchAccounts());
      setSearchParams({}, { replace: true });
    } else if (oauthError) {
      setOauthMessage(`Connection failed: ${oauthError}`);
      dispatch(clearAccountsError());
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, dispatch, setSearchParams]);

  function refreshAll() {
    dispatch(fetchAccounts());
    dispatch(fetchPlatforms());
  }

  const configuredCount = platforms.filter((p) => p.configured).length;
  const redditConfigured = platforms.find((p) => p.id === "REDDIT")?.configured;

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column", gap: 3 }}>
      <Box sx={{ width: "100%" }}>
        <Typography
          sx={{
            fontFamily: platformFonts.mono,
            fontSize: 11,
            letterSpacing: "1.5px",
            color: "text.secondary",
            mb: 1.25,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          Accounts
        </Typography>
        <Typography
          sx={{
            fontFamily: platformFonts.heading,
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          Connected platforms
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, lineHeight: 1.5 }}
        >
          {configuredCount} configured · {platforms.length} total — OAuth se connect karo, phir
          Compose se cross-post
        </Typography>
      </Box>

      {oauthMessage && (
        <Alert
          severity={oauthMessage.startsWith("Connection failed") ? "error" : "success"}
          onClose={() => setOauthMessage(null)}
        >
          {oauthMessage}
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {loading || platformsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
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

      <Card
        title="How to connect?"
        description="Manual username/password enter nahi hota — sirf OAuth"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2" color="text.primary">
            Har platform <strong>OAuth</strong> se connect hota hai. Connect dabao — popup mein
            authorize karo — wapas yahan redirect hoge.
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5, color: "text.secondary", fontSize: 14 }}>
            <li>Neeche se platform choose karo (LinkedIn + Reddit recommended)</li>
            <li>
              <strong>Connect</strong> dabao — popup mein authorize karo
            </li>
            <li>Success par accounts list auto-refresh hogi</li>
          </Box>
          {redditConfigured && (
            <Typography variant="body2" color="text.secondary">
              Reddit setup guide:{" "}
              <Link
                href="https://github.com/Haseebcodejourney/social-media-crossposter/blob/master/docs/REDDIT_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                docs/REDDIT_SETUP.md
              </Link>
            </Typography>
          )}
          {configuredCount < platforms.length && (
            <Alert severity="warning" sx={{ mt: 0.5 }}>
              {platforms.length - configuredCount} platform(s) ke liye abhi{" "}
              <code>backend/.env</code> mein API keys add karni hain.
            </Alert>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="secondary" onClick={refreshAll}>
            Refresh list
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
