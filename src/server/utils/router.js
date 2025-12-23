import { URLPattern } from "node:url";
import { sendJson } from "./http.js";

export class Router {
  #routes = [];

  add(method, pathname, handler) {
    const pattern = new URLPattern({ pathname });
    this.#routes.push({ method: method.toUpperCase(), pattern, handler });
  }

  async handle(req, res, context = {}) {
    const { method, url } = req;
    const matched = this.#routes.find(
      (route) => route.method === method && route.pattern.test(url),
    );

    if (!matched) {
      sendJson(res, 404, { error: "Not Found" });
      return;
    }

    const match = matched.pattern.exec(url);
    const params = match?.pathname?.groups ?? {};
    await matched.handler(req, res, { params, ...context });
  }
}
