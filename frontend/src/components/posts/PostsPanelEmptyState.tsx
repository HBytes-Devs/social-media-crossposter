import AddIcon from "@mui/icons-material/Add";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { usePostsTheme } from "./postsTheme";

type Props = {
  variant?: "empty" | "no-results";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PostsPanelEmptyState({
  variant = "empty",
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const { colors, fonts } = usePostsTheme();
  const Icon = variant === "no-results" ? SearchOffOutlinedIcon : InboxOutlinedIcon;

  return (
    <Box
      sx={{
        borderTop: "1px solid",
        borderColor: colors.line,
        px: 2.5,
        py: "70px",
        pb: "76px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "18px",
          background: `linear-gradient(135deg, ${colors.accentSoft}, ${colors.chipBg})`,
          border: "1px solid",
          borderColor: colors.accentBorder,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.accent,
          mb: 2.75,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Typography
        sx={{
          fontFamily: fonts.heading,
          fontSize: 17,
          fontWeight: 600,
          color: colors.text,
          mb: 1,
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 13.5,
          color: colors.muted,
          mb: 3,
          maxWidth: 340,
          lineHeight: 1.55,
          fontFamily: fonts.body,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13.5,
            fontFamily: fonts.body,
            px: 2.25,
            py: "11px",
            borderRadius: "10px",
            color: "#fff",
            bgcolor: colors.disabledBg,
            border: `1px solid ${colors.line}`,
            "&:hover": {
              bgcolor: colors.chipBg,
              borderColor: colors.accentBorder,
            },
            "& .MuiButton-startIcon": { mr: "7px" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
