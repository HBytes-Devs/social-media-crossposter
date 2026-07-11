import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { fromLocalDatetimeValue } from "../../lib/datetime";
import { useComposeTheme } from "./composeTheme";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SchedulePicker({ value, onChange }: Props) {
  const { colors, fonts, fieldLabelSx } = useComposeTheme();
  const isoPreview = fromLocalDatetimeValue(value);

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography component="label" sx={fieldLabelSx}>
        Schedule date & time
      </Typography>
      <Box
        component="input"
        type="datetime-local"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          width: "100%",
          border: "1px solid",
          borderColor: colors.borderStrong,
          borderRadius: "8px",
          p: "10px 12px",
          fontSize: 13.5,
          fontFamily: fonts.body,
          color: colors.textPrimary,
          bgcolor: colors.surface,
          outline: "none",
          "&:focus": {
            borderColor: colors.accent,
            boxShadow: `0 0 0 3px ${colors.accentSoft}`,
          },
        }}
      />
      {isoPreview && (
        <Typography sx={{ fontSize: 11.5, color: colors.textTertiary, mt: 0.75 }}>
          Posts at {new Date(isoPreview).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
}
