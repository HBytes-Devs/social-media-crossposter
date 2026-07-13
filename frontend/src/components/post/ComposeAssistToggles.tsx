import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  COMPOSE_AUTO_CORRECT_KEY,
  COMPOSE_SMART_SUGGEST_KEY,
  readComposePref,
  writeComposePref,
} from "../../lib/composeAssistPrefs";
import { useComposeTheme } from "./composeTheme";

type Props = {
  aiConfigured: boolean;
  smartSuggest: boolean;
  autoCorrect: boolean;
  onSmartSuggestChange: (value: boolean) => void;
  onAutoCorrectChange: (value: boolean) => void;
};

export function ComposeSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useComposeTheme();

  return (
    <Box
      component="button"
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      sx={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: checked ? colors.accent : colors.borderStrong,
        transition: "background-color 0.15s ease",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          bgcolor: "#fff",
          borderRadius: "50%",
          transition: "left 0.15s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        },
      }}
    />
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors, fonts } = useComposeTheme();

  return (
    <Box
      component="label"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        fontSize: 13,
        color: colors.textSecondary,
        cursor: "pointer",
        fontFamily: fonts.body,
      }}
    >
      <ComposeSwitch checked={checked} onChange={onChange} />
      {label}
    </Box>
  );
}

export function ComposeAssistToggles({
  aiConfigured,
  smartSuggest,
  autoCorrect,
  onSmartSuggestChange,
  onAutoCorrectChange,
}: Props) {
  const { colors, fonts } = useComposeTheme();

  if (!aiConfigured) {
    return (
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, mt: 1.75, fontFamily: fonts.body }}>
        Smart suggestions aur auto-correct ke liye Settings mein AI API key add karo.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 1.75 }}>
      <Box sx={{ display: "flex", gap: 2.75, flexWrap: "wrap" }}>
        <ToggleRow
          label="Smart suggestions (Tab to accept)"
          checked={smartSuggest}
          onChange={(v) => {
            onSmartSuggestChange(v);
            writeComposePref(COMPOSE_SMART_SUGGEST_KEY, v);
          }}
        />
        <ToggleRow
          label="Auto-correct grammar & spelling"
          checked={autoCorrect}
          onChange={(v) => {
            onAutoCorrectChange(v);
            writeComposePref(COMPOSE_AUTO_CORRECT_KEY, v);
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, mt: 1.25, fontFamily: fonts.body }}>
        Works in English, Turkish, Urdu, Hindi and other selected post languages.
      </Typography>
    </Box>
  );
}

export function useComposeAssistPrefs() {
  const [smartSuggest, setSmartSuggest] = useState(() =>
    readComposePref(COMPOSE_SMART_SUGGEST_KEY, true),
  );
  const [autoCorrect, setAutoCorrect] = useState(() =>
    readComposePref(COMPOSE_AUTO_CORRECT_KEY, false),
  );

  useEffect(() => {
    setSmartSuggest(readComposePref(COMPOSE_SMART_SUGGEST_KEY, true));
    setAutoCorrect(readComposePref(COMPOSE_AUTO_CORRECT_KEY, false));
  }, []);

  return {
    smartSuggest,
    autoCorrect,
    setSmartSuggest,
    setAutoCorrect,
  };
}
