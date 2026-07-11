import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState, type KeyboardEvent } from "react";
import { useComposeTheme } from "./composeTheme";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

export function HashtagInput({ tags, onChange }: Props) {
  const { colors, fonts } = useComposeTheme();
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
    <Box sx={{ mt: 1.5 }}>
      <Box
        sx={{
          width: "100%",
          border: "1px solid",
          borderColor: colors.borderStrong,
          borderRadius: "8px",
          p: "10px 12px",
          fontSize: 13.5,
          fontFamily: fonts.body,
          bgcolor: colors.surface,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          alignItems: "center",
        }}
      >
        {tags.map((tag) => (
          <Box
            key={tag}
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontFamily: fonts.mono,
              fontSize: 11.5,
              color: colors.accent,
              bgcolor: colors.accentSoft,
              px: "9px",
              py: "4px",
              borderRadius: 999,
            }}
          >
            #{tag}
            <Box
              component="button"
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              sx={{
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0,
                display: "flex",
                color: "inherit",
              }}
              aria-label={`Remove ${tag}`}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </Box>
          </Box>
        ))}
        <Box
          component="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length ? "Add more..." : "#launch #buildinpublic #saas"}
          sx={{
            flex: 1,
            minWidth: 120,
            border: "none",
            outline: "none",
            bgcolor: "transparent",
            fontSize: 13.5,
            fontFamily: fonts.body,
            color: colors.textPrimary,
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 11.5, color: colors.textTertiary, mt: 1 }}>
        Enter ya comma se tag add karo. # optional hai.
      </Typography>
    </Box>
  );
}
