import { z } from "zod";

export const opsUpdateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  subscriptionTier: z.enum(["FREE", "MEDIUM", "PREMIUM"]).optional(),
  subscriptionStatus: z
    .enum(["ACTIVE", "PAST_DUE", "CANCELED", "TRIALING", "INCOMPLETE"])
    .optional(),
  organizationId: z.string().cuid().nullable().optional(),
  isSuspended: z.boolean().optional(),
});

export const opsCreateIssueSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  priority: z.enum(["low", "medium", "high"]).optional(),
  userId: z.string().cuid().optional(),
});

export const opsUpdateIssueSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().trim().min(1).max(5000).optional(),
});

export type OpsUpdateUserInput = z.infer<typeof opsUpdateUserSchema>;
export type OpsCreateIssueInput = z.infer<typeof opsCreateIssueSchema>;
export type OpsUpdateIssueInput = z.infer<typeof opsUpdateIssueSchema>;
