export const LANGS = ["fr", "ht"];
export const STORAGE_KEY = "cpcredo-lang";
const WA_NUMBER = "50931093591";

export function readLang() {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(stored)) return stored;
  } catch {
    /* private mode */
  }
  return "fr";
}

export function persistLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  } catch {
    /* ignore */
  }
}

function lookup(dict, key) {
  return key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
}

export function t(translations, lang, key) {
  const value = lookup(translations[lang], key) ?? lookup(translations.fr, key);
  return value == null ? key : value;
}

export function applyI18n(translations, lang) {
  document.documentElement.lang = lang === "ht" ? "ht" : "fr";
  document.documentElement.dataset.lang = lang;
  document.documentElement.classList.remove("i18n-wait");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(translations, lang, el.dataset.i18n);
    if (el.dataset.i18nHtml === "true") el.innerHTML = value;
    else el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(translations, lang, el.dataset.i18nAria));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(translations, lang, el.dataset.i18nPlaceholder));
  });

  const titleKey = document.body.dataset.titleKey;
  if (titleKey) document.title = t(translations, lang, titleKey);

  const desc = document.querySelector('meta[name="description"]');
  const descKey = document.body.dataset.descKey;
  if (desc && descKey) desc.setAttribute("content", t(translations, lang, descKey));

  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    const on = btn.dataset.setLang === lang;
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("is-active", on);
  });

  const waText = t(translations, lang, "common.waMessage");
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.setAttribute("href", waHref);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}
