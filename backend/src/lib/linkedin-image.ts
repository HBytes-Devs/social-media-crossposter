import { AppError } from "../middleware/error.middleware.js";

export const LINKEDIN_IMAGE = {
  minWidth: 552,
  minHeight: 276,
  maxWidth: 7680,
  maxHeight: 4320,
  maxBytes: 8 * 1024 * 1024,
  minAspect: 0.8,
  maxAspect: 1.91,
  optimizeWidth: 1200,
} as const;

export function validateLinkedInDimensions(
  width: number,
  height: number,
  fileName: string,
): void {
  const aspect = width / height;

  if (width < LINKEDIN_IMAGE.minWidth || height < LINKEDIN_IMAGE.minHeight) {
    throw new AppError(
      400,
      `${fileName}: Image too small (${width}×${height}). LinkedIn minimum is ${LINKEDIN_IMAGE.minWidth}×${LINKEDIN_IMAGE.minHeight}px`,
    );
  }

  if (width > LINKEDIN_IMAGE.maxWidth || height > LINKEDIN_IMAGE.maxHeight) {
    throw new AppError(
      400,
      `${fileName}: Image too large (${width}×${height}). LinkedIn maximum is ${LINKEDIN_IMAGE.maxWidth}×${LINKEDIN_IMAGE.maxHeight}px`,
    );
  }

  if (aspect < LINKEDIN_IMAGE.minAspect || aspect > LINKEDIN_IMAGE.maxAspect) {
    throw new AppError(
      400,
      `${fileName}: Invalid aspect ratio ${aspect.toFixed(2)}. LinkedIn requires between 4:5 and 1.91:1`,
    );
  }
}
