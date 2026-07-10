import { z } from "zod";
import { LANGUAGE_CODES } from "../services/hashtags.service.js";

const languageCodes = LANGUAGE_CODES as [string, ...string[]];

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

const scheduledForSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .transform((value) => new Date(value));

function validateScheduledFor(
  scheduledFor: Date | undefined,
  ctx: z.RefinementCtx,
  path: string[] = ["scheduledFor"],
) {
  if (!scheduledFor) return;

  const minTime = Date.now() + 60_000;
  if (scheduledFor.getTime() < minTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Scheduled time must be at least 1 minute in the future",
      path,
    });
  }
}

export const createPostSchema = postBaseSchema
  .extend({
    publish: z.boolean().default(false),
    scheduledFor: scheduledForSchema.optional(),
  })
  .superRefine((data, ctx) => {
    requireContentOrImage(data, ctx);
    if (data.publish && data.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot publish immediately and schedule at the same time",
        path: ["scheduledFor"],
      });
    }
    validateScheduledFor(data.scheduledFor, ctx);
  });

export const updatePostSchema = z
  .object({
    content: z.string().max(10000).optional(),
    title: z.string().max(300).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    hashtagMode: z.enum(["manual", "auto", "none"]).optional(),
    hashtags: z.array(z.string().min(1).max(50)).max(30).optional(),
    language: z.enum(languageCodes).optional(),
    targets: z.array(postTargetSchema).min(1).optional(),
    scheduledFor: scheduledForSchema.nullable().optional(),
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
    if (data.scheduledFor) {
      validateScheduledFor(data.scheduledFor, ctx);
    }
  });

export const schedulePostSchema = z
  .object({
    scheduledFor: scheduledForSchema,
  })
  .superRefine((data, ctx) => {
    validateScheduledFor(data.scheduledFor, ctx);
  });

export const calendarQuerySchema = z.object({
  from: scheduledForSchema,
  to: scheduledForSchema,
}).superRefine((data, ctx) => {
  if (data.from >= data.to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "`from` must be before `to`",
      path: ["from"],
    });
  }
  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
  if (data.to.getTime() - data.from.getTime() > maxRangeMs) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Date range cannot exceed 366 days",
      path: ["to"],
    });
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
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;

export function toHashtagModeEnum(mode: "manual" | "auto" | "none") {
  return mode.toUpperCase() as "MANUAL" | "AUTO" | "NONE";
}

export function fromHashtagModeEnum(mode: string): "manual" | "auto" | "none" {
  return mode.toLowerCase() as "manual" | "auto" | "none";
}
