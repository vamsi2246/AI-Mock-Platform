import { Router } from "express";
import { body } from "express-validator";
import {
  startInterview,
  endInterview,
  saveMessage,
  getHistory,
  getSession,
  deleteSession,
  generateReport,
  getReport,
} from "../controllers/interview.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post(
  "/start",
  authenticate,
  validate([
    body("type")
      .isIn(["BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "HR"])
      .withMessage("Type must be BEHAVIORAL, TECHNICAL, SYSTEM_DESIGN, or HR"),
    body("difficulty")
      .optional()
      .isIn(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    body("duration").optional().isInt({ min: 300, max: 7200 }),
  ]),
  startInterview,
);

router.post(
  "/end",
  authenticate,
  validate([
    body("sessionId").notEmpty().withMessage("Session ID is required"),
  ]),
  endInterview,
);

router.post(
  "/message",
  authenticate,
  validate([
    body("sessionId").notEmpty(),
    body("role").isIn(["ASSISTANT", "USER"]),
    body("content").notEmpty(),
  ]),
  saveMessage,
);

router.get("/history", authenticate, getHistory);

router.get("/:id", authenticate, getSession);

router.delete("/:id", authenticate, deleteSession);

router.post("/:id/report", authenticate, generateReport);

router.get("/:id/report", authenticate, getReport);

export default router;
