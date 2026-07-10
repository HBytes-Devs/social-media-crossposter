import { alpha, useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PlatformStatus, SocialAccount } from "../../types";
import { formatTokenExpiryLabel } from "../../lib/accountTokenHealth";
import { Button } from "../ui/Button";

const PLATFORM_COLORS: Record<string, string> = {
  LINKEDIN: "#0A66C2",
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  TWITTER: "#1d9bf0",
  REDDIT: "#FF4500",
};

const PLATFORM_ICONS: Record<string, string> = {
  LINKEDIN: "in",
  INSTAGRAM: "IG",
  FACEBOOK: "f",
  TWITTER: "𝕏",
  REDDIT: "r/",
};

function PlatformIcon({ platform }: { platform: PlatformStatus }) {
  const brand = PLATFORM_COLORS[platform.id] ?? "#64748b";
  const muted = !platform.configured;

  return (
    <Avatar
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2.5,
        bgcolor: muted ? "action.selected" : brand,
        color: muted ? "text.secondary" : "#fff",
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      {PLATFORM_ICONS[platform.id] ?? "?"}
    </Avatar>
  );
}

type Props = {
  platform: PlatformStatus;
  account?: SocialAccount;
  connecting: boolean;
  onConnect: (slug: string) => void;
  onDisconnect?: (accountId: string) => void;
};

export function PlatformCard({
  platform,
  account,
  connecting,
  onConnect,
  onDisconnect,
}: Props) {
  const theme = useTheme();
  const isConnected = Boolean(account);
  const canConnect = platform.configured && platform.implemented;
  const needsSetup = !platform.configured;
  const expiryLabel = account ? formatTokenExpiryLabel(account.expiresAt) : null;
  const tokenExpired = expiryLabel?.includes("expired") ?? false;
  const tokenExpiringSoon = expiryLabel?.includes("expire hoga") ?? false;

  const cardSx = (() => {
    if (isConnected) {
      return {
        borderColor: alpha(theme.palette.primary.main, 0.35),
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.06),
      };
    }
    if (needsSetup) {
      return {
        borderColor: alpha(theme.palette.warning.main, 0.35),
        bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.08 : 0.07),
      };
    }
    return {
      borderColor: "divider",
      bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.03) : "background.paper",
    };
  })();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        ...cardSx,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Stack direction="row" gap={2} sx={{ minWidth: 0, flex: 1 }}>
          <PlatformIcon platform={platform} />
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {platform.name}
              </Typography>
              {needsSetup && (
                <Chip
                  label="Setup required"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
                />
              )}
              {isConnected && !tokenExpired && !tokenExpiringSoon && (
                <Chip
                  label="Connected"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
                />
              )}
              {isConnected && tokenExpired && (
                <Chip
                  label="Reconnect required"
                  size="small"
                  color="error"
                  variant="filled"
                  sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
                />
              )}
              {isConnected && tokenExpiringSoon && !tokenExpired && (
                <Chip
                  label="Expiring soon"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 10, fontWeight: 700 }}
                />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {platform.description}
            </Typography>

            {isConnected && account && (
              <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                {account.accountName ?? account.accountId}
                {expiryLabel && (
                  <Typography
                    component="span"
                    variant="body2"
                    color={tokenExpired ? "error.main" : tokenExpiringSoon ? "warning.main" : "text.secondary"}
                  >
                    {" "}
                    · {expiryLabel}
                  </Typography>
                )}
              </Typography>
            )}

            {needsSetup && platform.setupHint && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block", lineHeight: 1.5 }}
              >
                {platform.setupHint}
              </Typography>
            )}

            {canConnect && !isConnected && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                OAuth se connect — secure official login popup
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ flexShrink: 0 }}>
          {!canConnect ? (
            <Button variant="secondary" disabled title={platform.setupHint}>
              Setup .env
            </Button>
          ) : isConnected ? (
            <Stack spacing={1} alignItems={{ xs: "stretch", sm: "flex-end" }}>
              {(tokenExpired || tokenExpiringSoon) && (
                <Button loading={connecting} onClick={() => onConnect(platform.slug)}>
                  Reconnect
                </Button>
              )}
              <Button variant="ghost" onClick={() => onDisconnect?.(account!.id)}>
                Disconnect
              </Button>
            </Stack>
          ) : (
            <Button loading={connecting} onClick={() => onConnect(platform.slug)}>
              Connect
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export function PlatformGrid({
  platforms,
  accounts,
  connectingPlatform,
  onConnect,
  onDisconnect,
}: {
  platforms: PlatformStatus[];
  accounts: SocialAccount[];
  connectingPlatform: string | null;
  onConnect: (slug: string) => void;
  onDisconnect: (accountId: string) => void;
}) {
  return (
    <Stack spacing={1.5}>
      {platforms.map((platform) => {
        const account = accounts.find((a) => a.platform === platform.id);
        return (
          <PlatformCard
            key={platform.id}
            platform={platform}
            account={account}
            connecting={connectingPlatform === platform.id}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        );
      })}
    </Stack>
  );
}
