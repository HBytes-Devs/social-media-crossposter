import { useMemo, useRef } from "react";
import { PostImage } from "../PostImage";
import type { MediaItem } from "../../types";
import { dedupeMediaLibrary, LINKEDIN_IMAGE } from "../../lib/linkedin-image";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

type Props = {
  images: string[];
  mediaLibrary: MediaItem[];
  token: string | null;
  uploading: boolean;
  onUpload: (files: FileList) => void;
  onToggle: (url: string) => void;
  onRemove: (url: string) => void;
};

export function ImagePicker({
  images,
  mediaLibrary,
  token,
  uploading,
  onUpload,
  onToggle,
  onRemove,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const libraryOnly = useMemo(() => {
    const deduped = dedupeMediaLibrary(mediaLibrary);
    return deduped.filter((item) => !images.includes(item.url));
  }, [mediaLibrary, images]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          Upload images
        </Button>
        <span className="text-xs text-slate-500">
          LinkedIn: min {LINKEDIN_IMAGE.minWidth}×{LINKEDIN_IMAGE.minHeight}px · max 8MB · ratio 4:5 to 1.91:1
        </span>
      </div>

      {uploading && (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20" />
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Selected ({images.length})
          </p>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => {
              const meta = mediaLibrary.find((m) => m.url === url);

              return (
                <div key={url} className="group relative">
                  <PostImage
                    src={url}
                    token={token}
                    mediaLibrary={mediaLibrary}
                    alt="Selected"
                    className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
                  />
                  {meta?.width && meta?.height && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">
                      {meta.width}×{meta.height}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(url)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {libraryOnly.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Media library
          </p>
          <div className="flex flex-wrap gap-3">
            {libraryOnly.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.url)}
                className="relative overflow-hidden rounded-lg border-2 border-slate-700 transition hover:border-brand-500"
              >
                <PostImage
                  src={item.url}
                  token={token}
                  mediaLibrary={mediaLibrary}
                  alt={item.fileName}
                  className="h-20 w-20 object-cover"
                />
                {item.width && item.height && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
                    {item.width}×{item.height}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
