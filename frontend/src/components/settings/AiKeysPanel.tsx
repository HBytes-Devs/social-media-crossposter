import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { api } from "../../lib/api";
import type { AiCredential, AiProviderId, AiProviderPreset } from "../../types";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsTheme } from "./settingsTheme";

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

function SettingsInfoAlert({
  tone = "accent",
  children,
}: {
  tone?: "accent" | "muted";
  children: React.ReactNode;
}) {
  const { colors, fonts } = useSettingsTheme();
  const isAccent = tone === "accent";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        bgcolor: isAccent ? colors.accentSoft : colors.chipBg,
        border: "1px solid",
        borderColor: isAccent ? colors.accentBorder : colors.line,
        borderRadius: "12px",
        px: 2,
        py: 1.75,
        mb: 2.25,
      }}
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: 17,
          color: isAccent ? colors.accent : colors.muted,
          flexShrink: 0,
          mt: "1px",
        }}
      />
      <Typography
        sx={{
          fontSize: 13,
          color: isAccent ? colors.accentText : colors.textSoft,
          lineHeight: 1.5,
          fontFamily: fonts.body,
          "& strong": { color: colors.text, fontWeight: 600 },
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = useSettingsTheme();

  return (
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
      {children}
    </Typography>
  );
}

export function AiKeysPanel({ token }: Props) {
  const { colors, fonts, inputSx } = useSettingsTheme();
  const [credentials, setCredentials] = useState<AiCredential[]>([]);
  const [providers, setProviders] = useState<AiProviderPreset[]>([]);
  const [serverAi, setServerAi] = useState<{
    configured: boolean;
    source: string;
    provider: string;
    model: string;
    imageGeneration: boolean;
    keyName: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm("MINIMAX"));
  const [showForm, setShowForm] = useState(false);

  const selectedPreset = useMemo(
    () => providers.find((p) => p.id === form.provider),
    [providers, form.provider],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [keys, providerList, aiStatus] = await Promise.all([
        api.listAiKeys(token),
        api.listAiProviders(token),
        api.getAiStatus(token),
      ]);
      setCredentials(keys);
      setProviders(providerList);
      setServerAi({
        configured: aiStatus.configured,
        source: aiStatus.source,
        provider: aiStatus.provider,
        model: aiStatus.model,
        imageGeneration: aiStatus.imageGeneration,
        keyName: aiStatus.keyName,
      });
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
        const next = form.isDefault ? prev.map((c) => ({ ...c, isDefault: false })) : [...prev];
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
      setCredentials((prev) => prev.map((c) => ({ ...c, isDefault: c.id === updated.id })));
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
    <>
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

      <SettingsPanel
        title="AI API keys"
        subtitle="Apni API key yahan add karo — naam de sakte ho jaise Claude, MiniMax, GPT"
      >
        <SettingsInfoAlert>
          <strong>Keys encrypted save hoti hain.</strong> Compose mein AI Assist in keys se chalega.
          Default key sab features ke liye use hogi.
        </SettingsInfoAlert>

        {serverAi?.configured && serverAi.source === "server" && (
          <SettingsInfoAlert>
            <strong>Server MiniMax active hai</strong> ({serverAi.model}
            {serverAi.imageGeneration ? " · image generation ON" : ""}). Compose pe AI Assist aur
            auto-generate image is key se chalenge — alag se key add karna optional hai.
          </SettingsInfoAlert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : credentials.length === 0 ? (
          <SettingsInfoAlert tone="muted">
            {serverAi?.configured ? (
              <>
                Personal key list empty hai, lekin server AI already connected hai. Apni custom key
                add karna optional hai (jaise <strong>&quot;My MiniMax&quot;</strong>).
              </>
            ) : (
              <>
                Abhi koi AI key nahi. Neeche se add karo — jaise <strong>&quot;My MiniMax&quot;</strong>{" "}
                ya <strong>&quot;Work GPT&quot;</strong>.
              </>
            )}
          </SettingsInfoAlert>
        ) : (
          <Stack sx={{ gap: 1.5, mb: 2.25 }}>
            {credentials.map((cred) => (
              <Box
                key={cred.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: cred.isDefault ? colors.accentBorder : colors.line,
                  bgcolor: cred.isDefault ? colors.accentSoft : colors.chipBg,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: colors.text,
                        fontFamily: fonts.body,
                      }}
                    >
                      {cred.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={PROVIDER_LABELS[cred.provider]}
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        borderColor: colors.line,
                        color: colors.textSoft,
                      }}
                    />
                    {cred.isDefault && (
                      <Chip
                        size="small"
                        color="primary"
                        label="Default"
                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                        sx={{ height: 22, fontSize: 11 }}
                      />
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: colors.muted,
                      mt: 0.5,
                      fontFamily: fonts.body,
                    }}
                  >
                    {cred.model ?? "default model"} · Key: {cred.keyHint}
                  </Typography>
                </Box>

                {!cred.isDefault && (
                  <IconButton
                    size="small"
                    title="Set as default"
                    onClick={() => void setDefault(cred.id)}
                    sx={{ color: colors.textSoft }}
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
          <Button
            fullWidth
            onClick={() => setShowForm(true)}
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13.5,
              fontFamily: fonts.body,
              py: "13px",
              borderRadius: "11px",
              border: "1.5px dashed",
              borderColor: "rgba(91,95,239,0.4)",
              bgcolor: "rgba(91,95,239,0.05)",
              color: colors.accent,
              "&:hover": {
                bgcolor: "rgba(91,95,239,0.1)",
                borderColor: colors.accent,
              },
              "& .MuiButton-startIcon": { mr: 1 },
            }}
          >
            Add AI key
          </Button>
        ) : (
          <Box
            component="form"
            onSubmit={(e) => void handleCreate(e)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box>
              <FieldLabel>Name (jaise Claude, Work GPT)</FieldLabel>
              <TextField
                fullWidth
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My Claude"
                required
                sx={inputSx}
              />
            </Box>

            <Box>
              <FieldLabel>Provider</FieldLabel>
              <TextField
                select
                fullWidth
                value={form.provider}
                onChange={(e) => applyProvider(e.target.value as AiProviderId)}
                sx={inputSx}
                SelectProps={{ native: true }}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </TextField>
            </Box>

            <Box>
              <FieldLabel>API key</FieldLabel>
              <TextField
                fullWidth
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
                required
                autoComplete="off"
                sx={inputSx}
              />
            </Box>

            <Box>
              <FieldLabel>Model (optional)</FieldLabel>
              <TextField
                fullWidth
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                placeholder={selectedPreset?.model ?? "claude-3-5-sonnet-latest"}
                sx={inputSx}
              />
            </Box>

            {(form.provider === "CUSTOM" || form.baseUrl) && (
              <Box>
                <FieldLabel>Base URL</FieldLabel>
                <TextField
                  fullWidth
                  value={form.baseUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder={selectedPreset?.baseUrl ?? "https://api.openai.com/v1"}
                  sx={inputSx}
                />
              </Box>
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
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  color: colors.textSoft,
                  fontFamily: fonts.body,
                },
              }}
            />

            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                type="submit"
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13.5,
                  fontFamily: fonts.body,
                  px: 2.25,
                  py: "11px",
                  borderRadius: "10px",
                  color: "#fff",
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                  "&:hover": {
                    boxShadow: "0 10px 24px -10px rgba(91,95,239,0.55)",
                  },
                }}
              >
                {saving ? <CircularProgress size={18} color="inherit" /> : "Save key"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm());
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13.5,
                  fontFamily: fonts.body,
                  px: 2.25,
                  py: "11px",
                  borderRadius: "10px",
                  color: colors.textSoft,
                  border: `1px solid ${colors.line}`,
                  bgcolor: colors.chipBg,
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </SettingsPanel>

      <Typography
        sx={{
          fontSize: 12.5,
          color: colors.muted,
          px: 0.5,
          fontFamily: fonts.body,
        }}
      >
        Key add karne ke baad{" "}
        <Typography
          component={RouterLink}
          to="/compose"
          sx={{
            color: colors.accent,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "inherit",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Compose
        </Typography>{" "}
        page par AI Assist available hoga.
      </Typography>
    </>
  );
}
