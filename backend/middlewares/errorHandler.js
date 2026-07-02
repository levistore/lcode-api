import logger from "../utils/logger.js";
import { error } from "../utils/response.js";

export function errorHandler(err, req, res, _next) {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "SyntaxError" && err.status === 400) {
    return error(res, "Invalid JSON body", 400);
  }

  if (err.type === "entity.too.large") {
    return error(res, "Request body too large", 413);
  }

  return error(
    res,
    process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    err.status || 500
  );
}

export function notFoundHandler(req, res) {
  return error(res, `Route ${req.method} ${req.path} not found`, 404);
}
