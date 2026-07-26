import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
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
  onGenerateNow: () => void;
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
  const canGenerate = aiConfigured && available;
  const showGenerateButton = hasContent && canGenerate;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "12px",
        border: `1px solid ${enabled && canGenerate ? colors.accent : colors.border}`,
        bgcolor: enabled && canGenerate ? colors.accentSoft : colors.surface2,
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
          sx={{ m: 0, gap: 0.5, alignItems: "flex-start" }}
          control={
            <Checkbox
              checked={enabled}
              disabled={!canGenerate}
              onChange={(e) => onEnabledChange(e.target.checked)}
              sx={{
                color: colors.textTertiary,
                "&.Mui-checked": { color: colors.accent },
                "&.Mui-disabled": { color: colors.textTertiary },
              }}
            />
          }
          label={
            <Box sx={{ pt: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AutoAwesomeOutlinedIcon
                  sx={{ fontSize: 16, color: canGenerate ? colors.accent : colors.textTertiary }}
                />
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    fontFamily: fonts.body,
                  }}
                >
                  Auto-generate image from post
                </Typography>
              </Box>
            </Box>
          }
        />

        {showGenerateButton && (
          <Button
            variant="secondary"
            onClick={onGenerateNow}
            disabled={generating || !hasContent}
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
        {!canGenerate ? (
          <>
            Image AI ke liye MiniMax key chahiye —{" "}
            <Box
              component={RouterLink}
              to="/settings"
              sx={{ color: colors.accent, textDecoration: "underline", fontWeight: 600 }}
            >
              Settings → AI Keys
            </Box>
            , ya server pe <Box component="code" sx={{ fontFamily: fonts.mono, fontSize: 11 }}>MINIMAX_API_KEY</Box>.
          </>
        ) : enabled ? (
          hasContent
            ? "On — post ke content se MiniMax image banayega (likhte hi, ~3 sec delay). Generate now se turant bhi chala sakte ho."
            : "On — pehle post ka text likho (kam az kam ~20 characters), phir image auto banegi."
        ) : (
          "Off — khud upload karo, ya Generate now dabao for one image."
        )}
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
