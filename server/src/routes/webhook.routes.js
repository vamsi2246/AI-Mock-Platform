import { Router } from "express";
import {
  handleVapiWebhook,
  handleCustomLLM,
} from "../controllers/webhook.controller.js";

const router = Router();

router.post("/vapi", handleVapiWebhook);
router.post("/llm", handleCustomLLM);

export default router;
