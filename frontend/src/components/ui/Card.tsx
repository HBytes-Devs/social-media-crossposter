import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { glassPanelSx } from "../../theme/glassSurface";

export function Card({
  title,
  description,
  children,
  className = "",
  padding = "default",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  padding?: "default" | "none";
}) {
  const hasHeader = Boolean(title || description);
  const contentSx = padding === "none" ? { p: 0, "&:last-child": { pb: 0 } } : undefined;

  return (
    <MuiCard className={className} sx={{ overflow: "hidden", ...glassPanelSx }}>
      <CardContent sx={contentSx}>
        {hasHeader && (
          <header className="mb-4">
            {title && (
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </header>
        )}
        {children}
      </CardContent>
    </MuiCard>
  );
}
