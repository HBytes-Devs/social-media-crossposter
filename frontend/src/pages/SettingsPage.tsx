import Box from "@mui/material/Box";
import { AboutPanel } from "../components/settings/AboutPanel";
import { AiKeysPanel } from "../components/settings/AiKeysPanel";
import { ProfilePanel } from "../components/settings/ProfilePanel";
import { SettingsPageHeader } from "../components/settings/SettingsPageHeader";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../store/slices/authSlice";

export function SettingsPage() {
  const token = useAppSelector(selectToken);

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
      <SettingsPageHeader
        title="Settings"
        subtitle="AI models, API keys, aur app preferences"
      />

      <AboutPanel />

      {token ? (
        <>
          <ProfilePanel token={token} />
          <AiKeysPanel token={token} />
        </>
      ) : null}
    </Box>
  );
}
