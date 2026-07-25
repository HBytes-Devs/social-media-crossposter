import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAnalyticsTheme } from "./analyticsTheme";

type Props = {
  title?: string;
  search: string;
  onSearchChange: (value: string) => void;
  dateLabel: string;
  displayName: string;
  email?: string | null;
  initials: string;
  onExport?: () => void;
};

export function AnalyticsDashboardHeader({
  title = "Email Analytics",
  search,
  onSearchChange,
  dateLabel,
  displayName,
  initials,
  onExport,
}: Props) {
  const a = useAnalyticsTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        mb: 3,
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontFamily: a.font,
          fontSize: { xs: 22, md: 26 },
          fontWeight: 700,
          color: a.text,
          letterSpacing: "-0.4px",
          flexShrink: 0,
          mr: { md: 1 },
        }}
      >
        {title}
      </Typography>

      <TextField
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
        size="small"
        sx={{
          flex: { xs: "1 1 180px", md: "1 1 260px" },
          maxWidth: { md: 360 },
          mx: { md: "auto" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "999px",
            bgcolor: a.inputBg,
            color: a.text,
            fontFamily: a.font,
            fontSize: 14,
            height: 42,
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: a.border },
            "&.Mui-focused fieldset": { borderColor: a.purple },
          },
          "& .MuiInputBase-input::placeholder": {
            color: a.textMuted,
            opacity: 1,
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: a.textMuted }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexWrap: "wrap",
          ml: { xs: 0, md: "auto" },
        }}
      >
        <IconButton
          aria-label="Notifications"
          sx={{
            width: 40,
            height: 40,
            color: a.textSoft,
            bgcolor: a.cardBg,
            border: `1px solid ${a.border}`,
            "&:hover": { bgcolor: a.inputBg },
          }}
        >
          <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Button
          startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            fontFamily: a.font,
            fontWeight: 500,
            fontSize: 13,
            color: a.text,
            bgcolor: a.cardBg,
            border: `1px solid ${a.border}`,
            borderRadius: "999px",
            px: 1.75,
            height: 40,
            boxShadow: "none",
            "&:hover": { bgcolor: a.inputBg, boxShadow: "none" },
          }}
        >
          {dateLabel}
        </Button>

        <Button
          onClick={onExport}
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            fontFamily: a.font,
            fontWeight: 500,
            fontSize: 13,
            color: a.textSoft,
            bgcolor: a.inputBg,
            border: `1px solid ${a.border}`,
            borderRadius: "12px",
            px: 1.75,
            height: 40,
            boxShadow: "none",
            "&:hover": { bgcolor: a.chipBg, boxShadow: "none", opacity: 0.95 },
          }}
        >
          Export
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pl: 0.5,
            pr: 1,
            py: 0.5,
            borderRadius: "999px",
            cursor: "default",
            "&:hover": { bgcolor: a.inputBg },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 13,
              fontWeight: 700,
              bgcolor: a.mode === "dark" ? "#2A3344" : a.purpleSoft,
              color: a.mode === "dark" ? "#E8EEF9" : a.purple,
            }}
          >
            {initials}
          </Avatar>
          <Typography
            sx={{
              fontFamily: a.font,
              fontSize: 13.5,
              fontWeight: 600,
              color: a.text,
              display: { xs: "none", sm: "block" },
            }}
          >
            {displayName}
          </Typography>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: a.textMuted }} />
        </Box>
      </Box>
    </Box>
  );
}
