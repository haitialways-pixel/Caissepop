import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { brhJsonResponse, fetchBrhReference } from "./src/brh-rate.js";

const root = dirname(fileURLToPath(import.meta.url));

function partials() {
  const load = (name) =>
    readFileSync(resolve(root, "src/partials", name), "utf8");
  return {
    name: "cpcredo-partials",
    transformIndexHtml(html) {
      return html
        .replaceAll("<!--HEADER-->", load("header.html"))
        .replaceAll("<!--FOOTER-->", load("footer.html"))
        .replaceAll("<!--FAB-->", load("fab.html"));
    },
  };
}

function brhDevApi() {
  return {
    name: "brh-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/api/brh-rate") return next();
        try {
          const data = await fetchBrhReference();
          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: true, ...data }));
        } catch (err) {
          console.error("[brh-rate]", err?.message || err);
          res.statusCode = 503;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [partials(), brhDevApi()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        apropos: resolve(root, "a-propos.html"),
        produits: resolve(root, "produits.html"),
        join: resolve(root, "devenir-societaire.html"),
        edu: resolve(root, "education-financiere.html"),
        news: resolve(root, "actualites.html"),
        article: resolve(root, "article.html"),
        contact: resolve(root, "contact.html"),
        legal: resolve(root, "mentions-legales.html"),
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
