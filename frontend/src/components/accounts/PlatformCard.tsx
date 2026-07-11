import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { PlatformStatus, SocialAccount } from "../../types";
import { formatTokenExpiryLabel } from "../../lib/accountTokenHealth";
import { PlatformBrandIcon } from "./PlatformIcons";
import { usePlatformTheme, type mapPlatformColors } from "./platformConnectionTheme";

type CardState = "warn" | "ok" | "default";
type PlatformColors = ReturnType<typeof mapPlatformColors>;

function parseEnvHint(
  hint: string,
  colors: PlatformColors,
  fonts: { mono: string },
): ReactNode[] {
  return hint.split(/(\b[A-Z][A-Z0-9_]+\b)/g).map((part, index) => {
    if (/^[A-Z][A-Z0-9_]+$/.test(part)) {
      return (
        <Box
          key={`${part}-${index}`}
          component="code"
          sx={{
            fontFamily: fonts.mono,
            bgcolor: colors.codeBg,
            border: "1px solid",
            borderColor: colors.codeBorder,
            px: 0.75,
            py: "1.5px",
            borderRadius: "5px",
            color: colors.codeText,
            fontSize: 11,
            display: "inline-block",
          }}
        >
          {part}
        </Box>
      );
    }
    return part;
  });
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "warn" | "ok" | "off";
}) {
  const { colors, fonts } = usePlatformTheme();

  const palette = {
    warn: {
      color: colors.warn,
      bg: colors.warnBg,
      border: colors.warnBorder,
      dot: colors.warn,
      glow: "rgba(230,164,45,0.18)",
    },
    ok: {
      color: colors.ok,
      bg: colors.okBg,
      border: colors.okBorder,
      dot: colors.ok,
      glow: "rgba(44,192,140,0.18)",
    },
    off: {
      color: colors.off,
      bg: colors.offBg,
      border: colors.offBorder,
      dot: colors.offDot,
      glow: "transparent",
    },
  }[tone];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: 11,
        fontWeight: 600,
        px: "9px",
        py: "3px",
        pl: "8px",
        borderRadius: 999,
        fontFamily: fonts.body,
        letterSpacing: "0.1px",
        color: palette.color,
        bgcolor: palette.bg,
        border: "1px solid",
        borderColor: palette.border,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: palette.dot,
          boxShadow: `0 0 0 3px ${palette.glow}`,
        }}
      />
      {label}
    </Box>
  );
}

