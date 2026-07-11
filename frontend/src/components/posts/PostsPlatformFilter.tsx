import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PlatformBrandIcon } from "../accounts/PlatformIcons";
import { usePlatformTheme } from "../accounts/platformConnectionTheme";
import { PLATFORM_META, PLATFORM_ORDER, countPostsByPlatform } from "../../lib/platforms";
import { usePostsTheme } from "./postsTheme";

type Props = {
  value?: string;
  onChange: (platform: string | undefined) => void;
  posts: { targets: { platform: string }[] }[];
};

export function PostsPlatformFilter({ value, onChange, posts }: Props) {
  const { colors, fonts } = usePostsTheme();
  const { avatarSx } = usePlatformTheme();
  const counts = countPostsByPlatform(posts);
  const total = posts.length;

  function renderPill(
    label: string,
    count: number,
    active: boolean,
    onClick: () => void,
    platformId?: string,
  ) {
    const avatarStyle = platformId
      ? (avatarSx[platformId as keyof typeof avatarSx] ?? {
          bgcolor: colors.muted,
        })
      : null;

    return (
      <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          px: "14px",
          py: "8px",
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: fonts.body,
          cursor: "pointer",
          border: "1px solid",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
          ...(active
            ? {
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                color: "#fff",
                borderColor: "transparent",
                boxShadow: "0 6px 16px -8px rgba(91,95,239,0.6)",
              }
            : {
                bgcolor: colors.chipBg,
                borderColor: colors.line,
                color: colors.textSoft,
                "&:hover": {
                  borderColor: colors.accentBorder,
                },
              }),
        }}
      >
        {avatarStyle && (
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#fff",
              ...avatarStyle,
            }}
          >
            <PlatformBrandIcon platformId={platformId!} sx={{ fontSize: 9 }} />
          </Box>
        )}
        {label}
        <Typography
          component="span"
          sx={{
            fontFamily: fonts.mono,
            opacity: 0.75,
            fontSize: "inherit",
          }}
        >
          · {count}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {renderPill("All platforms", total, !value, () => onChange(undefined))}

      {PLATFORM_ORDER.map((platform) => {
        const meta = PLATFORM_META[platform];
        const active = value === platform;
        const count = counts[platform] ?? 0;

        return (
          <Box key={platform} component="span">
            {renderPill(
              meta.label,
              count,
              active,
              () => onChange(active ? undefined : platform),
              platform,
            )}
          </Box>
        );
      })}
    </Box>
  );
}
