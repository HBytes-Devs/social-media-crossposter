import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import * as aiCredentialsService from "../services/ai-credentials.service.js";
import {
  createAiCredentialSchema,
  updateAiCredentialSchema,
} from "../validators/ai-credentials.validator.js";

const router = Router();

router.get("/ai-keys", authenticate, async (req: AuthRequest, res) => {
  const credentials = await aiCredentialsService.listAiCredentials(req.userId!);
  res.json({ success: true, data: { credentials } });
});

router.get("/ai-providers", authenticate, async (_req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      providers: [
        {
          id: "MINIMAX",
          label: "MiniMax",
          ...aiCredentialsService.getProviderDefaults("MINIMAX"),
        },
        {
          id: "OPENAI",
          label: "OpenAI (ChatGPT)",
          ...aiCredentialsService.getProviderDefaults("OPENAI"),
        },
        {
          id: "ANTHROPIC",
          label: "Anthropic (Claude)",
          ...aiCredentialsService.getProviderDefaults("ANTHROPIC"),
        },
        {
          id: "CUSTOM",
          label: "Custom (OpenAI-compatible)",
          ...aiCredentialsService.getProviderDefaults("CUSTOM"),
        },
      ],
    },
  });
});

router.post("/ai-keys", authenticate, async (req: AuthRequest, res) => {
  const input = createAiCredentialSchema.parse(req.body);
  const credential = await aiCredentialsService.createAiCredential(req.userId!, input);
  res.status(201).json({ success: true, data: { credential } });
});

router.patch("/ai-keys/:id", authenticate, async (req: AuthRequest, res) => {
  const input = updateAiCredentialSchema.parse(req.body);
  const credential = await aiCredentialsService.updateAiCredential(
    req.userId!,
    String(req.params.id),
    input,
  );
  res.json({ success: true, data: { credential } });
});

router.delete("/ai-keys/:id", authenticate, async (req: AuthRequest, res) => {
  await aiCredentialsService.deleteAiCredential(req.userId!, String(req.params.id));
  res.json({ success: true, message: "AI key removed" });
});

export default router;
