import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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

export default defineConfig({
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        apropos: resolve(root, "a-propos.html"),
        produits: resolve(root, "produits.html"),
        join: resolve(root, "devenir-societaire.html"),
        edu: resolve(root, "education-financiere.html"),
        news: resolve(root, "actualites.html"),
        contact: resolve(root, "contact.html"),
        legal: resolve(root, "mentions-legales.html"),
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
