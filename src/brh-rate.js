const BRH_URL = "https://www.brh.ht/";

export function parseBrhHtml(html) {
  const plain = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  const match = plain.match(
    /(\d{1,2}\s+[A-Za-zÀ-ÿ]{3,14}\s+20\d{2})\s+(\d{2,3}\.\d{2,4})\s+Taux de R[ée]f[ée]rence/i
  );
  if (!match) return null;

  const rate = Number(match[2]);
  if (!Number.isFinite(rate) || rate < 50 || rate > 500) return null;

  return {
    date: match[1].trim(),
    rate: match[2],
    source: "BRH",
  };
}

export async function fetchBrhReference() {
  const response = await fetch(BRH_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "CPCREDO-site/1.0 (+https://cpcredo.com)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`BRH HTTP ${response.status}`);
  const html = await response.text();
  const parsed = parseBrhHtml(html);
  if (!parsed) throw new Error("BRH rate not found");
  return parsed;
}

export function brhJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=1800",
      "access-control-allow-origin": "*",
    },
  });
}
