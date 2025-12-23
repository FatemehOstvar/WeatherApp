import http from "node:http";
import { cityRouter } from "./routes/cityRoutes.js";
import { userCityRouter } from "./routes/userCityRoutes.js";
import { applyCors, sendJson } from "./utils/http.js";

export function createApp() {
  return http.createServer(async (req, res) => {
    if (applyCors(req, res)) return;

    try {
      const context = {};
      if (req.url.startsWith("/api/cities")) {
        await cityRouter.handle(req, res, context);
      } else if (req.url.startsWith("/api/user-cities")) {
        await userCityRouter.handle(req, res, context);
      } else {
        sendJson(res, 404, { error: "Not Found" });
      }
    } catch (error) {
      sendJson(res, 500, { error: "Internal Server Error", detail: error.message });
    }
  });
}
