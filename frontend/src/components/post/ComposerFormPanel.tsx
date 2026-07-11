import { memo, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectComposer,
  setContent,
  setHashtagMode,
  setHashtags,
  setLanguage,
  setSubreddit,
  setTitle,
  toggleAccount,
  toggleImage,
  removeImage,
  uploadImages,
  fetchComposerData,
} from "../../store/slices/composerSlice";
import { selectToken } from "../../store/slices/authSlice";
import { selectAccounts } from "../../store/slices/accountsSlice";
import { getComposerDraft, subscribeComposerDraft } from "../../lib/composerDraft";
import { ContentEditor } from "./ContentEditor";
import { ComposeAssistToggles, useComposeAssistPrefs } from "./ComposeAssistToggles";
import { HashtagInput } from "./HashtagInput";
import { HashtagOptions } from "./HashtagOptions";
import { ImagePicker } from "./ImagePicker";
import { RedditFields } from "./RedditFields";
import { AiAssistPanel } from "./AiAssistPanel";
import { ComposerCard } from "./ComposerCard";
import { ComposerPlatformGrid } from "./ComposerPlatformGrid";
import { ComposerPublishPanel } from "./ComposerPublishPanel";
import { api } from "../../lib/api";
import { useComposeTheme } from "./composeTheme";

