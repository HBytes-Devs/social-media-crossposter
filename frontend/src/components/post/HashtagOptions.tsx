import type { HashtagMode, HashtagModeOption } from "../../types";

type Props = {
  value: HashtagMode;
  onChange: (mode: HashtagMode) => void;
  options: HashtagModeOption[];
};

export function HashtagOptions({ value, onChange, options }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border p-4 text-left transition ${
              selected
                ? "border-brand-500 bg-brand-600/10 ring-1 ring-brand-500"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <p className="text-sm font-semibold text-white">{option.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
