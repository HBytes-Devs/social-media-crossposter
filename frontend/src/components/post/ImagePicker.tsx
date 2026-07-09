import { useRef } from "react";
import { PostImage } from "../PostImage";
import type { MediaItem } from "../../types";
import { Button } from "../ui/Button";

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
}: Props) {  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
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
        <span className="text-xs text-slate-500">Optional — post bina image ke bhi ho sakti hai</span>
      </div>

      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Selected ({images.length})
          </p>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="group relative">
                <PostImage
                  src={url}
                  token={token}
                  mediaLibrary={mediaLibrary}
                  alt="Selected"
                  className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
                />                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mediaLibrary.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Media library
          </p>
          <div className="flex flex-wrap gap-3">
            {mediaLibrary.map((item) => {
              const selected = images.includes(item.url);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.url)}
                  className={`relative overflow-hidden rounded-lg border-2 transition ${
                    selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-slate-700"
                  }`}
                >
                  <PostImage
                    src={item.url}
                    token={token}
                    mediaLibrary={mediaLibrary}
                    alt={item.fileName}
                    className="h-20 w-20 object-cover"
                  />                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-600/40 text-lg text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
