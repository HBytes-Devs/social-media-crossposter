import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { memo, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useComposeAssist } from "../../hooks/useComposeAssist";
import {
  getComposerDraft,
  resetComposerDraft,
  setComposerDraft,
  subscribeComposerDraft,
} from "../../lib/composerDraft";
import { useComposeTheme } from "./composeTheme";

type Props = {
  value: string;
  onSync: (value: string) => void;
  placeholder?: string;
  rows?: number;
  language: string;
  token: string | null;
  aiConfigured: boolean;
  smartSuggest: boolean;
  autoCorrect: boolean;
  composeTheme?: boolean;
};

const SYNC_DELAY_MS = 500;
const EDITOR_PADDING = "14px";

export const ContentEditor = memo(function ContentEditor({
  value,
  onSync,
  placeholder,
  rows = 6,
  language,
  token,
  aiConfigured,
  smartSuggest,
  autoCorrect,
  composeTheme,
}: Props) {
  const theme = useTheme();
  const { colors } = useComposeTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);

  const applyText = useCallback(
    (next: string) => {
      const textarea = textareaRef.current;
      if (textarea) textarea.value = next;
      setComposerDraft(next);
      onSyncRef.current(next);
    },
    [],
  );

  const { suggestion, suggesting, correcting, acceptSuggestion, clearSuggestion } =
    useComposeAssist({
      text: draft,
      language,
      token,
      aiConfigured,
      smartSuggest,
      autoCorrect,
      onApply: applyText,
    });

  useEffect(() => {
    resetComposerDraft(value);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || textarea.value === value) return;
    textarea.value = value;
    resetComposerDraft(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  function scheduleSync(next: string) {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      onSyncRef.current(next);
    }, SYNC_DELAY_MS);
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    setComposerDraft(next);
    clearSuggestion();
    scheduleSync(next);
  }

  function handleBlur(event: React.FocusEvent<HTMLTextAreaElement>) {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    onSyncRef.current(event.target.value);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab" && suggestion && !event.shiftKey) {
      event.preventDefault();
      acceptSuggestion();
      return;
    }
    if (event.key === "Escape" && suggestion) {
      event.preventDefault();
      clearSuggestion();
    }
  }

  const showGhost = Boolean(suggestion && smartSuggest && aiConfigured);

  const borderColor = composeTheme ? colors.borderStrong : "divider";
  const focusBorder = composeTheme ? colors.accent : theme.palette.primary.main;
  const focusShadow = composeTheme
    ? `0 0 0 3px ${colors.accentSoft}`
    : `0 0 0 1px ${theme.palette.primary.main}`;
  const editorBg = composeTheme ? colors.surface2 : "background.paper";
  const focusBg = composeTheme ? colors.surface : editorBg;

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          borderRadius: composeTheme ? "12px" : 2,
          border: 1,
          borderColor,
          bgcolor: editorBg,
          overflow: "hidden",
          "&:focus-within": {
            borderColor: focusBorder,
            boxShadow: focusShadow,
            bgcolor: focusBg,
          },
        }}
      >
        {showGhost && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              px: EDITOR_PADDING,
              py: EDITOR_PADDING,
              pointerEvents: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              fontFamily: theme.typography.fontFamily,
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <Box component="span" sx={{ color: "transparent" }}>
              {draft}
            </Box>
            <Box
              component="span"
              sx={{
                color: alpha(theme.palette.text.primary, 0.38),
              }}
            >
              {suggestion}
            </Box>
          </Box>
        )}

        <TextField
          inputRef={textareaRef}
          defaultValue={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          multiline
          minRows={rows}
          fullWidth
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                px: EDITOR_PADDING,
                py: EDITOR_PADDING,
                fontSize: "0.875rem",
                lineHeight: 1.5,
                position: "relative",
                zIndex: 1,
                bgcolor: "transparent",
              },
            },
          }}
        />
      </Box>

      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mt: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          {showGhost && (
            <Chip
              label="Tab to accept suggestion"
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
          {suggesting && smartSuggest && (
            <Typography variant="caption" color="text.secondary">
              Suggesting…
            </Typography>
          )}
          {correcting && autoCorrect && (
            <Typography variant="caption" color="text.secondary">
              Auto-correcting…
            </Typography>
          )}
        </Stack>
        {showGhost && (
          <Typography variant="caption" color="text.secondary">
            Esc to dismiss
          </Typography>
        )}
      </Stack>
    </Box>
  );
});
