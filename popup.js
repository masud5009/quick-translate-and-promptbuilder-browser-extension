// Settings popup. Users can switch between the free Google endpoint and any
// OpenAI-compatible custom endpoint (BYOK). The API key is stored only in
// chrome.storage.local and is never synced or included in commits.

const CONFIG_KEY = "qtConfig";

const $ = (id) => document.getElementById(id);
const els = {
  active: $("active-label"),
  google: $("pick-google"),
  custom: $("pick-custom"),
  section: $("custom-section"),
  baseUrl: $("base-url"),
  apiKey: $("api-key"),
  model: $("model"),
  modelList: $("model-list"),
  loadModels: $("load-models"),
  test: $("test"),
  save: $("save"),
  status: $("status")
};

let provider = "google";
// Remembered custom fields so switching to Google and back doesn't wipe them.
let remembered = { baseUrl: "", apiKey: "", model: "" };

// ----- status -----
function setStatus(msg, kind = "") {
  els.status.textContent = msg || "";
  els.status.className = `status ${kind}`.trim();
}

// ----- permissions: grant per-origin, only when needed -----
async function ensurePermission(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("Base URL is not a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Base URL must start with https:// (or http:// for local models).");
  }
  const origin = url.origin + "/*";
  const granted =
    (await chrome.permissions.contains({ origins: [origin] })) ||
    (await chrome.permissions.request({ origins: [origin] }));
  if (!granted) throw new Error("Chrome permission to contact this endpoint was denied.");
}

// ----- custom endpoint model list (GET {base}/models) -----
async function loadModels() {
  const base = els.baseUrl.value.trim().replace(/\/+$/, "");
  if (!base) {
    setStatus("Enter the API base URL first.", "err");
    els.baseUrl.focus();
    return;
  }
  els.loadModels.disabled = true;
  setStatus("Loading models…", "loading");
  try {
    await ensurePermission(base);

    const headers = {};
    const key = els.apiKey.value.trim();
    if (key) headers.Authorization = `Bearer ${key}`;

    const res = await fetch(`${base}/models`, { headers });
    if (!res.ok) throw new Error(`Model list request returned ${res.status}.`);

    const data = await res.json();
    const ids = (data?.data || data?.models || [])
      .map((m) => (typeof m === "string" ? m : m?.id || m?.name))
      .filter(Boolean)
      .sort();
    if (!ids.length) throw new Error("The endpoint returned no models.");

    els.modelList.textContent = "";
    ids.forEach((id) => {
      const opt = document.createElement("option");
      opt.value = id;
      els.modelList.appendChild(opt);
    });
    setStatus(`Loaded ${ids.length} models. Pick one from the dropdown.`, "ok");
  } catch (e) {
    setStatus(e.message || String(e), "err");
  } finally {
    els.loadModels.disabled = false;
  }
}

// ----- form <-> config -----
function currentConfig() {
  if (provider === "google") {
    // Keep the custom fields around so the user can switch back without retyping.
    return { provider: "google", ...remembered };
  }
  const cfg = {
    provider: "custom",
    baseUrl: els.baseUrl.value.trim().replace(/\/+$/, ""),
    apiKey: els.apiKey.value.trim(),
    model: els.model.value.trim()
  };
  remembered = { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, model: cfg.model };
  return cfg;
}

function reflect() {
  els.google.setAttribute("aria-pressed", String(provider === "google"));
  els.custom.setAttribute("aria-pressed", String(provider === "custom"));
  els.section.hidden = provider !== "custom";
  els.active.innerHTML =
    provider === "custom" && els.model.value.trim()
      ? `Active: <b>Custom AI</b> — model <b>${escapeHtml(els.model.value.trim())}</b>`
      : `Active: <b>Google Translate</b> (free, default)`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

async function load() {
  try {
    const stored = await chrome.storage.local.get(CONFIG_KEY);
    const cfg = stored[CONFIG_KEY] || { provider: "google" };
    provider = cfg.provider === "custom" ? "custom" : "google";
    remembered = { baseUrl: cfg.baseUrl || "", apiKey: cfg.apiKey || "", model: cfg.model || "" };
    if (cfg.provider === "custom") {
      els.baseUrl.value = remembered.baseUrl;
      els.apiKey.value = remembered.apiKey;
      els.model.value = remembered.model;
    }
  } catch {}
  reflect();
}

async function save() {
  const cfg = currentConfig();
  if (cfg.provider === "custom") {
    if (!cfg.baseUrl) {
      setStatus("Enter the API base URL.", "err");
      els.baseUrl.focus();
      return;
    }
    if (!cfg.model) {
      setStatus("Pick or type a model.", "err");
      els.model.focus();
      return;
    }
    try {
      await ensurePermission(cfg.baseUrl);
    } catch (e) {
      setStatus(e.message || String(e), "err");
      return;
    }
  }
  try {
    await chrome.storage.local.set({ [CONFIG_KEY]: cfg });
    provider = cfg.provider;
    reflect();
    setStatus("Saved. New translations will use this provider.", "ok");
  } catch (e) {
    setStatus(e.message || String(e), "err");
  }
}

// ----- sanity check: one real translation through the configured provider -----
async function test() {
  els.test.disabled = true;
  setStatus("Testing translation…", "loading");
  try {
    await save();
    const stored = await chrome.storage.local.get("qtTarget");
    const target = stored.qtTarget || "en";
    const res = await chrome.runtime.sendMessage({
      type: "qt-translate",
      text: "Hello! This is a test.",
      target
    });
    if (res?.ok) {
      const preview = res.text.length > 80 ? res.text.slice(0, 80) + "…" : res.text;
      setStatus(`Works: “${preview}”`, "ok");
    } else {
      setStatus(res?.error || "Test failed.", "err");
    }
  } catch (e) {
    setStatus(e.message || String(e), "err");
  } finally {
    els.test.disabled = false;
  }
}

// ----- events -----
els.google.addEventListener("click", () => { provider = "google"; reflect(); });
els.custom.addEventListener("click", () => { provider = "custom"; reflect(); });
els.loadModels.addEventListener("click", loadModels);
els.save.addEventListener("click", save);
els.test.addEventListener("click", test);
els.model.addEventListener("input", reflect);

load();
