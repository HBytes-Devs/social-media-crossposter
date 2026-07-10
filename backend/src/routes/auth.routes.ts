import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import * as passwordResetService from "../services/password-reset.service.js";
import { isRecaptchaConfigured } from "../services/recaptcha.service.js";
import { isEmailConfigured } from "../services/email.service.js";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { verifyRecaptcha } from "../services/recaptcha.service.js";

const router = Router();

router.get("/config", (_req, res) => {
  res.json({
    success: true,
    data: {
      recaptchaEnabled: isRecaptchaConfigured(),
      emailConfigured: isEmailConfigured(),
    },
  });
});

router.post("/register", async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

router.post("/login", async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);

  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

router.post("/forgot-password", async (req, res) => {
  const input = forgotPasswordSchema.parse(req.body);

  try {
    await verifyRecaptcha(input.recaptchaToken, "forgot_password");
  } catch {
    throw new AppError(400, "reCAPTCHA verification failed");
  }

  await passwordResetService.requestPasswordReset(input);

  res.json({
    success: true,
    message: "If an account exists for this email, a reset code has been sent.",
  });
});

router.post("/reset-password", async (req, res) => {
  const input = resetPasswordSchema.parse(req.body);
  await passwordResetService.resetPassword(input);

  res.json({
    success: true,
    message: "Password updated successfully. You can now log in.",
  });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const user = await authService.getProfile(req.userId);

  res.json({
    success: true,
    data: { user },
  });
});

export default router;
