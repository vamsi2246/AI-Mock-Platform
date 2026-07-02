import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token is required");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized("Access token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid access token"));
    } else {
      next(error);
    }
  }
};
