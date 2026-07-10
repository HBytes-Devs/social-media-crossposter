import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
  recaptchaToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
  recaptchaToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
