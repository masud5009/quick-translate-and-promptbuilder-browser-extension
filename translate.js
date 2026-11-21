// Translation provider router.
// - Default: Google's free, unofficial web endpoint (no key needed).
// - Custom: any OpenAI-compatible endpoint (base URL + API key + model chosen
//   by the user in the popup). Keys live only in chrome.storage.local and are
//   never synced or committed.
// Must return: { text: string, source: string (detected language code, "" if unknown) }.

const MAX_CHARS = 5000;
const CONFIG_KEY = "qtConfig";
const GOOGLE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";

async function getConfig() {
  try {
    const stored = await chrome.storage.local.get(CONFIG_KEY);
    return stored[CONFIG_KEY] || { provider: "google" };
  } catch {
    return { provider: "google" };
  }
}

function languageName(code) {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}

// ----- Google free endpoint (default fallback) -----
async function googleTranslate(q, target) {
  const url = `${GOOGLE_ENDPOINT}?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ q })
  });
  if (!res.ok) throw new Error(`Translation service returned ${res.status}.`);

  const data = await res.json();
  const out = (data[0] || []).map((part) => part[0] || "").join("");
  if (!out) throw new Error("The service returned an empty translation.");
  return { text: out, source: data[2] || "" };
}

// ----- Any OpenAI-compatible /chat/completions endpoint -----
function promptFor(text, target) {
  const lang = languageName(target);
  return [
    `You are a translation engine. Translate the user's message into ${lang} (language code: ${target}).`,
    "Reply with ONLY the translated text — no preamble, no quotes, no explanation.",
    "Preserve line breaks, punctuation and the original formatting as closely as possible."
  ].join(" ");
}

async function customTranslate(q, target, cfg) {
  const base = String(cfg.baseUrl || "").trim().replace(/\/+$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {})
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: promptFor(q, target) },
        { role: "user", content: q }
      ]
    })
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message || "";
    } catch {}
    throw new Error(
      `Translation service returned ${res.status}${detail ? `: ${detail}` : "."}`
    );
  }
  const data = await res.json();
  const out = data?.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error("The service returned an empty translation.");
  return { text: out, source: "" };
}

export async function translate(text, target) {
  const q = String(text || "").trim().slice(0, MAX_CHARS);
  if (!q) throw new Error("Nothing selected to translate.");

  const cfg = await getConfig();
  if (cfg.provider === "custom" && cfg.baseUrl && cfg.model) {
    return customTranslate(q, target, cfg);
  }
  return googleTranslate(q, target);
}
