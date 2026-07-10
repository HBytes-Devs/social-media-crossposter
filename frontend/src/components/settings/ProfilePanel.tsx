import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { api } from "../../lib/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectAuth, setUser } from "../../store/slices/authSlice";

type Props = {
  token: string;
};

export function ProfilePanel({ token }: Props) {
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
    <Card title="Profile" description="Display name sidebar aur app mein dikhega">
      <Stack spacing={2}>
        <Input
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Apna naam"
          maxLength={100}
        />
        <Typography variant="caption" color="text.secondary">
          Email: {user?.email ?? "—"}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button variant="primary" onClick={handleSave} loading={saving} disabled={!canSave}>
          Save profile
        </Button>
      </Stack>
    </Card>
  );
}
