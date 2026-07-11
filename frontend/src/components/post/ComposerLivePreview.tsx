import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo, useEffect, useMemo, useState } from "react";
import { useSyncExternalStore } from "react";
import { getComposerDraft, subscribeComposerDraft } from "../../lib/composerDraft";
import { useLocalizedContent } from "../../hooks/useLocalizedContent";
import { previewPostContent } from "../../lib/hashtags";
import { PLATFORM_META, PLATFORM_ORDER, type PlatformId } from "../../lib/platforms";
import { useAppSelector } from "../../store/hooks";
import { selectAuth, selectToken } from "../../store/slices/authSlice";
import { selectComposer } from "../../store/slices/composerSlice";
import { useComposeTheme } from "./composeTheme";
import { PlatformPostMock } from "./PlatformPostMock";

export const ComposerLivePreview = memo(function ComposerLivePreview() {
  const { colors, fonts } = useComposeTheme();
  const token = useAppSelector(selectToken);
  const { user } = useAppSelector(selectAuth);
  const {
    content,
    hashtagMode,
    hashtags,
    language,
    images,
    accounts,
    selectedAccounts,
    mediaLibrary,
  } = useAppSelector(selectComposer);

  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);
  const sourceText = draft || content;
  const localizedDraft = useLocalizedContent(sourceText, language, token);
  const previewBody = language === "en" ? sourceText : localizedDraft;

  const selectedPlatforms = useMemo(
    () =>
      PLATFORM_ORDER.filter((p) =>
        selectedAccounts.some((id) => accounts.find((a) => a.id === id)?.platform === p),
      ),
    [selectedAccounts, accounts],
  );

  const previewPlatforms =
    selectedPlatforms.length > 0 ? selectedPlatforms : (["LINKEDIN"] as PlatformId[]);

  const [activeTab, setActiveTab] = useState<PlatformId>(previewPlatforms[0] ?? "LINKEDIN");

  useEffect(() => {
    if (!previewPlatforms.includes(activeTab)) {
      setActiveTab(previewPlatforms[0] ?? "LINKEDIN");
    }
  }, [previewPlatforms, activeTab]);

  const effectiveTab = previewPlatforms.includes(activeTab)
    ? activeTab
    : (previewPlatforms[0] ?? "LINKEDIN");

  const preview = useMemo(
    () =>
      previewPostContent({
        content: previewBody,
        hashtagMode,
        hashtags,
        language,
      }),
    [previewBody, hashtagMode, hashtags, language],
  );

  const previewHashtags = useMemo(() => {
    if (hashtagMode === "none") return [];
    if (hashtagMode === "manual") return preview.hashtags;
    if (!previewBody.trim()) return [];
    return preview.hashtags;
  }, [previewBody, hashtagMode, preview.hashtags]);

  const linkedInAccount = accounts.find(
    (a) => a.platform === "LINKEDIN" && selectedAccounts.includes(a.id),
  );

  const authorName =
    linkedInAccount?.accountName ?? user?.name ?? user?.email ?? "Your Name";

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 24 },
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          bgcolor: colors.surface,
          border: "1px solid",
          borderColor: colors.border,
          borderRadius: "16px",
          p: "18px",
          boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
        }}
      >
        <Typography
          sx={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 15,
            color: colors.textPrimary,
            mb: 0.375,
          }}
        >
          Live preview
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
            color: colors.textSecondary,
            mb: 1.75,
            fontFamily: fonts.body,
          }}
        >
          See exactly how this post lands on each platform.
        </Typography>

        {selectedPlatforms.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              overflowX: "auto",
              pb: 1.25,
              mb: 1.75,
              borderBottom: "1px solid",
              borderColor: colors.border,
            }}
          >
            {selectedPlatforms.map((platformId) => {
              const meta = PLATFORM_META[platformId];
              const active = effectiveTab === platformId;

              return (
                <Box
                  key={platformId}
                  component="button"
                  type="button"
                  onClick={() => setActiveTab(platformId)}
                  sx={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: 12,
                    fontWeight: 600,
                    px: "11px",
                    py: "7px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    fontFamily: fonts.body,
                    bgcolor: active ? colors.accentDark : colors.surface2,
                    color: active ? "#fff" : colors.textSecondary,
                    transition: "all 0.12s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: meta?.color ?? colors.accent,
                    }}
                  />
                  {meta?.label ?? platformId}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: 12,
              fontWeight: 600,
              px: "11px",
              py: "7px",
              borderRadius: 999,
              mb: 1.75,
              pb: 1.25,
              borderBottom: "1px solid",
              borderColor: colors.border,
              width: "100%",
              fontFamily: fonts.body,
              bgcolor: colors.accentDark,
              color: "#fff",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: PLATFORM_META.LINKEDIN.color,
              }}
            />
            {PLATFORM_META.LINKEDIN.label}
          </Box>
        )}

        {selectedPlatforms.length === 0 && (
          <Typography
            sx={{
              fontSize: 12,
              color: colors.textTertiary,
              mb: 1.5,
              fontFamily: fonts.body,
            }}
          >
            Select a connected platform below to publish. Preview defaults to LinkedIn.
          </Typography>
        )}

        <PlatformPostMock
          platform={effectiveTab}
          authorName={authorName}
          body={previewBody}
          hashtags={previewHashtags}
          images={images}
          token={token}
          mediaLibrary={mediaLibrary}
        />
      </Box>
    </Box>
  );
});
