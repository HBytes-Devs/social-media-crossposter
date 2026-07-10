import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
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
} from "../../store/slices/composerSlice";
import { selectToken } from "../../store/slices/authSlice";
import { ContentEditor } from "./ContentEditor";
import { ComposeAssistToggles, useComposeAssistPrefs } from "./ComposeAssistToggles";
import { HashtagInput } from "./HashtagInput";
import { HashtagOptions } from "./HashtagOptions";
import { ImagePicker } from "./ImagePicker";
import { PlatformComposeHints } from "./PlatformComposeHints";
import { RedditFields } from "./RedditFields";
import { AiAssistPanel } from "./AiAssistPanel";
import { api } from "../../lib/api";

export const ComposerFormPanel = memo(function ComposerFormPanel() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
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
  } = useAppSelector(selectComposer);

  const handleSyncContent = useCallback(
    (value: string) => dispatch(setContent(value)),
    [dispatch],
  );

  const handleUpload = useCallback(
    (files: FileList) => dispatch(uploadImages(Array.from(files))),
    [dispatch],
  );

  const hasRedditSelected = selectedAccounts.some((id) => {
    const acc = accounts.find((a) => a.id === id);
    return acc?.platform === "REDDIT";
  });

  const primaryPlatform =
    selectedAccounts.length > 0
      ? accounts.find((a) => a.id === selectedAccounts[0])?.platform
      : accounts[0]?.platform;

  const { smartSuggest, autoCorrect, setSmartSuggest, setAutoCorrect } =
    useComposeAssistPrefs();
  const [aiConfigured, setAiConfigured] = useState(false);

  const selectedPlatformNames = useMemo(
    () =>
      selectedAccounts
        .map((id) => accounts.find((a) => a.id === id)?.platform)
        .filter((p): p is string => Boolean(p)),
    [selectedAccounts, accounts],
  );

  useEffect(() => {
    if (!token) return;
    api.getAiStatus(token).then((s) => setAiConfigured(s.configured)).catch(() => setAiConfigured(false));
  }, [token]);

  return (
    <div className="space-y-6 lg:col-span-3">
      <Card title="Content" description="Text likho — ya sirf image bhejo">
        <ContentEditor
          value={content}
          onSync={handleSyncContent}
          placeholder="Apna post likho... (optional agar image hai)"
          language={language}
          token={token}
          aiConfigured={aiConfigured}
          smartSuggest={smartSuggest}
          autoCorrect={autoCorrect}
        />
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
      </Card>

      {hasRedditSelected && (
        <Card title="Reddit" description="Title aur subreddit zaroori hain">
          <RedditFields
            title={title}
            subreddit={subreddit}
            onTitleChange={(v) => dispatch(setTitle(v))}
            onSubredditChange={(v) => dispatch(setSubreddit(v))}
          />
        </Card>
      )}

      <Card title="Hashtags" description="Auto, manual, ya bilkul none">
        <HashtagOptions
          value={hashtagMode}
          onChange={(mode) => dispatch(setHashtagMode(mode))}
          options={options.hashtagModes}
        />
        {hashtagMode === "manual" && (
          <div className="mt-4">
            <HashtagInput
              tags={hashtags}
              onChange={(tags) => dispatch(setHashtags(tags))}
            />
          </div>
        )}
      </Card>

      <Card title="Language" description="Post text aur hashtags is language mein convert honge">
        <Select
          label="Post language"
          value={language}
          onChange={(e) => dispatch(setLanguage(e.target.value))}
        >
          {options.languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </Select>
      </Card>

      <Card
        title="Images"
        description="LinkedIn ke liye — recommended 1200×627 ya 1200×1200"
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
        />
      </Card>

      <Card title="Platforms" description="Kahan publish karna hai — multiple select = cross-post">
        <PlatformComposeHints
          selectedPlatforms={selectedPlatformNames}
          contentLength={content.length}
          imageCount={images.length}
        />
        <Box sx={{ mt: 2 }}>
          {accounts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Koi account connected nahi. Pehle{" "}
              <Typography
                component="a"
                href="/accounts"
                color="primary"
                sx={{ textDecoration: "underline" }}
              >
                Accounts
              </Typography>{" "}
              page se LinkedIn ya Reddit connect karo.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {accounts.map((acc) => (
                <Box
                  key={acc.id}
                  component="label"
                  sx={{
                    display: "flex",
                    cursor: "pointer",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    px: 2,
                    py: 1.5,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(acc.id)}
                    onChange={() => dispatch(toggleAccount(acc.id))}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {acc.accountName ?? acc.accountId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {acc.platform}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Card>
    </div>
  );
});
