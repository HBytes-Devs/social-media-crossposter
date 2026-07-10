import { z } from "zod";

export const AI_PROVIDERS = ["MINIMAX", "OPENAI", "ANTHROPIC", "CUSTOM"] as const;

export const createAiCredentialSchema = z.object({
  name: z.string().trim().min(1).max(64),
  provider: z.enum(AI_PROVIDERS),
  apiKey: z.string().trim().min(8).max(500),
  baseUrl: z.string().url().optional().nullable(),
  model: z.string().trim().min(1).max(128).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const updateAiCredentialSchema = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  apiKey: z.string().trim().min(8).max(500).optional(),
  baseUrl: z.string().url().optional().nullable(),
  model: z.string().trim().min(1).max(128).optional().nullable(),
  isDefault: z.boolean().optional(),
});
