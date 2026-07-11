import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link as RouterLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { api } from "../../lib/api";
import { resetComposerDraft } from "../../lib/composerDraft";
import type { HashtagMode } from "../../types";
import { useComposeTheme } from "./composeTheme";

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
  const { colors, fonts } = useComposeTheme();
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

  const btnSx = {
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: 13,
    fontFamily: fonts.body,
    px: "14px",
    py: "9px",
    borderRadius: "8px",
    border: `1px solid ${colors.borderStrong}`,
    bgcolor: colors.surface,
    color: colors.textPrimary,
    "&:hover": { borderColor: colors.accent, color: colors.accent },
    "&.Mui-disabled": { opacity: 0.45 },
  };

  if (!configured) {
    return (
      <Box
        sx={{
          mt: 2,
          p: "14px",
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: colors.textTertiary }} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.textSecondary }}>
            AI Assist
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: colors.textSecondary, mb: 1.5, fontFamily: fonts.body }}>
          Settings mein apni AI API key add karo — naam de sakte ho jaise Claude, GPT, ya MiniMax.
        </Typography>
        <Button
          component={RouterLink}
          to="/settings"
          sx={{ ...btnSx, display: "inline-flex" }}
        >
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
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface2,
        borderRadius: "12px",
        p: "14px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <AutoAwesomeIcon sx={{ fontSize: 16, color: colors.accent }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.textPrimary }}>
          ✨ AI Assist
        </Typography>
        <Box
          component="span"
          sx={{
            fontSize: 10.5,
            fontFamily: fonts.mono,
            color: colors.textSecondary,
            bgcolor: colors.surface,
            border: `1px solid ${colors.borderStrong}`,
            px: "8px",
            py: "2px",
            borderRadius: 999,
          }}
        >
          {keyName ?? "AI"}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button disabled={disabled || loading !== null} onClick={() => void runImprove()} sx={btnSx}>
          {loading === "improve" ? <CircularProgress size={14} /> : "Improve post"}
        </Button>
        <Button disabled={disabled || loading !== null} onClick={() => void runHashtags()} sx={btnSx}>
          {loading === "hashtags" ? <CircularProgress size={14} /> : "Smart hashtags"}
        </Button>
        {language !== "en" && (
          <Button disabled={disabled || loading !== null} onClick={() => void runLocalize()} sx={btnSx}>
            {loading === "localize" ? <CircularProgress size={14} /> : "AI localize"}
          </Button>
        )}
      </Box>

      {error && (
        <Typography sx={{ fontSize: 13, color: colors.danger, mt: 1.5, fontFamily: fonts.body }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
