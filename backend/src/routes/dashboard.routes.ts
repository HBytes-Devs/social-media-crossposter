import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as dashboardService from "../services/dashboard.service.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const data = await dashboardService.getDashboard(req.userId);
  res.json({ success: true, data });
});

export default router;
