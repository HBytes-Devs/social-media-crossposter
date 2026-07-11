import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { PlatformBrandIcon } from "../accounts/PlatformIcons";
import { usePlatformTheme } from "../accounts/platformConnectionTheme";
import { PLATFORM_META, PLATFORM_ORDER } from "../../lib/platforms";
import type { SocialAccount } from "../../types";
import { useComposeTheme } from "./composeTheme";

type Props = {
  accounts: SocialAccount[];
  selectedAccounts: string[];
  onToggle: (accountId: string) => void;
};

export function ComposerPlatformGrid({ accounts, selectedAccounts, onToggle }: Props) {
  const { colors, fonts } = useComposeTheme();
  const { avatarSx } = usePlatformTheme();

  if (accounts.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body }}>
        Koi account connected nahi. Pehle{" "}
        <Typography
          component={RouterLink}
          to="/accounts"
          sx={{ color: colors.accent, fontWeight: 600, textDecoration: "none" }}
        >
          Accounts
        </Typography>{" "}
        page se platform connect karo.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
        gap: 1.25,
      }}
    >
      {PLATFORM_ORDER.map((platformId) => {
        const meta = PLATFORM_META[platformId];
        const account = accounts.find((a) => a.platform === platformId);
        const selected = account ? selectedAccounts.includes(account.id) : false;
        const avatarStyle =
          avatarSx[platformId as keyof typeof avatarSx] ?? {
            bgcolor: colors.textTertiary,
          };

        return (
          <Box
            key={platformId}
            component="button"
            type="button"
            disabled={!account}
            onClick={() => account && onToggle(account.id)}
            sx={{
              position: "relative",
              border: "1.5px solid",
              borderColor: selected ? colors.accent : colors.borderStrong,
              borderRadius: "12px",
              p: "12px 10px",
              cursor: account ? "pointer" : "not-allowed",
              textAlign: "center",
              transition: "all 0.12s ease",
              bgcolor: selected ? colors.accentSoft : colors.surface2,
              opacity: account ? 1 : 0.55,
              "&:hover": account
                ? { borderColor: colors.accent }
                : undefined,
            }}
          >
            {selected && (
              <Box
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: colors.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ fontSize: 10 }} />
              </Box>
            )}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
                color: "#fff",
                ...avatarStyle,
              }}
            >
              <PlatformBrandIcon platformId={platformId} sx={{ fontSize: 15 }} />
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              {meta.label}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: account ? colors.success : colors.textTertiary,
                mt: 0.25,
                fontWeight: 600,
                fontFamily: fonts.body,
              }}
            >
              {account ? "● Connected" : "Not connected"}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
