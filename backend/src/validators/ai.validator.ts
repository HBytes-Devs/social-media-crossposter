import { z } from "zod";

export const improvePostSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().optional(),
  tone: z.enum(["professional", "casual", "friendly"]).optional(),
  platform: z.string().optional(),
});

export const smartHashtagsSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().optional(),
  max: z.coerce.number().int().min(1).max(15).optional(),
});

export const localizeAiSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().min(1),
});

export const suggestCompletionSchema = z.object({
  content: z.string().min(3).max(10000),
  language: z.string().optional(),
});

export const correctTextSchema = z.object({
  content: z.string().min(1).max(10000),
  language: z.string().optional(),
});
