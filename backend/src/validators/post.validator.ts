import { z } from "zod";

const languageCodes = ["en", "ur", "roman-ur", "hi", "ar"] as const;

export const postTargetSchema = z.object({
  socialAccountId: z.string().min(1),
  customContent: z.string().max(3000).optional(),
  subreddit: z
    .string()
    .max(100)
    .optional()
    .transform((v) => v?.trim().replace(/^r\//i, "") || undefined),
});

const postBaseSchema = z.object({
  content: z.string().max(10000).default(""),
  title: z.string().max(300).optional(),
  images: z.array(z.string().url()).max(10).default([]),
  hashtagMode: z.enum(["manual", "auto", "none"]).default("auto"),
  hashtags: z
    .array(z.string().min(1).max(50))
    .max(30)
    .default([])
    .transform((tags) =>
      tags.map((t) => t.trim().replace(/^#+/, "")).filter(Boolean),
    ),
  language: z.enum(languageCodes).default("en"),
  targets: z.array(postTargetSchema).min(1, "At least one platform target required"),
});

function requireContentOrImage<T extends { content: string; images: string[] }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (!data.content.trim() && data.images.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content or at least one image is required",
      path: ["content"],
    });
  }
}

export const createPostSchema = postBaseSchema
  .extend({
    publish: z.boolean().default(false),
  })
  .superRefine(requireContentOrImage);

export const updatePostSchema = z
  .object({
    content: z.string().max(10000).optional(),
    title: z.string().max(300).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    hashtagMode: z.enum(["manual", "auto", "none"]).optional(),
    hashtags: z.array(z.string().min(1).max(50)).max(30).optional(),
    language: z.enum(languageCodes).optional(),
    targets: z.array(postTargetSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.content !== undefined || data.images !== undefined) {
      requireContentOrImage(
        {
          content: data.content ?? "",
          images: data.images ?? [],
        },
        ctx,
      );
    }
  });

export const previewPostSchema = z
  .object({
    content: z.string().max(10000).default(""),
    images: z.array(z.string().url()).max(10).default([]),
    hashtagMode: z.enum(["manual", "auto", "none"]).default("auto"),
    hashtags: z.array(z.string().min(1).max(50)).max(30).default([]),
    language: z.enum(languageCodes).default("en"),
  })
  .superRefine(requireContentOrImage);

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PreviewPostInput = z.infer<typeof previewPostSchema>;

export function toHashtagModeEnum(mode: "manual" | "auto" | "none") {
  return mode.toUpperCase() as "MANUAL" | "AUTO" | "NONE";
}

export function fromHashtagModeEnum(mode: string): "manual" | "auto" | "none" {
  return mode.toLowerCase() as "manual" | "auto" | "none";
}
