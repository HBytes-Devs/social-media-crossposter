import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  COMPOSE_AUTO_CORRECT_KEY,
  COMPOSE_SMART_SUGGEST_KEY,
  readComposePref,
  writeComposePref,
} from "../../lib/composeAssistPrefs";

type Props = {
  aiConfigured: boolean;
  smartSuggest: boolean;
  autoCorrect: boolean;
  onSmartSuggestChange: (value: boolean) => void;
  onAutoCorrectChange: (value: boolean) => void;
};

export function ComposeAssistToggles({
  aiConfigured,
  smartSuggest,
  autoCorrect,
  onSmartSuggestChange,
  onAutoCorrectChange,
}: Props) {
  if (!aiConfigured) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
        Smart suggestions aur auto-correct ke liye MiniMax API key backend mein set karo.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={smartSuggest}
            onChange={(e) => {
              onSmartSuggestChange(e.target.checked);
              writeComposePref(COMPOSE_SMART_SUGGEST_KEY, e.target.checked);
            }}
          />
        }
        label={
          <Typography variant="body2">Smart suggestions (Tab to accept)</Typography>
        }
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={autoCorrect}
            onChange={(e) => {
              onAutoCorrectChange(e.target.checked);
              writeComposePref(COMPOSE_AUTO_CORRECT_KEY, e.target.checked);
            }}
          />
        }
        label={<Typography variant="body2">Auto-correct grammar & spelling</Typography>}
      />
      <Typography variant="caption" color="text.secondary">
        Works in English, Turkish, Urdu, Hindi, and other selected post languages.
      </Typography>
    </Stack>
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
