import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { PostImage } from "../PostImage";
import type { MediaItem } from "../../types";
import { PLATFORM_META } from "../../lib/platforms";
import { useComposeTheme } from "./composeTheme";
import type { mapComposeColors } from "./composeTheme";

type ComposeColors = ReturnType<typeof mapComposeColors>;

type Props = {
  platform: string;
  authorName: string;
  body: string;
  hashtags: string[];
  images: string[];
  token: string | null;
  mediaLibrary: MediaItem[];
};

function hashtagLine(tags: string[], colors: ComposeColors) {
  if (!tags.length) return null;
  return (
    <Box component="span" sx={{ color: colors.linkedin, fontWeight: 500 }}>
      {tags.map((t) => `#${t}`).join(" ")}
    </Box>
  );
}

function ImageBlock({
  images,
  token,
  mediaLibrary,
  aspect = "1.91/1",
}: {
  images: string[];
  token: string | null;
  mediaLibrary: MediaItem[];
  aspect?: string;
}) {
  const { colors } = useComposeTheme();

  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <Box sx={{ aspectRatio: aspect, bgcolor: colors.surface2, overflow: "hidden" }}>
        <PostImage
          src={images[0]!}
          token={token}
          mediaLibrary={mediaLibrary}
          alt="Post"
          className="h-full w-full object-cover"
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        aspectRatio: "1/1",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2px",
        bgcolor: colors.surface2,
        overflow: "hidden",
      }}
    >
      {images.slice(0, 4).map((src) => (
        <PostImage
          key={src}
          src={src}
          token={token}
          mediaLibrary={mediaLibrary}
          alt="Post"
          className="h-full w-full object-cover"
        />
      ))}
    </Box>
  );
}

function MockShell({
  children,
  actions,
}: {
  children: ReactNode;
  actions: ReactNode;
}) {
  const { colors, fonts } = useComposeTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: colors.surface,
        fontFamily: fonts.body,
      }}
    >
      {children}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2.25,
          px: 1.75,
          py: 1.25,
          borderTop: `1px solid ${colors.border}`,
          color: colors.textTertiary,
          fontSize: 11.5,
        }}
      >
        {actions}
      </Box>
    </Box>
  );
}

function Avatar({
  name,
  bg,
}: {
  name: string;
  bg: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        background: bg,
      }}
    >
      {initials}
    </Box>
  );
}

