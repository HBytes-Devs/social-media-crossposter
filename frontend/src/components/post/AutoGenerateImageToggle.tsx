import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { ComposeSwitch } from "./ComposeAssistToggles";
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
        Auto image ke liye Settings mein AI API key add karo (Medium/Premium plan).
      </Typography>
    );
  }

  if (!available) {
    return (
      <Typography sx={{ fontSize: 12, color: colors.textTertiary, fontFamily: fonts.body }}>
        Image auto-generate ke liye Settings mein MiniMax API key add karo (recommended), ya OpenAI
        key — ya server par MINIMAX_API_KEY set karo.
      </Typography>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: 13,
            color: colors.textSecondary,
            cursor: "pointer",
            fontFamily: fonts.body,
          }}
        >
          <ComposeSwitch checked={enabled} onChange={onEnabledChange} />
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: colors.accent }} />
          Auto-generate image from post
        </Box>

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

      <Typography sx={{ fontSize: 12, color: colors.textTertiary, mt: 1, fontFamily: fonts.body }}>
        {enabled
          ? "Post likhte hi AI aapke content ke mutabiq image banayegi (≈3 sec delay)."
          : "Checkbox off — image khud upload karo ya library se choose karo."}
      </Typography>

      {generating && (
        <Typography sx={{ fontSize: 12, color: colors.accent, mt: 0.75, fontFamily: fonts.body }}>
          AI image bana rahi hai… thora wait karo.
        </Typography>
      )}

      {error && (
        <Typography sx={{ fontSize: 12, color: colors.danger, mt: 0.75, fontFamily: fonts.body }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
