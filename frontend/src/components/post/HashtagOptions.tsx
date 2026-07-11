import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { HashtagMode, HashtagModeOption } from "../../types";
import { useComposeTheme } from "./composeTheme";

type Props = {
  value: HashtagMode;
  onChange: (mode: HashtagMode) => void;
  options: HashtagModeOption[];
};

export function HashtagOptions({ value, onChange, options }: Props) {
  const { colors, fonts } = useComposeTheme();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 1.25,
      }}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            onClick={() => onChange(option.value)}
            sx={{
              border: "1.5px solid",
              borderColor: selected ? colors.accentDark : colors.borderStrong,
              borderRadius: "12px",
              p: "14px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.12s ease",
              bgcolor: selected ? colors.accentDark : colors.surface2,
            }}
          >
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 700,
                color: selected ? "#fff" : colors.textPrimary,
                mb: 0.25,
                fontFamily: fonts.body,
              }}
            >
              {option.label}
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: selected ? "#B8C0D6" : colors.textSecondary,
                fontFamily: fonts.body,
                lineHeight: 1.4,
              }}
            >
              {option.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
