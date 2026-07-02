import { Router } from "express";
import { body } from "express-validator";
import {
  signup,
  login,
  refreshToken,
  logout,
  me,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  validate([
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("firstName").optional().trim().isLength({ max: 50 }),
    body("lastName").optional().trim().isLength({ max: 50 }),
  ]),
  signup,
);

router.post(
  "/login",
  authLimiter,
  validate([
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  login,
);

router.post(
  "/refresh",
  validate([
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  ]),
  refreshToken,
);

router.post("/logout", authenticate, logout);

router.get("/me", authenticate, me);

export default router;
