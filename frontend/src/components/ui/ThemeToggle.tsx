import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useThemeMode } from "../../theme/AppThemeProvider";

type Props = {
  size?: "small" | "medium";
};

export function ThemeToggle({ size = "medium" }: Props) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        size={size}
        onClick={toggleMode}
        aria-label="Toggle color mode"
        sx={{
          transition: "transform 0.3s ease",
          "&:hover": { transform: "rotate(12deg)" },
        }}
      >
        {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
