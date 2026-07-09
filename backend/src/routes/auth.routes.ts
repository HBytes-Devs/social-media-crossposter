import { Router } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

const router = Router();

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
