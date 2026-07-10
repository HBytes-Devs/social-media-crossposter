import { memo } from "react";
import { PostImage } from "../PostImage";
import type { HashtagMode, MediaItem } from "../../types";

type Props = {
  authorName: string;
  authorAvatar?: string | null;
  body: string;
  hashtags: string[];
  hashtagMode: HashtagMode;
  images: string[];
  token: string | null;
  mediaLibrary: MediaItem[];
  imageWarnings?: string[];
};

const MAX_PREVIEW_CHARS = 1200;

function PreviewTextPlaceholder() {
  return (
    <p className="text-slate-400 italic">Apna post yahan likho…</p>
  );
}

function HashtagPlaceholder({ mode }: { mode: HashtagMode }) {
  const label =
    mode === "manual"
      ? "#your #hashtags #here"
      : mode === "auto"
        ? "#auto #hashtags #yahan"
        : "";

  if (!label) return null;

  return (
    <p className="mt-2 text-sm text-slate-300" aria-hidden>
      {label}
    </p>
  );
}

export const LinkedInPostPreview = memo(function LinkedInPostPreview({
  authorName,
  authorAvatar,
  body,
  hashtags,
  hashtagMode,
  images,
  token,
  mediaLibrary,
  imageWarnings = [],
}: Props) {
  const trimmedBody = body.trim();
  const hasBody = trimmedBody.length > 0;
  const isLong = trimmedBody.length > MAX_PREVIEW_CHARS;
  const previewText = isLong ? `${trimmedBody.slice(0, MAX_PREVIEW_CHARS)}…` : trimmedBody;
  const primaryImage = images[0];
  const showHashtagPlaceholder =
    hashtagMode !== "none" && hashtags.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0a66c2] text-sm font-semibold text-white">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-slate-900">
              {authorName}
            </p>
            <p className="text-xs text-slate-500">Just now · 🌐</p>
          </div>
        </div>

        <div
          className={`mt-3 text-sm leading-relaxed ${
            !hasBody && !primaryImage ? "min-h-[3.25rem]" : ""
          }`}
        >
          {hasBody ? (
            <>
              <p className="whitespace-pre-wrap break-words text-slate-800">{previewText}</p>
              {isLong && (
                <button type="button" className="mt-1 text-sm font-medium text-slate-500">
                  …more
                </button>
              )}
            </>
          ) : primaryImage ? (
            <p className="text-slate-400 italic">Image-only post</p>
          ) : (
            <PreviewTextPlaceholder />
          )}

          {hashtags.length > 0 ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">
              {hashtags.map((tag) => `#${tag}`).join(" ")}
            </p>
          ) : (
            showHashtagPlaceholder && <HashtagPlaceholder mode={hashtagMode} />
          )}
        </div>
      </div>

      {primaryImage && (
        <div className="border-t border-slate-100 bg-slate-50">
          <PostImage
            src={primaryImage}
            token={token}
            mediaLibrary={mediaLibrary}
            alt="LinkedIn post"
            className="max-h-[420px] w-full object-cover"
          />
          {images.length > 1 && (
            <p className="px-4 py-2 text-xs text-slate-500">
              +{images.length - 1} more image(s) — LinkedIn shows first image in feed preview
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↗ Repost</span>
        <span>➤ Send</span>
      </div>

      {imageWarnings.length > 0 && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-2">
          {imageWarnings.map((warning) => (
            <p key={warning} className="text-xs text-amber-800">
              ⚠ {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});
