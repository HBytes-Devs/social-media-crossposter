import { useEffect } from "react";
import { PostImage } from "../PostImage";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Select } from "../ui/Select";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchComposerData,
  fetchPreview,
  selectComposer,
  setContent,
  setHashtagMode,
  setHashtags,
  setLanguage,
  setSubreddit,
  setTitle,
  submitPost,
  toggleAccount,
  toggleImage,
  removeImage,
  uploadImages,
} from "../../store/slices/composerSlice";
import { selectToken } from "../../store/slices/authSlice";
import { HashtagInput } from "./HashtagInput";
import { HashtagOptions } from "./HashtagOptions";
import { ImagePicker } from "./ImagePicker";
import { PostPreview } from "./PostPreview";
import { RedditFields } from "./RedditFields";

export function PostComposer() {
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
    previewContent,
    previewTags,
    previewLoading,
    uploading,
    submitting,
    error,
    success,
    initialized,
  } = useAppSelector(selectComposer);

  useEffect(() => {
    dispatch(fetchComposerData());
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      dispatch(fetchPreview());
    }, 400);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    initialized,
    content,
    images,
    hashtagMode,
    hashtags,
    language,
  ]);

  function handleUpload(files: FileList) {
    dispatch(uploadImages(Array.from(files)));
  }

  const hasRedditSelected = selectedAccounts.some((id) => {
    const acc = accounts.find((a) => a.id === id);
    return acc?.platform === "REDDIT";
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">New Post</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hashtags, language aur images — sab control yahan se
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-950/50 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card title="Content" description="Text likho — ya sirf image bhejo">
            <textarea
              value={content}
              onChange={(e) => dispatch(setContent(e.target.value))}
              rows={6}
              placeholder="Apna post likho... (optional agar image hai)"
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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

          <Card title="Language" description="Auto hashtags is language ke hisaab se">
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

          <Card title="Images" description="Optional — with or without image">
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

        <div className="space-y-6 lg:col-span-2">
          <Card title="Live Preview" description="Publish hone wala final text">
            <PostPreview
              finalContent={previewContent}
              hashtags={previewTags}
              loading={previewLoading}
            />
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((url) => (
                  <PostImage
                    key={url}
                    src={url}
                    token={token}
                    mediaLibrary={mediaLibrary}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg border border-slate-700 object-cover"
                  />
                ))}
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              loading={submitting}
              onClick={() => dispatch(submitPost(true))}
              disabled={accounts.length === 0}
            >
              Publish now
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              loading={submitting}
              onClick={() => dispatch(submitPost(false))}
              disabled={accounts.length === 0}
            >
              Save as draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
