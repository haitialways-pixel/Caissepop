import { brhJsonResponse, fetchBrhReference } from "./brh-rate.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/brh-rate") {
      try {
        const data = await fetchBrhReference();
        return brhJsonResponse({ ok: true, ...data });
      } catch {
        return brhJsonResponse({ ok: false }, 503);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