function PlatformAvatar({ platform }: { platform: PlatformStatus }) {
  const { colors, avatarSx } = usePlatformTheme();
  const avatarStyle =
    avatarSx[platform.id as keyof typeof avatarSx] ?? {
      bgcolor: colors.offDot,
    };

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#fff",
        ...avatarStyle,
      }}
    >
      <PlatformBrandIcon platformId={platform.id} sx={{ fontSize: 20 }} />
    </Box>
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
  const { colors, fonts } = usePlatformTheme();
  const isConnected = Boolean(account);
  const canConnect = platform.configured && platform.implemented;
  const needsSetup = !platform.configured;
  const expiryLabel = account ? formatTokenExpiryLabel(account.expiresAt) : null;
  const tokenExpired = expiryLabel?.includes("expired") ?? false;
  const tokenExpiringSoon = expiryLabel?.includes("expire hoga") ?? false;

  const cardState: CardState = (() => {
    if (needsSetup || tokenExpired || tokenExpiringSoon) return "warn";
    if (isConnected) return "ok";
    return "default";
  })();

  const accentColor =
    cardState === "ok"
      ? colors.ok
      : cardState === "warn"
        ? colors.warn
        : "transparent";

  const badge = (() => {
    if (needsSetup) return { label: "Setup required", tone: "warn" as const };
    if (isConnected && tokenExpired) return { label: "Reconnect required", tone: "warn" as const };
    if (isConnected && tokenExpiringSoon) return { label: "Expiring soon", tone: "warn" as const };
    if (isConnected) return { label: "Connected", tone: "ok" as const };
    return { label: "Not connected", tone: "off" as const };
  })();

  const hint = (() => {
    if (needsSetup && platform.setupHint) {
      return {
        icon: <InfoOutlinedIcon sx={{ fontSize: 13, opacity: 0.8 }} />,
        content: (
          <>
            Add {parseEnvHint(platform.setupHint.replace(/^Add\s+/i, ""), colors, fonts)}
          </>
        ),
      };
    }
    if (isConnected && account) {
      const statusText = tokenExpired
        ? expiryLabel
        : tokenExpiringSoon
          ? expiryLabel
          : expiryLabel
            ? `${expiryLabel} · Syncing normally`
            : "OAuth connected · Syncing normally";
      return {
        icon: <CheckOutlinedIcon sx={{ fontSize: 13, opacity: 0.8 }} />,
        content: (
          <>
            {account.accountName ?? account.accountId}
            {statusText ? ` · ${statusText}` : ""}
          </>
        ),
      };
    }
    if (canConnect && !isConnected) {
      return {
        icon: <InfoOutlinedIcon sx={{ fontSize: 13, opacity: 0.8 }} />,
        content: "OAuth se connect — secure official login popup",
      };
    }
    return null;
  })();

  const actionButtonSx = {
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: 12.5,
    fontFamily: fonts.body,
    height: 44,
    minHeight: 44,
    px: "15px",
    py: 0,
    borderRadius: "10px",
    whiteSpace: "nowrap" as const,
    lineHeight: 1,
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 2, sm: 2.5 },
        background: colors.cardBg,
        border: "1px solid",
        borderColor: colors.cardBorder,
        borderRadius: "16px",
        px: { xs: 2, sm: "22px" },
        py: { xs: 2, sm: "20px" },
        overflow: "hidden",
        transition: "transform 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: colors.cardBorderHover,
        },
        "&::before":
          accentColor !== "transparent"
            ? {
                content: '""',
                position: "absolute",
                left: 0,
                top: 14,
                bottom: 14,
                width: 3,
                borderRadius: 3,
                bgcolor: accentColor,
              }
            : undefined,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          minWidth: 0,
          flex: 1,
        }}
      >
        <PlatformAvatar platform={platform} />
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            pt: "2px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: fonts.heading,
                color: colors.ink,
                fontSize: 14.5,
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {platform.name}
            </Typography>
            <StatusBadge label={badge.label} tone={badge.tone} />
          </Box>

          <Typography
            sx={{
              color: colors.desc,
              fontSize: 13,
              lineHeight: 1.45,
              fontFamily: fonts.body,
            }}
          >
            {platform.description}
          </Typography>

          {hint && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
                color: colors.hint,
                fontSize: 12,
                lineHeight: 1.5,
                mt: "1px",
                fontFamily: fonts.body,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 18,
                  flexShrink: 0,
                  mt: "1px",
                }}
              >
                {hint.icon}
              </Box>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "6px",
                  minWidth: 0,
                }}
              >
                {hint.content}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          alignSelf: { xs: "stretch", sm: "center" },
          display: "flex",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {!canConnect ? (
          <Button
            disabled
            title={platform.setupHint}
            startIcon={<BuildOutlinedIcon sx={{ fontSize: 13.5 }} />}
            sx={{
              ...actionButtonSx,
              bgcolor: colors.warnBg,
              color: colors.warn,
              border: "1px solid",
              borderColor: colors.warnBorder,
              "& .MuiButton-startIcon": { mr: "7px", ml: 0 },
              "&.Mui-disabled": {
                bgcolor: colors.warnBg,
                color: colors.warn,
                borderColor: colors.warnBorder,
                opacity: 0.85,
              },
            }}
          >
            Setup .env
          </Button>
        ) : isConnected ? (
          <Stack sx={{ gap: 1, alignItems: { xs: "stretch", sm: "flex-end" } }}>
            {(tokenExpired || tokenExpiringSoon) && (
              <Button
                disabled={connecting}
                onClick={() => onConnect(platform.slug)}
                sx={{
                  ...actionButtonSx,
                  color: "#fff",
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                  border: "none",
                  "&:hover": {
                    boxShadow: "0 8px 20px -8px rgba(91,95,239,0.55)",
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                  },
                }}
              >
                {connecting ? <CircularProgress size={16} color="inherit" /> : "Reconnect"}
              </Button>
            )}
            <Button
              onClick={() => onDisconnect?.(account!.id)}
              startIcon={<SettingsOutlinedIcon sx={{ fontSize: 13.5 }} />}
              sx={{
                ...actionButtonSx,
                bgcolor: colors.manageBg,
                color: colors.manageText,
                border: "1px solid",
                borderColor: colors.manageBorder,
                "& .MuiButton-startIcon": { mr: "7px", ml: 0 },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Manage
            </Button>
          </Stack>
        ) : (
          <Button
            disabled={connecting}
            onClick={() => onConnect(platform.slug)}
            sx={{
              ...actionButtonSx,
              color: "#fff",
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              border: "none",
              "&:hover": {
                boxShadow: "0 8px 20px -8px rgba(91,95,239,0.55)",
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              },
            }}
          >
            {connecting ? <CircularProgress size={16} color="inherit" /> : "Connect"}
          </Button>
        )}
      </Box>
    </Box>
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
    <Stack sx={{ gap: "16px" }}>
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
