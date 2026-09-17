import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const chrome =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const out = resolve("preview");
mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--hide-scrollbars", "--no-sandbox"],
});

async function shot(name, url, { width, height, fullPage = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector(".site-header");
  await page.waitForSelector("h1");
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: resolve(out, name),
    fullPage,
    type: "jpeg",
    quality: 82,
  });
  await page.close();
  console.log("wrote", name);
}

const base = "http://127.0.0.1:5173";

await shot("home-desktop-fr.jpg", `${base}/?lang=fr`, {
  width: 1440,
  height: 900,
  fullPage: true,
});
await shot("home-desktop-ht.jpg", `${base}/?lang=ht`, {
  width: 1440,
  height: 900,
  fullPage: true,
});
await shot("home-mobile-fr.jpg", `${base}/?lang=fr`, {
  width: 390,
  height: 844,
  fullPage: true,
});
await shot("home-hero-desktop.jpg", `${base}/?lang=fr`, {
  width: 1440,
  height: 900,
});
await shot("home-hero-mobile.jpg", `${base}/?lang=fr`, {
  width: 390,
  height: 844,
});
await shot("produits-desktop-fr.jpg", `${base}/produits.html?lang=fr`, {
  width: 1440,
  height: 900,
  fullPage: true,
});

await browser.close();
