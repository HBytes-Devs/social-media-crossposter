import { useState, type KeyboardEvent } from "react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export function HashtagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#+/, "");
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-600/20 px-2.5 py-1 text-xs font-medium text-brand-100"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-brand-200 hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length ? "Add more..." : "Type hashtag and press Enter"}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>
      <p className="text-xs text-slate-500">Enter ya comma se tag add karo. # optional hai.</p>
    </div>
  );
}