export function PlatformPostMock({
  platform,
  authorName,
  body,
  hashtags,
  images,
  token,
  mediaLibrary,
}: Props) {
  const { colors, fonts } = useComposeTheme();
  const meta = PLATFORM_META[platform];
  const text = body.trim();
  const displayText = text || "What do you want to share?";
  const tags = hashtagLine(hashtags, colors);

  if (platform === "LINKEDIN") {
    return (
      <MockShell
        actions={
          <>
            <span>👍 Like</span>
            <span>💬 Comment</span>
            <span>🔁 Repost</span>
            <span>➤ Send</span>
          </>
        }
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px 10px" }}>
          <Avatar
            name={authorName}
            bg="linear-gradient(135deg,#6b7bff,#2E5CFF)"
          />
          <Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, color: colors.textPrimary }}>
              {authorName}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: colors.textTertiary, lineHeight: 1.3 }}>
              Founder, SMC · 2m · 🌐
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            px: 1.75,
            pb: 1.5,
            fontSize: 13.5,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: text ? colors.textPrimary : colors.textTertiary,
            fontStyle: text ? "normal" : "italic",
          }}
        >
          {displayText}
          {tags && (
            <>
              {"\n\n"}
              {tags}
            </>
          )}
        </Typography>
        <ImageBlock images={images} token={token} mediaLibrary={mediaLibrary} />
      </MockShell>
    );
  }

  if (platform === "INSTAGRAM") {
    return (
      <MockShell actions={<><span>♡</span><span>💬</span><span>➤</span></>}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px 10px" }}>
          <Avatar
            name={authorName}
            bg="linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)"
          />
          <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{authorName.split(" ")[0]?.toLowerCase()}</Typography>
        </Box>
        {images.length ? (
          <ImageBlock images={images} token={token} mediaLibrary={mediaLibrary} aspect="1/1" />
        ) : (
          <Box sx={{ aspectRatio: "1/1", background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }} />
        )}
        <Box sx={{ px: 1.75, py: 1.25, fontSize: 13, lineHeight: 1.5 }}>
          <Box component="strong" sx={{ mr: 0.75 }}>
            {authorName.split(" ")[0]?.toLowerCase()}
          </Box>
          {displayText}
          {tags && (
            <>
              {" "}
              {tags}
            </>
          )}
        </Box>
      </MockShell>
    );
  }

  if (platform === "FACEBOOK") {
    return (
      <MockShell actions={<><span>👍 Like</span><span>💬 Comment</span><span>↪ Share</span></>}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px 10px" }}>
          <Avatar name={authorName} bg={colors.facebook} />
          <Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{authorName}</Typography>
            <Typography sx={{ fontSize: 11.5, color: colors.textTertiary }}>2m · 🌐</Typography>
          </Box>
        </Box>
        <Typography sx={{ px: 1.75, pb: 1.5, fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {displayText}
          {tags && (
            <>
              {"\n\n"}
              {tags}
            </>
          )}
        </Typography>
        <ImageBlock images={images} token={token} mediaLibrary={mediaLibrary} />
      </MockShell>
    );
  }

  if (platform === "TWITTER") {
    return (
      <MockShell actions={<><span>💬 12</span><span>🔁 4</span><span>♡ 38</span><span>📊 1.2K</span></>}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: "12px 14px 10px" }}>
          <Avatar name={authorName} bg="linear-gradient(135deg,#3a3f47,#0F1419)" />
          <Typography sx={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.3 }}>
            {authorName}{" "}
            <Box component="span" sx={{ fontWeight: 400, color: colors.textTertiary, fontSize: 11.5 }}>
              @user · 2m
            </Box>
          </Typography>
        </Box>
        <Typography sx={{ px: 1.75, pb: 1.5, fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {displayText}
          {tags && (
            <>
              {"\n\n"}
              {tags}
            </>
          )}
        </Typography>
        <ImageBlock images={images} token={token} mediaLibrary={mediaLibrary} />
      </MockShell>
    );
  }

  if (platform === "REDDIT") {
    const title = text.split("\n")[0] || displayText.split("\n")[0] || "Untitled post";
    const rest = text.split("\n").slice(1).join("\n");

    return (
      <Box
        sx={{
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          bgcolor: colors.surface,
        }}
      >
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              width: 38,
              bgcolor: colors.surface2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 1.25,
              gap: 0.5,
              color: colors.textTertiary,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            ▲<span>1</span>▼
          </Box>
          <Box sx={{ flex: 1, p: "10px 14px 14px" }}>
            <Typography sx={{ fontSize: 11, color: colors.textTertiary, mb: 0.5 }}>
              r/buildinpublic · posted by u/{authorName.split(" ")[0]?.toLowerCase()} · 2m
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, mb: 0.75 }}>
              {title}
            </Typography>
            {rest && (
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", pb: 1.25 }}>
                {rest}
                {tags && <> {tags}</>}
              </Typography>
            )}
            <ImageBlock images={images} token={token} mediaLibrary={mediaLibrary} />
            <Box sx={{ display: "flex", gap: 2.25, pt: 1, fontSize: 11.5, color: colors.textTertiary }}>
              <span>💬 3 Comments</span>
              <span>↪ Share</span>
              <span>🔖 Save</span>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Typography sx={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body }}>
      Preview for {meta?.label ?? platform} coming soon.
    </Typography>
  );
}
