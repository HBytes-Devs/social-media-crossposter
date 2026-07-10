import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { api } from "../../lib/api";
import type { AiCredential, AiProviderId, AiProviderPreset } from "../../types";

const PROVIDER_LABELS: Record<AiProviderId, string> = {
  MINIMAX: "MiniMax",
  OPENAI: "OpenAI",
  ANTHROPIC: "Claude",
  CUSTOM: "Custom",
};

type Props = {
  token: string;
};

type FormState = {
  name: string;
  provider: AiProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
  isDefault: boolean;
};

const emptyForm = (provider: AiProviderId = "ANTHROPIC"): FormState => ({
  name: "",
  provider,
  apiKey: "",
  model: "",
  baseUrl: "",
  isDefault: true,
});

export function AiKeysPanel({ token }: Props) {
  const [credentials, setCredentials] = useState<AiCredential[]>([]);
  const [providers, setProviders] = useState<AiProviderPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);

  const selectedPreset = useMemo(
    () => providers.find((p) => p.id === form.provider),
    [providers, form.provider],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [keys, providerList] = await Promise.all([
        api.listAiKeys(token),
        api.listAiProviders(token),
      ]);
      setCredentials(keys);
      setProviders(providerList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI keys");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyProvider(provider: AiProviderId) {
    const preset = providers.find((p) => p.id === provider);
    setForm((prev) => ({
      ...prev,
      provider,
      model: preset?.model ?? "",
      baseUrl: preset?.baseUrl ?? "",
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.apiKey.trim()) {
      setError("Name aur API key zaroori hain");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await api.createAiKey(token, {
        name: form.name.trim(),
        provider: form.provider,
        apiKey: form.apiKey.trim(),
        model: form.model.trim() || null,
        baseUrl: form.baseUrl.trim() || null,
        isDefault: form.isDefault,
      });
      setCredentials((prev) => {
        const next = form.isDefault
          ? prev.map((c) => ({ ...c, isDefault: false }))
          : [...prev];
        return [...next, created];
      });
      setForm(emptyForm(form.provider));
      setShowForm(false);
      setSuccess(`"${created.name}" save ho gayi`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save AI key");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    setError(null);
    try {
      const updated = await api.updateAiKey(token, id, { isDefault: true });
      setCredentials((prev) =>
        prev.map((c) => ({ ...c, isDefault: c.id === updated.id })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  }

  async function removeKey(id: string) {
    setError(null);
    try {
      await api.deleteAiKey(token, id);
      await load();
      setSuccess("AI key remove ho gayi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
    }
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Card
        title="AI API keys"
        description="Apni API key yahan add karo — naam de sakte ho jaise Claude, MiniMax, GPT"
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Keys encrypted save hoti hain. Compose mein AI Assist in keys se chalega. Default key
          sab features ke liye use hogi.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : credentials.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Abhi koi AI key nahi. Neeche se add karo — jaise &quot;My Claude&quot; ya &quot;Work
            GPT&quot;.
          </Alert>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {credentials.map((cred) => (
              <Box
                key={cred.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  borderColor: cred.isDefault ? "primary.main" : "divider",
                  bgcolor: cred.isDefault ? "action.selected" : "background.paper",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" fontWeight={700}>
                      {cred.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={PROVIDER_LABELS[cred.provider]}
                      variant="outlined"
                    />
                    {cred.isDefault && (
                      <Chip size="small" color="primary" label="Default" icon={<StarIcon />} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {cred.model ?? "default model"} · Key: {cred.keyHint}
                  </Typography>
                </Box>

                {!cred.isDefault && (
                  <IconButton
                    size="small"
                    title="Set as default"
                    onClick={() => void setDefault(cred.id)}
                  >
                    <StarBorderIcon fontSize="small" />
                  </IconButton>
                )}

                <IconButton
                  size="small"
                  color="error"
                  title="Remove"
                  onClick={() => void removeKey(cred.id)}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {!showForm ? (
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            + Add AI key
          </Button>
        ) : (
          <Box
            component="form"
            onSubmit={(e) => void handleCreate(e)}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Input
              label="Name (jaise Claude, Work GPT)"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="My Claude"
              required
            />

            <Select
              label="Provider"
              value={form.provider}
              onChange={(e) => applyProvider(e.target.value as AiProviderId)}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>

            <Input
              label="API key"
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
              required
              autoComplete="off"
            />

            <Input
              label="Model (optional)"
              value={form.model}
              onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
              placeholder={selectedPreset?.model ?? "claude-3-5-sonnet-latest"}
            />

            {(form.provider === "CUSTOM" || form.baseUrl) && (
              <Input
                label="Base URL"
                value={form.baseUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={selectedPreset?.baseUrl ?? "https://api.openai.com/v1"}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                  }
                />
              }
              label="Default key (compose AI ke liye)"
            />

            <Stack direction="row" spacing={1}>
              <Button type="submit" loading={saving}>
                Save key
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm());
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </Card>

      <Typography variant="body2" color="text.secondary">
        Key add karne ke baad{" "}
        <Typography component={RouterLink} to="/compose" variant="body2" color="primary">
          Compose
        </Typography>{" "}
        page par AI Assist available hoga.
      </Typography>
    </Stack>
  );
}
