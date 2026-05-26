import { ZodError } from "zod";
import { AppError } from "../utils/error.js";

export function validate({ query, params } = {}) {
  return (req, _res, next) => {
    try {
      if (query) {
        req.validatedQuery = query.parse(req.query);
      }

      if (params) {
        req.validatedParams = params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(400, "Validation error", {
            issues: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          })
        );
        return;
      }

      next(error);
    }
  };
}
