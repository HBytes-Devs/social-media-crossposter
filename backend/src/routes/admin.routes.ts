import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { requireRole, type AdminAuthRequest } from "../middleware/role.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as adminService from "../services/admin.service.js";
import {
  acceptInviteSchema,
  adminUpdateUserSchema,
  createInviteSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validators/admin.validator.js";

const router = Router();

router.post("/invites/accept", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }
  const input = acceptInviteSchema.parse(req.body);
  const result = await adminService.acceptInvite(req.userId, input.token);
  res.json({ success: true, data: result, message: "Invite accepted" });
});

router.use(authenticate, requireRole("ADMIN", "SUPER_ADMIN"));

router.get("/users", async (req: AdminAuthRequest, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const users = await adminService.listUsers(q);
  res.json({ success: true, data: users });
});

router.patch("/users/:id", async (req: AdminAuthRequest, res) => {
  if (!req.userRole) {
    throw new AppError(403, "Admin access required");
  }
  const input = adminUpdateUserSchema.parse(req.body);
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await adminService.updateUser(req.userRole, userId, input);
  res.json({ success: true, data: user, message: "User updated" });
});

router.get("/organizations", async (_req, res) => {
  const orgs = await adminService.listOrganizations();
  res.json({ success: true, data: orgs });
});

router.post("/organizations", async (req, res) => {
  const input = createOrganizationSchema.parse(req.body);
  const org = await adminService.createOrganization(input);
  res.status(201).json({ success: true, data: org, message: "Organization created" });
});

router.patch("/organizations/:id", async (req, res) => {
  const input = updateOrganizationSchema.parse(req.body);
  const orgId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const org = await adminService.updateOrganization(orgId, input);
  res.json({ success: true, data: org, message: "Organization updated" });
});

router.post("/organizations/:id/invites", async (req, res) => {
  const input = createInviteSchema.parse(req.body);
  const orgId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const invite = await adminService.createInvite(orgId, input.email);
  res.status(201).json({
    success: true,
    data: invite,
    message: "Invite created — share the token with the user",
  });
});

export default router;
