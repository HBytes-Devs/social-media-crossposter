import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { useComposeTheme } from "./composeTheme";
import { Button } from "../ui/Button";

type Props = {
  enabled: boolean;
  available: boolean;
  aiConfigured: boolean;
  generating: boolean;
  error?: string | null;
  hasContent: boolean;
  onEnabledChange: (value: boolean) => void;
  onGenerateNow?: () => void;
};

export function AutoGenerateImageToggle({
  enabled,
  available,
  aiConfigured,
  generating,
  error,
  hasContent,
  onEnabledChange,
  onGenerateNow,
}: Props) {
  const { colors, fonts } = useComposeTheme();

  if (!aiConfigured) {
    return (
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, fontFamily: fonts.body }}>
        Auto image ke liye Settings mein MiniMax API key add karo (Medium/Premium plan).
      </Typography>
    );
  }

  if (!available) {
    return (
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, fontFamily: fonts.body }}>
        Image auto-generate ke liye MiniMax key chahiye — Settings → AI Keys, ya server{" "}
        <Box component="code" sx={{ fontFamily: fonts.mono, fontSize: 11 }}>
          MINIMAX_API_KEY
        </Box>
        .
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "12px",
        border: `1px solid ${enabled ? colors.accent : colors.border}`,
        bgcolor: enabled ? colors.accentSoft : colors.surface2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <FormControlLabel
          sx={{ m: 0, gap: 0.5 }}
          control={
            <Checkbox
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              sx={{
                color: colors.textTertiary,
                "&.Mui-checked": { color: colors.accent },
              }}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: colors.accent }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary, fontFamily: fonts.body }}>
                Auto-generate image from post
              </Typography>
            </Box>
          }
        />

        {enabled && hasContent && onGenerateNow && (
          <Button
            variant="secondary"
            onClick={onGenerateNow}
            disabled={generating}
            className="!text-xs"
          >
            {generating ? (
              <>
                <CircularProgress size={14} sx={{ mr: 0.75 }} />
                Generating…
              </>
            ) : (
              "Generate now"
            )}
          </Button>
        )}
      </Box>

      <Typography sx={{ fontSize: 12, color: colors.textTertiary, mt: 1, ml: 4.5, fontFamily: fonts.body }}>
        {enabled
          ? "On — post likhte hi MiniMax content se image banayega (~3 sec delay)."
          : "Off — image khud upload karo ya library se choose karo."}
      </Typography>

      {generating && (
        <Typography sx={{ fontSize: 12, color: colors.accent, mt: 0.75, ml: 4.5, fontFamily: fonts.body }}>
          AI image bana rahi hai… thora wait karo.
        </Typography>
      )}

      {error && (
        <Typography sx={{ fontSize: 12, color: colors.danger, mt: 0.75, ml: 4.5, fontFamily: fonts.body }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