export const ComposerFormPanel = memo(function ComposerFormPanel() {
  const { colors, fonts, fieldLabelSx, selectSx } = useComposeTheme();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const draft = useSyncExternalStore(subscribeComposerDraft, getComposerDraft);
  const {
    content,
    title,
    subreddit,
    hashtagMode,
    hashtags,
    language,
    images,
    options,
    accounts,
    selectedAccounts,
    mediaLibrary,
    imageWarnings,
    uploadError,
    uploading,
    initialized,
    error: composerError,
  } = useAppSelector(selectComposer);
  const { items: accountsFromSlice } = useAppSelector(selectAccounts);

  const handleSyncContent = useCallback(
    (value: string) => dispatch(setContent(value)),
    [dispatch],
  );

  const handleUpload = useCallback(
    (files: FileList) => dispatch(uploadImages(Array.from(files))),
    [dispatch],
  );

  const platformAccounts = accounts.length > 0 ? accounts : accountsFromSlice;

  const hasRedditSelected = selectedAccounts.some((id) => {
    const acc = platformAccounts.find((a) => a.id === id);
    return acc?.platform === "REDDIT";
  });

  const primaryPlatform =
    selectedAccounts.length > 0
      ? platformAccounts.find((a) => a.id === selectedAccounts[0])?.platform
      : platformAccounts[0]?.platform;

  const { smartSuggest, autoCorrect, setSmartSuggest, setAutoCorrect } =
    useComposeAssistPrefs();
  const [aiConfigured, setAiConfigured] = useState(false);

  const selectedPlatformNames = useMemo(
    () =>
      selectedAccounts
        .map((id) => platformAccounts.find((a) => a.id === id)?.platform)
        .filter((p): p is string => Boolean(p)),
    [selectedAccounts, platformAccounts],
  );

  useEffect(() => {
    if (!token) return;
    if (accounts.length === 0 && initialized) {
      dispatch(fetchComposerData());
    }
  }, [token, accounts.length, initialized, dispatch]);

  useEffect(() => {
    if (!token) return;
    api.getAiStatus(token).then((s) => setAiConfigured(s.configured)).catch(() => setAiConfigured(false));
  }, [token]);

  const charCount = draft.length;
  const twitterSelected = selectedPlatformNames.includes("TWITTER");

  const tagPreview = useMemo(() => {
    if (hashtagMode === "manual") return hashtags;
    if (hashtagMode === "none") return [];
    return hashtags;
  }, [hashtagMode, hashtags]);

  return (
    <Box>
      <ComposerCard title="Content" description="Write your text, or send an image on its own.">
        <ContentEditor
          value={content}
          onSync={handleSyncContent}
          placeholder="What do you want to share?"
          language={language}
          token={token}
          aiConfigured={aiConfigured}
          smartSuggest={smartSuggest}
          autoCorrect={autoCorrect}
          composeTheme
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Typography
            sx={{
              fontFamily: fonts.mono,
              fontSize: 11.5,
              color: twitterSelected && charCount > 280 ? colors.danger : colors.textTertiary,
              fontWeight: twitterSelected && charCount > 280 ? 600 : 400,
            }}
          >
            {charCount} character{charCount === 1 ? "" : "s"}
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: colors.success,
              boxShadow: `0 0 0 3px ${colors.successSoft}`,
            }}
            title="Ready to publish"
          />
        </Box>
        <ComposeAssistToggles
          aiConfigured={aiConfigured}
          smartSuggest={smartSuggest}
          autoCorrect={autoCorrect}
          onSmartSuggestChange={setSmartSuggest}
          onAutoCorrectChange={setAutoCorrect}
        />
        <AiAssistPanel
          token={token}
          content={content}
          language={language}
          platform={primaryPlatform}
          onContentChange={(value) => dispatch(setContent(value))}
          onHashtagsChange={(tags) => dispatch(setHashtags(tags))}
          onHashtagModeChange={(mode) => dispatch(setHashtagMode(mode))}
        />
      </ComposerCard>

      {hasRedditSelected && (
        <ComposerCard title="Reddit" description="Title and subreddit are required for Reddit posts.">
          <RedditFields
            title={title}
            subreddit={subreddit}
            onTitleChange={(v) => dispatch(setTitle(v))}
            onSubredditChange={(v) => dispatch(setSubreddit(v))}
          />
        </ComposerCard>
      )}

      <ComposerCard title="Hashtags" description="Auto-generate, write your own, or skip them entirely.">
        <HashtagOptions
          value={hashtagMode}
          onChange={(mode) => dispatch(setHashtagMode(mode))}
          options={options.hashtagModes}
        />
        {hashtagMode === "manual" && (
          <HashtagInput tags={hashtags} onChange={(tags) => dispatch(setHashtags(tags))} />
        )}
        {tagPreview.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.25 }}>
            {tagPreview.map((tag) => (
              <Box
                key={tag}
                component="span"
                sx={{
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
              </Box>
            ))}
          </Box>
        )}
      </ComposerCard>

      <ComposerCard title="Language" description="Post text and hashtags will be shown in this language.">
        <Typography component="label" sx={fieldLabelSx}>
          Post language
        </Typography>
        <Box
          component="select"
          value={language}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => dispatch(setLanguage(e.target.value))}
          sx={selectSx}
        >
          {options.languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </Box>
      </ComposerCard>

      <ComposerCard
        title="Images"
        description="LinkedIn recommends 1200×627 or 1200×1200 · min 552×276px · max 8MB · ratio 4:5 to 1.91:1"
      >
        <ImagePicker
          images={images}
          mediaLibrary={mediaLibrary}
          token={token}
          uploading={uploading}
          uploadError={uploadError}
          imageWarnings={imageWarnings}
          onUpload={handleUpload}
          onToggle={(url) => dispatch(toggleImage(url))}
          onRemove={(url) => dispatch(removeImage(url))}
          composeTheme
        />
      </ComposerCard>

      <ComposerCard title="Platforms" description="Select where to publish — multiple selection cross-posts to all.">
        {composerError && accounts.length === 0 && (
          <Typography sx={{ fontSize: 12.5, color: colors.danger, mb: 1.5, fontFamily: fonts.body }}>
            Could not load connected accounts. Refresh the page or check that the backend is running.
          </Typography>
        )}
        <ComposerPlatformGrid
          accounts={platformAccounts}
            selectedAccounts={selectedAccounts}
            onToggle={(id) => dispatch(toggleAccount(id))}
          />
      </ComposerCard>

      <ComposerCard
        title="Publish or schedule"
        description="One action panel — no duplicate submissions."
        sx={{
          position: { xs: "sticky", md: "static" },
          bottom: { xs: 12, md: "auto" },
          zIndex: { xs: 2, md: "auto" },
          boxShadow: {
            xs: "0 -8px 24px rgba(16,24,40,0.08)",
            md: "0 1px 2px rgba(16,24,40,0.03)",
          },
        }}
      >
        <ComposerPublishPanel />
      </ComposerCard>
    </Box>
  );
});
