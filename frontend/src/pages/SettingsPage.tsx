import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { AiKeysPanel } from "../components/settings/AiKeysPanel";
import { ProfilePanel } from "../components/settings/ProfilePanel";
import { Card } from "../components/ui/Card";
import { VersionBadge } from "../components/ui/VersionBadge";
import { PRODUCT_VERSION } from "../lib/productVersion";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";

export function SettingsPage() {
  const token = useAppSelector(selectToken);

  return (
    <Box sx={{ display: "flex", width: "100%", maxWidth: 720, flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SettingsOutlinedIcon />
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          AI models, API keys, aur app preferences
        </Typography>
      </Box>

      <Card title="About SMC" description="Product version & release channel">
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <VersionBadge />
            <Typography variant="body2" color="text.secondary">
              {PRODUCT_VERSION.codename}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {PRODUCT_VERSION.product} — professional cross-posting tool. Abhi{" "}
            <strong>{PRODUCT_VERSION.channel}</strong> channel par development chal rahi hai.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Release {PRODUCT_VERSION.releaseDate} · API {PRODUCT_VERSION.apiVersion} ·{" "}
            {PRODUCT_VERSION.status}
          </Typography>
        </Stack>
      </Card>

      {token ? (
        <>
          <ProfilePanel token={token} />
          <AiKeysPanel token={token} />
        </>
      ) : null}
    </Box>
  );
}
