import { resolveImageSrc } from "../lib/media";
import type { MediaItem } from "../types";

type Props = {
  src: string;
  token: string | null;
  mediaLibrary?: MediaItem[];
  alt?: string;
  className?: string;
};

export function PostImage({
  src,
  token,
  mediaLibrary = [],
  alt = "",
  className = "",
}: Props) {
  const resolved = resolveImageSrc(src, mediaLibrary, token);

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget;
        if (img.dataset.fallback === "1") return;
        img.dataset.fallback = "1";
        img.src = src;
      }}
    />
  );
}
