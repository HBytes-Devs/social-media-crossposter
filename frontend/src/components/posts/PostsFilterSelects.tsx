import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ChangeEvent } from "react";
import { usePostsTheme } from "./postsTheme";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  const { colors, fonts, selectSx } = usePostsTheme();

  return (
    <Box sx={{ position: "relative", minWidth: { xs: "100%", sm: 200 }, flex: { sm: "0 0 auto" } }}>
      <Typography
        component="label"
        sx={{
          position: "absolute",
          top: -7,
          left: 12,
          bgcolor: colors.panelTop,
          px: 0.75,
          fontSize: 10,
          color: colors.muted,
          letterSpacing: "0.3px",
          fontWeight: 500,
          fontFamily: fonts.body,
          zIndex: 1,
        }}
      >
        {label}
      </Typography>
      <Box
        component="select"
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        sx={selectSx}
      >
        {children}
      </Box>
      <KeyboardArrowDownIcon
        sx={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 13,
          color: colors.muted,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

type Props = {
  language: string;
  status: string;
  languages: Array<{ code: string; label: string }>;
  onLanguageChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function PostsFilterSelects({
  language,
  status,
  languages,
  onLanguageChange,
  onStatusChange,
}: Props) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
      <SelectField label="Language" value={language} onChange={onLanguageChange}>
        <option value="">All languages</option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </SelectField>

      <SelectField label="Status" value={status} onChange={onStatusChange}>
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="SCHEDULED">Scheduled</option>
        <option value="PUBLISHED">Published</option>
        <option value="PARTIAL">Partial</option>
        <option value="FAILED">Failed</option>
        <option value="PUBLISHING">Publishing</option>
      </SelectField>
    </Box>
  );
}
