import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";
import { dashboardFonts } from "../dashboard/dashboardTheme";
import { useAppTokens } from "../../theme/AppThemeProvider";

export const opsFonts = dashboardFonts;

export function OpsPage({ children }: { children: ReactNode }) {
  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>{children}</Box>;
}

export function OpsToolbar({
  children,
  meta,
}: {
  children?: ReactNode;
  meta?: ReactNode;
}) {
  if (!children && !meta) return null;
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.25,
        mb: 0.25,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{meta}</Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        {children}
      </Box>
    </Box>
  );
}

export function OpsAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const color =
    tone === "success" ? "success.main" : tone === "info" ? "info.main" : "error.main";
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.75,
        py: 1.1,
        borderColor: color,
        bgcolor:
          tone === "success"
            ? "rgba(34, 140, 90, 0.08)"
            : tone === "info"
              ? "rgba(45, 110, 170, 0.08)"
              : "rgba(194, 65, 59, 0.06)",
        borderRadius: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ color, fontWeight: 600, fontSize: 13 }}>
        {children}
      </Typography>
    </Paper>
  );
}

export function OpsLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
      <CircularProgress size={28} thickness={4} />
    </Box>
  );
}

export function OpsEmpty({ title, detail }: { title: string; detail?: string }) {
  return (
    <Box sx={{ py: 5, textAlign: "center" }}>
      <Typography sx={{ fontWeight: 650, fontSize: 14.5 }}>{title}</Typography>
      {detail ? (
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
          {detail}
        </Typography>
      ) : null}
    </Box>
  );
}

export function OpsPanel({
  title,
  subtitle,
  actions,
  children,
  sx,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      {(title || actions) && (
        <Box
          sx={{
            px: 2,
            py: 1.35,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title ? (
              typeof title === "string" ? (
                <Typography sx={{ fontWeight: 700, fontSize: 13.5, letterSpacing: "-0.1px" }}>
                  {title}
                </Typography>
              ) : (
                title
              )
            ) : null}
            {subtitle ? (
              typeof subtitle === "string" ? (
                <Typography color="text.secondary" sx={{ fontSize: 12, mt: 0.15 }}>
                  {subtitle}
                </Typography>
              ) : (
                subtitle
              )
            ) : null}
          </Box>
          {actions}
        </Box>
      )}
      {children}
    </Paper>
  );
}

export function OpsKpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  icon?: ReactNode;
}) {
  const t = useAppTokens();
  const accent =
    tone === "success"
      ? t.success
      : tone === "warning"
        ? t.gold
        : tone === "danger"
          ? "#c2413b"
          : tone === "accent"
            ? t.accent
            : t.textSecondary;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 108,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          borderColor: accent,
          boxShadow: `0 0 0 1px ${accent}22`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: accent,
          opacity: tone === "neutral" ? 0.35 : 0.9,
        }}
      />
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
        {icon ? (
          <Box sx={{ color: accent, opacity: 0.85, display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
        ) : null}
      </Box>
      <Typography
        sx={{
          mt: 1,
          fontFamily: opsFonts.heading,
          fontSize: 26,
          fontWeight: 720,
          letterSpacing: "-0.6px",
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography color="text.secondary" sx={{ mt: 0.65, fontSize: 12 }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

type ChipTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const chipColors: Record<ChipTone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: "transparent", fg: "text.secondary", border: "divider" },
  success: { bg: "rgba(34, 140, 90, 0.12)", fg: "#1b7a4c", border: "rgba(34, 140, 90, 0.28)" },
  warning: { bg: "rgba(180, 130, 40, 0.12)", fg: "#8a6518", border: "rgba(180, 130, 40, 0.3)" },
  danger: { bg: "rgba(194, 65, 59, 0.12)", fg: "#a33a35", border: "rgba(194, 65, 59, 0.3)" },
  info: { bg: "rgba(45, 110, 170, 0.12)", fg: "#1f5f96", border: "rgba(45, 110, 170, 0.3)" },
  accent: { bg: "rgba(30, 90, 140, 0.1)", fg: "#1a4f7a", border: "rgba(30, 90, 140, 0.28)" },
};

export function OpsStatusChip({
  label,
  tone = "neutral",
  size = "small",
}: {
  label: string;
  tone?: ChipTone;
  size?: "small" | "medium";
}) {
  const c = chipColors[tone];
  return (
    <Chip
      size={size}
      label={label}
      sx={{
        height: size === "small" ? 22 : 26,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        borderRadius: 1,
        bgcolor: c.bg,
        color: c.fg,
        border: "1px solid",
        borderColor: c.border,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

export function roleTone(role: string): ChipTone {
  if (role === "SUPER_ADMIN") return "accent";
  if (role === "ADMIN") return "info";
  return "neutral";
}

export function tierTone(tier: string): ChipTone {
  if (tier === "PREMIUM") return "accent";
  if (tier === "MEDIUM") return "info";
  return "neutral";
}

export function issueStatusTone(status: string): ChipTone {
  if (status === "RESOLVED") return "success";
  if (status === "IN_PROGRESS") return "warning";
  return "danger";
}

export function OpsTable({
  headers,
  children,
  empty,
  colSpan,
}: {
  headers: Array<string | { label: string; align?: "left" | "right" | "center"; width?: number | string }>;
  children: ReactNode;
  empty?: boolean;
  colSpan?: number;
}) {
  return (
    <TableContainer sx={{ maxWidth: "100%" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {headers.map((h, i) => {
              const label = typeof h === "string" ? h : h.label;
              const align = typeof h === "string" ? "left" : h.align ?? "left";
              const width = typeof h === "string" ? undefined : h.width;
              return (
                <TableCell
                  key={`${label}-${i}`}
                  align={align}
                  sx={{
                    width,
                    fontSize: 11,
                    fontWeight: 720,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    bgcolor: "background.paper",
                    borderBottomColor: "divider",
                    py: 1.15,
                  }}
                >
                  {label}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell colSpan={colSpan ?? headers.length} sx={{ border: 0 }}>
                <OpsEmpty title="No records" detail="Nothing to show for this view yet." />
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function OpsTableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <TableRow
      hover
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        "& td": { py: 1.15, fontSize: 13, borderColor: "divider" },
      }}
    >
      {children}
    </TableRow>
  );
}

export function OpsMono({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="span"
      sx={{ fontFamily: opsFonts.mono, fontSize: 12, letterSpacing: "-0.2px" }}
    >
      {children}
    </Typography>
  );
}

export function OpsTierBars({
  free,
  medium,
  premium,
}: {
  free: number;
  medium: number;
  premium: number;
}) {
  const total = Math.max(1, free + medium + premium);
  const segments = [
    { label: "Free", value: free, color: "rgba(120,130,145,0.55)" },
    { label: "Medium", value: medium, color: "#3d7eb8" },
    { label: "Premium", value: premium, color: "#1a4f7a" },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          bgcolor: "action.hover",
        }}
      >
        {segments.map((s) => (
          <Box
            key={s.label}
            title={`${s.label}: ${s.value}`}
            sx={{
              width: `${(s.value / total) * 100}%`,
              bgcolor: s.color,
              minWidth: s.value > 0 ? 4 : 0,
              transition: "width 240ms ease",
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 2.5, mt: 1.5, flexWrap: "wrap" }}>
        {segments.map((s) => (
          <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: s.color }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {s.label}{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {s.value}
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
