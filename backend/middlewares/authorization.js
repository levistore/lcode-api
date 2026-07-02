import { error } from "../utils/response.js";

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(res, "Insufficient permissions", 403);
    }

    next();
  };
}
