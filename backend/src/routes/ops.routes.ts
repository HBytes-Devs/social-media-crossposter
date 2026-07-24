import { Router } from "express";
import type { PostStatus, SupportIssueStatus } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole, type AdminAuthRequest } from "../middleware/role.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as opsService from "../services/ops.service.js";
import {
  opsCreateIssueSchema,
  opsUpdateIssueSchema,
  opsUpdateUserSchema,
} from "../validators/ops.validator.js";

const router = Router();

router.use(authenticate, requireRole("SUPER_ADMIN"));

router.get("/overview", async (_req, res) => {
  const data = await opsService.getOverview();
  res.json({ success: true, data });
});

router.get("/users", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const data = await opsService.listOpsUsers(q);
  res.json({ success: true, data });
});

router.patch("/users/:id", async (req: AdminAuthRequest, res) => {
  if (!req.userId || !req.userRole) {
    throw new AppError(403, "Super Admin access required");
  }
  const input = opsUpdateUserSchema.parse(req.body);
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const data = await opsService.updateOpsUser(req.userId, req.userRole, userId, input);
  res.json({ success: true, data, message: "User updated" });
});

router.get("/subscriptions", async (_req, res) => {
  const data = await opsService.getSubscriptions();
  res.json({ success: true, data });
});

router.get("/earnings", async (_req, res) => {
  const data = await opsService.getEarnings();
  res.json({ success: true, data });
});

router.get("/usage", async (req, res) => {
  const data = await opsService.getUsage({
    userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
    from: typeof req.query.from === "string" ? req.query.from : undefined,
    to: typeof req.query.to === "string" ? req.query.to : undefined,
  });
  res.json({ success: true, data });
});

router.get("/posts", async (req, res) => {
  const status =
    typeof req.query.status === "string" ? (req.query.status as PostStatus) : undefined;
  const limit =
    typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : undefined;
  const data = await opsService.listOpsPosts({
    userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
    status,
    q: typeof req.query.q === "string" ? req.query.q : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
  });
  res.json({ success: true, data });
});

router.get("/errors", async (req, res) => {
  const limit =
    typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : 100;
  const data = await opsService.listErrors(Number.isFinite(limit) ? limit : 100);
  res.json({ success: true, data });
});

router.get("/issues", async (req, res) => {
  const status =
    typeof req.query.status === "string"
      ? (req.query.status as SupportIssueStatus)
      : undefined;
  const data = await opsService.listIssues(status);
  res.json({ success: true, data });
});

router.post("/issues", async (req: AdminAuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");
  const input = opsCreateIssueSchema.parse(req.body);
  const data = await opsService.createIssue(req.userId, input);
  res.status(201).json({ success: true, data, message: "Issue created" });
});

router.patch("/issues/:id", async (req, res) => {
  const input = opsUpdateIssueSchema.parse(req.body);
  const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const data = await opsService.updateIssue(issueId, input);
  res.json({ success: true, data, message: "Issue updated" });
});

export default router;
