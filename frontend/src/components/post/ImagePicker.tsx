import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
  uploadError?: string | null;
  imageWarnings?: string[];
  onUpload: (files: FileList) => void;
  onToggle: (url: string) => void;
  onRemove: (url: string) => void;
};

export function ImagePicker({
  images,
  mediaLibrary,
  token,
  uploading,
  uploadError,
  imageWarnings = [],
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
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" alignItems={{ sm: "center" }} gap={1.5}>
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
        <Button variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}>
          Upload images
        </Button>
        <Typography variant="caption" color="text.secondary">
          LinkedIn: min {LINKEDIN_IMAGE.minWidth}×{LINKEDIN_IMAGE.minHeight}px · max 8MB · ratio 4:5 to 1.91:1
        </Typography>
      </Stack>

      {uploadError && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {uploadError}
        </Alert>
      )}

      {imageWarnings.length > 0 && (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          <Stack spacing={0.5}>
            {imageWarnings.map((warning) => (
              <Typography key={warning} variant="caption" component="div">
                {warning}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      {uploading && (
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20" />
          ))}
        </Stack>
      )}

      {images.length > 0 && (
        <BoxSection title={`Selected (${images.length})`}>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {images.map((url) => {
              const meta = mediaLibrary.find((m) => m.url === url);

              return (
                <BoxImage
                  key={url}
                  url={url}
                  token={token}
                  mediaLibrary={mediaLibrary}
                  meta={meta}
                  onRemove={() => onRemove(url)}
                />
              );
            })}
          </Stack>
        </BoxSection>
      )}

      {libraryOnly.length > 0 && (
        <BoxSection title="Media library">
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
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
          </Stack>
        </BoxSection>
      )}
    </Stack>
  );
}

function BoxSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 0.6 }}
      >
        {title}
      </Typography>
      {children}
    </div>
  );
}

function BoxImage({
  url,
  token,
  mediaLibrary,
  meta,
  onRemove,
}: {
  url: string;
  token: string | null;
  mediaLibrary: MediaItem[];
  meta?: MediaItem;
  onRemove: () => void;
}) {
  return (
    <div className="group relative">
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
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
