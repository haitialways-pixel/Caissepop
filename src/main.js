import "./styles.css";
import { ARTICLES, CONTACT } from "./contact-info.js";
import { translations } from "./translations.js";
import { applyI18n, persistLang, readLang } from "./i18n.js";

const WA_NUMBER = CONTACT.waNumber;

function setLang(lang) {
  persistLang(lang);
  applyI18n(translations, lang);
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  renderTicker(lang);
}

function bindLang() {
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.setLang));
  });
}

function bindNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => {
    link.setAttribute("aria-current", "page");
  });

  const burger = document.querySelector("[data-burger]");
  const mobile = document.querySelector("[data-mobile-nav]");
  if (!burger || !mobile) return;

  const close = () => {
    mobile.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  burger.addEventListener("click", () => {
    const open = mobile.hidden;
    mobile.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  });

  mobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function bindHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function bindReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

function formPayload(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = data.subject || "CPCREDO";
  const body = [
    `Nom / Non: ${data.name || ""}`,
    `Téléphone / Telefòn: ${data.phone || ""}`,
    `Langue / Lang: ${data.language || ""}`,
    `Sujet / Sijè: ${subject}`,
    "",
    data.message || "",
  ].join("\n");
  return { subject, body, data };
}

function bindForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const note = form.querySelector("[data-form-note]");
  const langSelect = form.querySelector('[name="language"]');
  if (langSelect) langSelect.value = document.documentElement.dataset.lang || "fr";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const { subject, body } = formPayload(form);
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("CPCREDO — " + subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    if (note) note.hidden = false;
  });

  const waBtn = form.querySelector("[data-form-wa]");
  if (waBtn) {
    waBtn.addEventListener("click", () => {
      if (!form.reportValidity()) return;
      const { body } = formPayload(form);
      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(body)}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }
}

function bindArticle() {
  const root = document.querySelector("[data-article-root]");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const key = ARTICLES[slug];
  if (!key) {
    window.location.replace("./404.html");
    return;
  }
  const titleEl = root.querySelector("[data-article-title]");
  const dateEl = root.querySelector("[data-article-date]");
  const bodyEl = root.querySelector("[data-article-body]");
  if (titleEl) titleEl.dataset.i18n = `news.${key}t`;
  if (dateEl) dateEl.dataset.i18n = `news.${key}d`;
  if (bodyEl) {
    bodyEl.dataset.i18n = `news.${key}body`;
    bodyEl.dataset.i18nHtml = "true";
  }
  document.body.dataset.titleKey = `news.${key}pageTitle`;
}

const BUY_SPREAD = 0.5;
const SELL_SPREAD = 2.5;

function formatBrhRate(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString("fr-HT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTicker(lang) {
  const track = document.querySelector("[data-ticker]");
  if (!track) return;
  const items = translations[lang]?.home?.tickerItems || translations.fr.home.tickerItems;
  const pills = items
    .map(
      (text) =>
        `<a class="info-pill" href="./actualites.html">${text.replace(/</g, "")}</a>`
    )
    .join("");
  track.innerHTML = pills + pills;
}

async function loadBrhRate() {
  const root = document.querySelector("[data-rate-panel]");
  if (!root) return;
  const buyEl = root.querySelector("[data-brh-buy]");
  const sellEl = root.querySelector("[data-brh-sell]");
  const refEl = root.querySelector("[data-brh-ref]");
  const dateEl = root.querySelector("[data-brh-date]");
  const pending = translations[readLang()]?.home?.ratePending || "[À CONFIRMER]";
  const showPlaceholder = () => {
    if (buyEl) buyEl.textContent = pending;
    if (sellEl) sellEl.textContent = pending;
    if (refEl) refEl.textContent = pending;
    if (dateEl) dateEl.textContent = pending;
  };
  try {
    const res = await fetch("/api/brh-rate", { headers: { Accept: "application/json" } });
    const data = await res.json();
    const raw = Number(data?.reference || data?.rate);
    if (!data?.ok || !Number.isFinite(raw)) {
      showPlaceholder();
      return;
    }
    if (refEl) refEl.textContent = formatBrhRate(raw);
    if (buyEl) buyEl.textContent = formatBrhRate(raw + BUY_SPREAD);
    if (sellEl) sellEl.textContent = formatBrhRate(raw + SELL_SPREAD);
    if (dateEl) dateEl.textContent = data.date || pending;
  } catch {
    showPlaceholder();
  }
}

function bindRatePanel() {
  const openBtn = document.querySelector("[data-rate-open]");
  const panel = document.querySelector("[data-rate-panel]");
  const closeBtn = document.querySelector("[data-rate-close]");
  if (!openBtn || !panel) return;

  const close = () => {
    panel.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
  };
  const toggle = () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    openBtn.setAttribute("aria-expanded", String(willOpen));
  };

  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
  });
  document.addEventListener("click", (e) => {
    if (panel.hidden) return;
    if (panel.contains(e.target) || openBtn.contains(e.target)) return;
    close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function boot() {
  bindArticle();
  setLang(readLang());
  bindLang();
  bindNav();
  bindHeader();
  bindReveal();
  bindForm();
  bindRatePanel();
  loadBrhRate();
}

boot();
