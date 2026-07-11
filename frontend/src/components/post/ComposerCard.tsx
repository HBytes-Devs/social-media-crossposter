import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { useComposeTheme } from "./composeTheme";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export function ComposerCard({ title, description, action, children, sx }: Props) {
  const { colors, fonts } = useComposeTheme();

  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: "1px solid",
        borderColor: colors.border,
        borderRadius: "16px",
        p: "22px",
        mb: "18px",
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: 15.5,
              fontWeight: 700,
              color: colors.textPrimary,
              lineHeight: 1.3,
              mb: description ? 0.375 : 0,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: fonts.body,
                lineHeight: 1.45,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}
