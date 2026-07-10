import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import * as aiService from "../services/ai-compose.service.js";
import {
  correctTextSchema,
  improvePostSchema,
  localizeAiSchema,
  smartHashtagsSchema,
  suggestCompletionSchema,
} from "../validators/ai.validator.js";

const router = Router();

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  res.json({ success: true, data: await aiService.getAiStatus(req.userId!) });
});

router.post("/improve", authenticate, async (req: AuthRequest, res) => {
  const input = improvePostSchema.parse(req.body);
  const result = await aiService.improvePostContent(req.userId!, input);
  res.json({ success: true, data: result });
});

router.post("/hashtags", authenticate, async (req: AuthRequest, res) => {
  const input = smartHashtagsSchema.parse(req.body);
  const result = await aiService.generateSmartHashtags(req.userId!, input);
  res.json({ success: true, data: result });
});

router.post("/localize", authenticate, async (req: AuthRequest, res) => {
  const input = localizeAiSchema.parse(req.body);
  const result = await aiService.localizeWithAi(req.userId!, input);
  res.json({ success: true, data: result });
});

router.post("/suggest", authenticate, async (req: AuthRequest, res) => {
  const input = suggestCompletionSchema.parse(req.body);
  const result = await aiService.suggestCompletion(req.userId!, input);
  res.json({ success: true, data: result });
});

router.post("/correct", authenticate, async (req: AuthRequest, res) => {
  const input = correctTextSchema.parse(req.body);
  const result = await aiService.correctText(req.userId!, input);
  res.json({ success: true, data: result });
});

export default router;
