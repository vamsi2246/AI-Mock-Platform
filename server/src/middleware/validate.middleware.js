import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validate = (validations) => {
  return async (req, _res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => {
      if (err.type === "field") {
        return { field: err.path, message: err.msg };
      }
      return { message: err.msg };
    });

    next(new ApiError(422, JSON.stringify(extractedErrors)));
  };
};
