import { memo, useCallback, useEffect, useState } from "react";
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
          onUpload={handleUpload}
          onToggle={(url) => dispatch(toggleImage(url))}
          onRemove={(url) => dispatch(removeImage(url))}
        />
      </Card>

      <Card title="Platforms" description="Kahan publish karna hai">
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-400">
            Koi account connected nahi. Pehle{" "}
            <a href="/accounts" className="text-brand-400 hover:underline">
              Accounts
            </a>{" "}
            page se LinkedIn connect karo.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <label
                key={acc.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 px-4 py-3 hover:bg-slate-800/50"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(acc.id)}
                  onChange={() => dispatch(toggleAccount(acc.id))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {acc.accountName ?? acc.accountId}
                  </p>
                  <p className="text-xs text-slate-500">{acc.platform}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
});
