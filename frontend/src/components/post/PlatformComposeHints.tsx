import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PLATFORM_LIMITS } from "../../lib/platformLimits";

type Props = {
  selectedPlatforms: string[];
  contentLength: number;
  imageCount: number;
};

export function PlatformComposeHints({ selectedPlatforms, contentLength, imageCount }: Props) {
  if (selectedPlatforms.length === 0) return null;

  const hints: string[] = [];

  if (selectedPlatforms.includes("TWITTER")) {
    const max = PLATFORM_LIMITS.TWITTER.maxTextLength ?? 280;
    const over = contentLength > max;
    hints.push(
      over
        ? `X (Twitter): ${contentLength}/${max} chars — limit cross ho gayi`
        : `X (Twitter): ${contentLength}/${max} characters`,
    );
  }

  if (selectedPlatforms.includes("REDDIT")) {
    hints.push("Reddit: title + subreddit zaroori — neeche Reddit card fill karo");
    const maxImg = PLATFORM_LIMITS.REDDIT.maxImages ?? 1;
    if (imageCount > maxImg) {
      hints.push(`Reddit: sirf ${maxImg} image allowed — extra hatao`);
    }
  }

  if (selectedPlatforms.length > 1) {
    hints.push(
      `Cross-post: ${selectedPlatforms.length} platforms — har ek alag result (PARTIAL possible)`,
    );
  }

  const twitterOver =
    selectedPlatforms.includes("TWITTER") &&
    contentLength > (PLATFORM_LIMITS.TWITTER.maxTextLength ?? 280);

  const redditImgOver =
    selectedPlatforms.includes("REDDIT") &&
    imageCount > (PLATFORM_LIMITS.REDDIT.maxImages ?? 1);

  const severity = twitterOver || redditImgOver ? "warning" : "info";

  return (
    <Alert severity={severity} sx={{ py: 0.75 }}>
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
        {selectedPlatforms.map((p) => (
          <Chip key={p} label={p} size="small" variant="outlined" />
        ))}
      </Stack>
      <Stack spacing={0.25} sx={{ mt: 0.75 }}>
        {hints.map((hint) => (
          <Typography key={hint} variant="caption" component="div">
            {hint}
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
}
