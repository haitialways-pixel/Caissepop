const BRH_URL = "https://www.brh.ht/";

function pickRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 50 || n > 500) return null;
  return value;
}

export function parseBrhHtml(html) {
  const plain = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  const refMatch = plain.match(
    /(\d{1,2}\s+[A-Za-zÀ-ÿ]{3,14}\s+20\d{2})\s+(\d{2,3}\.\d{2,4})\s+Taux de R[ée]f[ée]rence/i
  );
  const buyMatch = plain.match(
    /(\d{2,3}\.\d{2,4})\s*\/\s*(\d{2,3}\.\d{2,4})[\s\S]{0,80}?Taux d['’]achat affich/i
  );
  const sellMatch = plain.match(
    /(\d{2,3}\.\d{2,4})\s*\/\s*(\d{2,3}\.\d{2,4})[\s\S]{0,80}?Taux de vente affich/i
  );

  const reference = refMatch ? pickRate(refMatch[2]) : null;
  const buy = buyMatch ? pickRate(buyMatch[1]) : null;
  const sell = sellMatch ? pickRate(sellMatch[1]) : null;
  if (!reference && !buy && !sell) return null;

  return {
    date: refMatch ? refMatch[1].trim() : null,
    reference,
    buy,
    sell,
    rate: reference,
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
