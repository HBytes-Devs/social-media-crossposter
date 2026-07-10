/** LinkedIn single-image post guidelines (feed image posts) */

export const LINKEDIN_IMAGE = {
  minWidth: 552,
  minHeight: 276,
  maxWidth: 7680,
  maxHeight: 4320,
  maxBytes: 8 * 1024 * 1024,
  minAspect: 0.8, // 4:5 portrait
  maxAspect: 1.91, // landscape
  recommended: [
    { width: 1200, height: 627, label: "1200×627 (landscape)" },
    { width: 1200, height: 1200, label: "1200×1200 (square)" },
    { width: 1080, height: 1080, label: "1080×1080 (square)" },
  ],
  optimizeWidth: 1200,
} as const;

export type LinkedInImageValidation = {
  valid: boolean;
  error?: string;
  warning?: string;
  width: number;
  height: number;
};

export function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };

    img.src = url;
  });
}

function isNearRecommended(width: number, height: number): boolean {
  return LINKEDIN_IMAGE.recommended.some((rec) => {
    const wDiff = Math.abs(width - rec.width) / rec.width;
    const hDiff = Math.abs(height - rec.height) / rec.height;
    return wDiff <= 0.05 && hDiff <= 0.05;
  });
}

export function validateLinkedInImage(
  file: File,
  width: number,
  height: number,
): LinkedInImageValidation {
  const aspect = width / height;

  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    return {
      valid: false,
      width,
      height,
      error: `${file.name}: Only JPEG, PNG, or WebP allowed for LinkedIn`,
    };
  }

  if (file.size > LINKEDIN_IMAGE.maxBytes) {
    return {
      valid: false,
      width,
      height,
      error: `${file.name}: Max file size is 8 MB for LinkedIn`,
    };
  }

  if (width < LINKEDIN_IMAGE.minWidth || height < LINKEDIN_IMAGE.minHeight) {
    return {
      valid: false,
      width,
      height,
      error: `${file.name}: Too small (${width}×${height}). Minimum ${LINKEDIN_IMAGE.minWidth}×${LINKEDIN_IMAGE.minHeight}px`,
    };
  }

  if (width > LINKEDIN_IMAGE.maxWidth || height > LINKEDIN_IMAGE.maxHeight) {
    return {
      valid: false,
      width,
      height,
      error: `${file.name}: Too large (${width}×${height}). LinkedIn max ${LINKEDIN_IMAGE.maxWidth}×${LINKEDIN_IMAGE.maxHeight}px`,
    };
  }

  if (aspect < LINKEDIN_IMAGE.minAspect || aspect > LINKEDIN_IMAGE.maxAspect) {
    return {
      valid: false,
      width,
      height,
      error: `${file.name}: Aspect ratio ${aspect.toFixed(2)} not valid. Use between 4:5 (0.8) and 1.91:1`,
    };
  }

  if (!isNearRecommended(width, height)) {
    return {
      valid: true,
      width,
      height,
      warning: `${file.name}: ${width}×${height}px — recommended 1200×627 (landscape) or 1200×1200 (square). Will be auto-optimized on upload.`,
    };
  }

  return { valid: true, width, height };
}

export async function validateLinkedInImageFiles(
  files: File[],
): Promise<{ validFiles: File[]; errors: string[]; warnings: string[] }> {
  const validFiles: File[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    try {
      const { width, height } = await readImageDimensions(file);
      const result = validateLinkedInImage(file, width, height);

      if (!result.valid) {
        errors.push(result.error!);
        continue;
      }

      if (result.warning) {
        warnings.push(result.warning);
      }

      validFiles.push(file);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Invalid image: ${file.name}`);
    }
  }

  return { validFiles, errors, warnings };
}

export function normalizeFileStem(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s*-\s*copy\s*$/i, "")
    .trim()
    .toLowerCase();
}

export function mediaDedupeKey(item: {
  width?: number | null;
  height?: number | null;
  sizeBytes?: number;
  fileName: string;
}): string {
  const stem = normalizeFileStem(item.fileName);
  return `${item.width ?? 0}x${item.height ?? 0}:${stem}`;
}

export function dedupeMediaByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export function dedupeMediaLibrary<
  T extends {
    id: string;
    url: string;
    width?: number | null;
    height?: number | null;
    sizeBytes?: number;
    fileName: string;
    createdAt?: string;
  },
>(items: T[]): T[] {
  const byKey = new Map<string, T>();

  for (const item of items) {
    const key = mediaDedupeKey(item);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, item);
      continue;
    }

    const itemTime = item.createdAt ? Date.parse(item.createdAt) : 0;
    const existingTime = existing.createdAt ? Date.parse(existing.createdAt) : 0;

    if (itemTime >= existingTime) {
      byKey.set(key, item);
    }
  }

  const sorted = Array.from(byKey.values()).sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });

  return dedupeByPixelFingerprint(sorted);
}

function dedupeByPixelFingerprint<
  T extends {
    width?: number | null;
    height?: number | null;
    sizeBytes?: number;
  },
>(items: T[]): T[] {
  const result: T[] = [];

  for (const item of items) {
    const duplicate = result.find(
      (existing) =>
        existing.width === item.width &&
        existing.height === item.height &&
        existing.sizeBytes === item.sizeBytes &&
        item.sizeBytes != null &&
        item.sizeBytes > 0,
    );

    if (!duplicate) {
      result.push(item);
    }
  }

  return result;
}
