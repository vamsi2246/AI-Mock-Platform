import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import logger from "./utils/logger.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

const app = express();

// ─── Security ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Parsing ──────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────
app.use("/api", apiLimiter);

// ─── Request Logging ──────────────────────────────
app.use((req, _res, next) => {
  if (req.path !== "/health") {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  }
  next();
});

// ─── Health Check ─────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/webhook", webhookRoutes);

// ─── Static file serving for uploads ──────────────
app.use("/uploads", express.static(env.UPLOAD_DIR));

// ─── Error Handling ───────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT}`, {
    env: env.NODE_ENV,
    port: env.PORT,
  });
});

export default app;
