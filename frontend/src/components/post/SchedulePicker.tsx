import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { fromLocalDatetimeValue } from "../../lib/datetime";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SchedulePicker({ value, onChange }: Props) {
  const isoPreview = fromLocalDatetimeValue(value);

  return (
    <Stack spacing={1}>
      <TextField
        label="Schedule date & time"
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
      {isoPreview && (
        <Typography variant="caption" color="text.secondary">
          Posts at {new Date(isoPreview).toLocaleString()}
        </Typography>
      )}
    </Stack>
  );
}
