// Translation provider. To switch to DeepL, Google Cloud Translation or your own
// backend (e.g. Claude behind a proxy), only this file needs to change.
// It must return: { text: string, source: string (detected language code) }.

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const MAX_CHARS = 5000;

export async function translate(text, target) {
  const q = String(text || "").trim().slice(0, MAX_CHARS);
  if (!q) throw new Error("Nothing selected to translate.");

  const url = `${ENDPOINT}?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t`;
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
