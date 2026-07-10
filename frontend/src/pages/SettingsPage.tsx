import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { AiKeysPanel } from "../components/settings/AiKeysPanel";
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

      {token ? <AiKeysPanel token={token} /> : null}
    </Box>
  );
}
