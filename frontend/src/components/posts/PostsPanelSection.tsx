import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  first?: boolean;
};

export function PostsPanelSection({ title, children, action, first }: Props) {
  return (
    <Box
      sx={{
        px: 3,
        pt: first ? 2 : 2,
        pb: first ? 1.5 : 2,
        borderTop: first ? 0 : 1,
        borderColor: "divider",
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.25,
            minHeight: 20,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, lineHeight: 1 }}
          >
            {title}
          </Typography>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}
