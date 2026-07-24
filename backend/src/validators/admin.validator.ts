import { z } from "zod";

export const adminUpdateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  subscriptionTier: z.enum(["FREE", "MEDIUM", "PREMIUM"]).optional(),
  subscriptionStatus: z
    .enum(["ACTIVE", "PAST_DUE", "CANCELED", "TRIALING", "INCOMPLETE"])
    .optional(),
  organizationId: z.string().cuid().nullable().optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  subscriptionTier: z.enum(["FREE", "MEDIUM", "PREMIUM"]).optional(),
  subscriptionStatus: z
    .enum(["ACTIVE", "PAST_DUE", "CANCELED", "TRIALING", "INCOMPLETE"])
    .optional(),
  seatLimit: z.number().int().min(1).max(10_000).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  subscriptionTier: z.enum(["FREE", "MEDIUM", "PREMIUM"]).optional(),
  subscriptionStatus: z
    .enum(["ACTIVE", "PAST_DUE", "CANCELED", "TRIALING", "INCOMPLETE"])
    .optional(),
  seatLimit: z.number().int().min(1).max(10_000).optional(),
});

export const createInviteSchema = z.object({
  email: z.string().email(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
