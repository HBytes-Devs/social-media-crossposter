import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { PlatformIcon } from "../platforms/PlatformBadge";

type Props = {
  platformKey?: string;
  label: string;
  color?: string;
  count: number;
  children: ReactNode;
};

export function PostsPlatformSection({
  platformKey,
  label,
  color,
  count,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.02) : "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          borderLeft: 4,
          borderLeftColor: color ?? "text.disabled",
          bgcolor: color ? alpha(color, theme.palette.mode === "dark" ? 0.12 : 0.08) : "transparent",
        }}
      >
        {platformKey ? (
          <PlatformIcon platform={platformKey} className="h-9 w-9 text-xs" />
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "action.selected",
              color: "text.secondary",
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            —
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {count} post{count === 1 ? "" : "s"}
          </Typography>
        </Box>
      </Box>
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
        {children}
      </Stack>
    </Paper>
  );
}
