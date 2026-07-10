import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { useUiLanguage } from "../../i18n/UiLanguageProvider";
import type { UiLocale } from "../../i18n/messages";

type Props = {
  compact?: boolean;
};

export function UiLanguageSelect({ compact = false }: Props) {
  const { locale, setLocale, locales, t } = useUiLanguage();

  function handleChange(event: SelectChangeEvent<string>) {
    setLocale(event.target.value as UiLocale);
  }

  return (
    <FormControl size="small" sx={{ minWidth: compact ? 128 : 160 }}>
      <InputLabel id="ui-language-label">{t("auth.language")}</InputLabel>
      <Select
        labelId="ui-language-label"
        id="ui-language"
        value={locale}
        label={t("auth.language")}
        onChange={handleChange}
        MenuProps={{
          transitionDuration: 200,
          PaperProps: { elevation: 8, sx: { mt: 0.5, borderRadius: 2 } },
        }}
      >
        {locales.map((item) => (
          <MenuItem key={item.code} value={item.code}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
