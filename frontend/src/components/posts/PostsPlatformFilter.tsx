import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { PLATFORM_META, PLATFORM_ORDER, countPostsByPlatform } from "../../lib/platforms";

type Props = {
  value?: string;
  onChange: (platform: string | undefined) => void;
  posts: { targets: { platform: string }[] }[];
};

export function PostsPlatformFilter({ value, onChange, posts }: Props) {
  const counts = countPostsByPlatform(posts);
  const total = posts.length;

  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ gap: 1.25 }}>
      <Chip
        label={`All platforms · ${total}`}
        clickable
        color={!value ? "primary" : "default"}
        variant={!value ? "filled" : "outlined"}
        onClick={() => onChange(undefined)}
        sx={{
          height: 32,
          transition: "transform 0.15s ease",
          "&:active": { transform: "scale(0.97)" },
        }}
      />

      {PLATFORM_ORDER.map((platform) => {
        const meta = PLATFORM_META[platform];
        const active = value === platform;
        const count = counts[platform] ?? 0;

        return (
          <Chip
            key={platform}
            label={`${meta.label} · ${count}`}
            clickable
            disabled={count === 0 && !active}
            color={active ? "primary" : "default"}
            variant={active ? "filled" : "outlined"}
            onClick={() => onChange(active ? undefined : platform)}
            avatar={
              <Avatar
                sx={{
                  bgcolor: meta.color,
                  width: 22,
                  height: 22,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {meta.icon}
              </Avatar>
            }
            sx={{
              height: 32,
              pl: 0.25,
              transition: "all 0.2s ease",
              ...(active && {
                bgcolor: meta.color,
                color: "#fff",
                "& .MuiChip-avatar": { color: "#fff" },
                "&:hover": { bgcolor: meta.color },
              }),
              "&:active": { transform: "scale(0.97)" },
            }}
          />
        );
      })}
    </Stack>
  );
}
