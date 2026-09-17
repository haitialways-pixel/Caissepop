import "./styles.css";
import { translations } from "./translations.js";
import { applyI18n, persistLang, readLang } from "./i18n.js";

const WA_NUMBER = "50931093591";

function setLang(lang) {
  persistLang(lang);
  applyI18n(translations, lang);
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
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
    `Courriel / Imèl: ${data.email || ""}`,
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const { subject, body } = formPayload(form);
    const href = `mailto:1cpcredo@gmail.com?subject=${encodeURIComponent("CPCREDO — " + subject)}&body=${encodeURIComponent(body)}`;
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

function boot() {
  setLang(readLang());
  bindLang();
  bindNav();
  bindHeader();
  bindReveal();
  bindForm();
}

boot();
