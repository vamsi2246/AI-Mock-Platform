import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (_req, _res, next) => {
  next(ApiError.notFound("Route not found"));
};
