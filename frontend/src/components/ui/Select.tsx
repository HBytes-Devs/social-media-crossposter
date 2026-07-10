import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect, { type SelectChangeEvent } from "@mui/material/Select";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  fullWidth?: boolean;
};

type OptionProps = { value?: string; children?: ReactNode };

function optionsFromChildren(children: ReactNode) {
  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const el = child as ReactElement<OptionProps>;
      return {
        value: el.props.value ?? "",
        label: String(el.props.children ?? ""),
      };
    });
}

export function Select({
  label,
  className = "",
  id,
  value,
  onChange,
  children,
  disabled,
  fullWidth = true,
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const options = optionsFromChildren(children);
  const stringValue = value === undefined || value === null ? "" : String(value);

  function handleChange(event: SelectChangeEvent<string>) {
    onChange?.({
      target: { value: event.target.value },
    } as React.ChangeEvent<HTMLSelectElement>);
  }

  const emptyLabel = options.find((o) => o.value === "")?.label;

  return (
    <FormControl fullWidth={fullWidth} size="small" className={className} disabled={disabled}>
      {label && <InputLabel id={`${selectId}-label`}>{label}</InputLabel>}
      <MuiSelect
        labelId={label ? `${selectId}-label` : undefined}
        id={selectId}
        label={label}
        value={stringValue}
        displayEmpty={Boolean(emptyLabel)}
        renderValue={(selected) => {
          if (selected === "" && emptyLabel) return emptyLabel;
          return options.find((o) => o.value === selected)?.label ?? selected;
        }}
        onChange={handleChange}
        MenuProps={{
          transitionDuration: 200,
          PaperProps: {
            elevation: 8,
            sx: { mt: 0.5, borderRadius: 2 },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value || "__empty__"} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
