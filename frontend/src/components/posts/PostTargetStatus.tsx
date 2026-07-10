import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PostTarget } from "../../types";
import { PlatformBadge } from "../platforms/PlatformBadge";

const STATUS_COLOR: Record<
  string,
  "default" | "success" | "warning" | "error" | "info"
> = {
  SUCCESS: "success",
  FAILED: "error",
  PENDING: "default",
  PUBLISHING: "warning",
  SKIPPED: "default",
};

type Props = {
  targets: PostTarget[];
};

export function PostTargetStatus({ targets }: Props) {
  if (targets.length === 0) return null;

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={1}
      sx={{
        px: { xs: 2, sm: 2.5 },
        pb: 1.5,
        pt: 0,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      {targets.map((target) => (
        <Stack
          key={target.id}
          direction="row"
          alignItems="center"
          gap={0.75}
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <PlatformBadge platform={target.platform} />
          <Chip
            label={target.status}
            size="small"
            color={STATUS_COLOR[target.status] ?? "default"}
            variant={target.status === "SUCCESS" ? "outlined" : "filled"}
            sx={{ height: 20, fontSize: 10 }}
          />
          {target.status === "FAILED" && target.errorMessage && (
            <Typography variant="caption" color="error" sx={{ maxWidth: 200 }} noWrap>
              {target.errorMessage}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
