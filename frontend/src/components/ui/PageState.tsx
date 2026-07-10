import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Button } from "./Button";

export type PageStateVariant =
  | "empty"
  | "no-results"
  | "coming-soon"
  | "working-on-it";

type PageStateProps = {
  variant: PageStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  compact?: boolean;
};

const PRESETS: Record<
  PageStateVariant,
  { title: string; description: string; icon: ReactNode }
> = {
  empty: {
    title: "No data available",
    description: "Abhi yahan kuch nahi hai. Jaldi hi content add ho sakta hai.",
    icon: <InboxOutlinedIcon sx={{ fontSize: 40 }} />,
  },
  "no-results": {
    title: "No results found",
    description: "Is filter ya search ke liye koi match nahi mila.",
    icon: <SearchOffOutlinedIcon sx={{ fontSize: 40 }} />,
  },
  "coming-soon": {
    title: "Coming soon",
    description: "Yeh feature abhi build ho raha hai — jald aa raha hai.",
    icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 40 }} />,
  },
  "working-on-it": {
    title: "Working on it",
    description: "Hum is par kaam kar rahe hain. Thori der mein wapas check karo.",
    icon: <ConstructionOutlinedIcon sx={{ fontSize: 40 }} />,
  },
};

export function PageState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  compact,
}: PageStateProps) {
  const preset = PRESETS[variant];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: compact ? 4 : 6,
        px: 3,
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "grid",
          placeItems: "center",
          width: compact ? 64 : 80,
          height: compact ? 64 : 80,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.secondary",
        }}
      >
        {icon ?? preset.icon}
      </Box>

      <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={700} gutterBottom>
        {title ?? preset.title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 360, lineHeight: 1.6 }}
      >
        {description ?? preset.description}
      </Typography>

      {actionLabel && onAction && (
        <Box sx={{ mt: 2.5 }}>
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export function EmptyState(props: Omit<PageStateProps, "variant">) {
  return <PageState variant="empty" {...props} />;
}

export function NoResultsState(props: Omit<PageStateProps, "variant">) {
  return <PageState variant="no-results" {...props} />;
}

export function ComingSoonState(props: Omit<PageStateProps, "variant">) {
  return <PageState variant="coming-soon" {...props} />;
}

export function WorkingOnItState(props: Omit<PageStateProps, "variant">) {
  return <PageState variant="working-on-it" {...props} />;
}

export function PageStateLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        py: 6,
        color: "text.secondary",
      }}
    >
      <HourglassTopOutlinedIcon sx={{ fontSize: 32, opacity: 0.7 }} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
