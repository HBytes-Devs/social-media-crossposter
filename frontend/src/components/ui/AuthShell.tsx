import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { UiLanguageSelect } from "./UiLanguageSelect";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.25 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            <UiLanguageSelect compact />
            <ThemeToggle size="small" />
          </Stack>
        </Stack>

        {children}

        {footer && (
          <>
            <Divider sx={{ my: 3 }} />
            {footer}
          </>
        )}
      </Paper>
    </Box>
  );
}
