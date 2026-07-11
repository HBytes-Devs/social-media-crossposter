import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuth, setUser } from "../../store/slices/authSlice";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsTheme } from "./settingsTheme";

type Props = {
  token: string;
};

export function ProfilePanel({ token }: Props) {
  const { colors, fonts, inputSx } = useSettingsTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const trimmed = name.trim();
  const isDirty = trimmed !== (user?.name ?? "").trim();
  const canSave = trimmed.length > 0 && isDirty && !saving;

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.updateProfile(token, trimmed);
      dispatch(setUser(res.data.user));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPanel title="Profile" subtitle="Display name sidebar aur app mein dikhega">
      <Box sx={{ mb: 2 }}>
        <Typography
          component="label"
          sx={{
            display: "block",
            fontSize: 11,
            color: colors.muted,
            mb: "7px",
            letterSpacing: "0.3px",
            fontWeight: 500,
            fontFamily: fonts.body,
          }}
        >
          Display name
        </Typography>
        <TextField
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Apna naam"
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={inputSx}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: 12.5,
          color: colors.muted,
          mb: 2.5,
          fontFamily: fonts.body,
        }}
      >
        <EmailOutlinedIcon sx={{ fontSize: 14, opacity: 0.7 }} />
        Email:{" "}
        <Box
          component="span"
          sx={{
            color: colors.textSoft,
            fontFamily: fonts.mono,
            fontSize: 12,
          }}
        >
          {user?.email ?? "—"}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Button
        fullWidth
        disabled={!canSave}
        onClick={() => void handleSave()}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontSize: 13.5,
          fontFamily: fonts.body,
          py: "11px",
          borderRadius: "10px",
          color: "#fff",
          background: canSave
            ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`
            : colors.disabledBg,
          border: canSave ? "none" : `1px solid ${colors.line}`,
          boxShadow: "none",
          "&:hover": canSave
            ? {
                boxShadow: "0 10px 24px -10px rgba(91,95,239,0.55)",
                transform: "translateY(-1px)",
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
              }
            : {
                background: colors.disabledBg,
                boxShadow: "none",
                transform: "none",
              },
          "&.Mui-disabled": {
            color: colors.disabledText,
            bgcolor: colors.disabledBg,
            border: `1px solid ${colors.line}`,
          },
        }}
      >
        {saving ? <CircularProgress size={18} color="inherit" /> : "Save profile"}
      </Button>
    </SettingsPanel>
  );
}
