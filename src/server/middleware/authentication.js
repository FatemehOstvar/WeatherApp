import { sendJson } from "../utils/http.js";

export function requireAuth(handler) {
  return async (req, res, context = {}) => {
    const userId = req.headers["x-user-id"] || req.headers["X-User-Id"];
    const authHeader = req.headers["authorization"];
    const bearerId = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const resolvedUserId = (userId ?? bearerId)?.toString().trim();

    if (!resolvedUserId) {
      sendJson(res, 401, { error: "Authentication required." });
      return;
    }

    const userContext = { id: resolvedUserId };
    await handler(req, res, { ...context, user: userContext });
  };
}
