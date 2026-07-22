import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { dashboardFonts } from "../dashboard/dashboardTheme";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  mb?: number;
};

export function PageHeader({ title, subtitle, actions, mb = 3.5 }: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "flex-start" }}
      sx={{ mb, width: "100%", gap: 2 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {typeof title === "string" ? (
          <Typography
            sx={{
              fontFamily: dashboardFonts.heading,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            {title}
          </Typography>
        ) : (
          title
        )}
        {subtitle ? (
          typeof subtitle === "string" ? (
            <Typography color="text.secondary" sx={{ fontSize: 13.5, mt: 0.75 }}>
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )
        ) : null}
      </Box>

      {actions ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexShrink: 0,
            alignItems: "center",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            gap: 1.25,
            width: { xs: "100%", sm: "auto" },
            ml: { sm: "auto" },
          }}
        >
          {actions}
        </Box>
      ) : null}
    </Stack>
  );
}
