import { Link as RouterLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import { resetComposerDraft } from "../../lib/composerDraft";
import type { HashtagMode } from "../../types";

type Props = {
  token: string | null;
  content: string;
  language: string;
  platform?: string;
  onContentChange: (value: string) => void;
  onHashtagsChange: (tags: string[]) => void;
  onHashtagModeChange: (mode: HashtagMode) => void;
};

export function AiAssistPanel({
  token,
  content,
  language,
  platform,
  onContentChange,
  onHashtagsChange,
  onHashtagModeChange,
}: Props) {
  const [configured, setConfigured] = useState(false);
  const [keyName, setKeyName] = useState<string | null>(null);
  const [loading, setLoading] = useState<"improve" | "hashtags" | "localize" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getAiStatus(token)
      .then((status) => {
        setConfigured(status.configured);
        setKeyName(status.keyName);
      })
      .catch(() => {
        setConfigured(false);
        setKeyName(null);
      });
  }, [token]);

  const applyContent = useCallback(
    (next: string) => {
      resetComposerDraft(next);
      onContentChange(next);
    },
    [onContentChange],
  );

  const runImprove = useCallback(async () => {
    if (!token || !content.trim()) return;
    setLoading("improve");
    setError(null);
    try {
      const result = await api.improvePost(token, {
        content,
        language,
        platform,
        tone: "professional",
      });
      applyContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI improve failed");
    } finally {
      setLoading(null);
    }
  }, [token, content, language, platform, applyContent]);

  const runHashtags = useCallback(async () => {
    if (!token || !content.trim()) return;
    setLoading("hashtags");
    setError(null);
    try {
      const result = await api.generateSmartHashtags(token, {
        content,
        language,
        max: 8,
      });
      onHashtagModeChange("manual");
      onHashtagsChange(result.hashtags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI hashtags failed");
    } finally {
      setLoading(null);
    }
  }, [token, content, language, onHashtagModeChange, onHashtagsChange]);

  const runLocalize = useCallback(async () => {
    if (!token || !content.trim() || language === "en") return;
    setLoading("localize");
    setError(null);
    try {
      const result = await api.localizeWithAi(token, { content, language });
      applyContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI localize failed");
    } finally {
      setLoading(null);
    }
  }, [token, content, language, applyContent]);

  if (!configured) {
    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <AutoAwesomeIcon fontSize="small" color="disabled" />
          <Typography variant="subtitle2" color="text.secondary">
            AI Assist
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Settings mein apni AI API key add karo — naam de sakte ho jaise Claude, GPT, ya MiniMax.
        </Typography>
        <Button component={RouterLink} to="/settings" variant="secondary" size="small">
          Open Settings
        </Button>
      </Box>
    );
  }

  const disabled = !content.trim();

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2">AI Assist</Typography>
        <Chip label={keyName ?? "AI"} size="small" variant="outlined" />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="secondary"
          loading={loading === "improve"}
          disabled={disabled || loading !== null}
          onClick={runImprove}
        >
          Improve post
        </Button>
        <Button
          variant="secondary"
          loading={loading === "hashtags"}
          disabled={disabled || loading !== null}
          onClick={runHashtags}
        >
          Smart hashtags
        </Button>
        {language !== "en" && (
          <Button
            variant="secondary"
            loading={loading === "localize"}
            disabled={disabled || loading !== null}
            onClick={runLocalize}
          >
            AI localize
          </Button>
        )}
      </Stack>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
