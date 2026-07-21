import TextField from "@mui/material/TextField";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <TextField
      id={inputId}
      label={label}
      className={className}
      fullWidth
      margin="none"
      error={Boolean(error)}
      helperText={error}
      value={props.value ?? ""}
      onChange={props.onChange}
      onBlur={props.onBlur}
      name={props.name}
      type={props.type}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
      required={props.required}
      disabled={props.disabled}
      slotProps={{
        htmlInput: {
          min: props.min,
          max: props.max,
          step: props.step,
          minLength: props.minLength,
          maxLength: props.maxLength,
          pattern: props.pattern,
          inputMode: props.inputMode,
        },
      }}
      sx={{ my: 0 }}
    />
  );
}
