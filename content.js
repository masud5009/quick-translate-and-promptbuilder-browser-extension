(() => {
  if (window.__quickTranslateLoaded) return;
  window.__quickTranslateLoaded = true;

  // [code, English name, native name]
  const LANGS = [
    ["bn", "Bengali", "বাংলা"], ["en", "English", "English"], ["hi", "Hindi", "हिन्दी"],
    ["ur", "Urdu", "اردو"], ["ar", "Arabic", "العربية"], ["ne", "Nepali", "नेपाली"],
    ["ta", "Tamil", "தமிழ்"], ["te", "Telugu", "తెలుగు"], ["mr", "Marathi", "मराठी"],
    ["gu", "Gujarati", "ગુજરાતી"], ["pa", "Punjabi", "ਪੰਜਾਬੀ"], ["si", "Sinhala", "සිංහල"],
    ["zh-CN", "Chinese (Simplified)", "简体中文"], ["zh-TW", "Chinese (Traditional)", "繁體中文"],
    ["ja", "Japanese", "日本語"], ["ko", "Korean", "한국어"], ["th", "Thai", "ไทย"],
    ["vi", "Vietnamese", "Tiếng Việt"], ["id", "Indonesian", "Bahasa Indonesia"],
    ["ms", "Malay", "Bahasa Melayu"], ["fil", "Filipino", "Filipino"],
    ["es", "Spanish", "Español"], ["fr", "French", "Français"], ["de", "German", "Deutsch"],
    ["it", "Italian", "Italiano"], ["pt", "Portuguese", "Português"], ["ru", "Russian", "Русский"],
    ["uk", "Ukrainian", "Українська"], ["pl", "Polish", "Polski"], ["nl", "Dutch", "Nederlands"],
    ["sv", "Swedish", "Svenska"], ["no", "Norwegian", "Norsk"], ["da", "Danish", "Dansk"],
    ["fi", "Finnish", "Suomi"], ["el", "Greek", "Ελληνικά"], ["tr", "Turkish", "Türkçe"],
    ["he", "Hebrew", "עברית"], ["fa", "Persian", "فارسی"], ["ro", "Romanian", "Română"],
    ["hu", "Hungarian", "Magyar"], ["cs", "Czech", "Čeština"], ["sw", "Swahili", "Kiswahili"]
  ];
  const nameOf = (code) => (LANGS.find((l) => l[0] === code) || [code, code, code]);

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .panel {
      --bg:#ffffff; --fg:#14181f; --muted:#5d6675; --line:#dfe3ea;
      --accent:#2f5be7; --soft:#eef2ff; --err:#b42318; --shadow:0 12px 32px rgba(16,24,40,.18);
      position: fixed; width: 360px; max-width: calc(100vw - 16px);
      background: var(--bg); color: var(--fg);
      border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow);
      font: 14px/1.5 system-ui, -apple-system, "Segoe UI", "Noto Sans Bengali", "Nirmala UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      .panel { --bg:#1b1f27; --fg:#eceff4; --muted:#98a2b3; --line:#323945;
               --accent:#8aa5ff; --soft:#262c3a; --err:#ff8a7a; --shadow:0 12px 32px rgba(0,0,0,.5); }
    }
    .panel[hidden], .menu[hidden], .foot[hidden] { display: none; }
    .bar { display: flex; align-items: center; gap: 8px; padding: 10px 8px 8px 12px; }
    .combo { position: relative; }
    .lang {
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      border: 1px solid var(--line); background: var(--bg); color: var(--fg);
      border-radius: 8px; padding: 5px 8px 5px 10px; font: inherit; font-weight: 600;
    }
    .lang:hover { background: var(--soft); }
    .lang svg { width: 12px; height: 12px; color: var(--muted); }
    .from { margin-left: auto; color: var(--muted); font-size: 12px; white-space: nowrap; }
    .icon {
      border: 0; background: none; color: var(--muted); width: 28px; height: 28px;
      border-radius: 6px; cursor: pointer; font-size: 18px; line-height: 1;
    }
    .icon:hover { background: var(--soft); color: var(--fg); }
    :is(.lang, .icon, .btn, .item, .search):focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
    .menu {
      position: absolute; top: calc(100% + 6px); left: 0; width: 250px; z-index: 2;
      background: var(--bg); border: 1px solid var(--line); border-radius: 10px;
      box-shadow: var(--shadow); padding: 6px;
    }
    .search {
      width: 100%; margin-bottom: 6px; padding: 6px 8px; font: inherit;
      border: 1px solid var(--line); border-radius: 6px; background: var(--bg); color: var(--fg);
    }
    .list { list-style: none; margin: 0; padding: 0; max-height: 210px; overflow: auto; }
    .item {
      display: flex; justify-content: space-between; gap: 8px; width: 100%; text-align: left;
      border: 0; background: none; color: var(--fg); font: inherit;
      padding: 6px 8px; border-radius: 6px; cursor: pointer;
    }
    .item:hover, .item[aria-selected="true"] { background: var(--soft); }
    .item small { color: var(--muted); font-size: 12px; align-self: center; }
    .orig {
      margin: 0; padding: 0 12px 10px; color: var(--muted); font-size: 12.5px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .result {
      padding: 12px; border-top: 1px solid var(--line); font-size: 15px; line-height: 1.65;
      max-height: 260px; overflow: auto; white-space: pre-wrap; word-break: break-word;
    }
    .result.loading { color: var(--muted); }
    .result.error { color: var(--err); }
    .foot { display: flex; justify-content: flex-end; gap: 8px; padding: 0 10px 10px; }
    .btn {
      border: 1px solid var(--line); background: var(--bg); color: var(--fg);
      border-radius: 8px; padding: 5px 12px; font: inherit; cursor: pointer;
    }
    .btn:hover { background: var(--soft); }
    .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    @media (prefers-color-scheme: dark) { .btn.primary { color: #10131a; } }
  `;

  const TEMPLATE = `
    <style>${CSS}</style>
    <div class="panel" role="dialog" aria-label="Translation" hidden>
      <div class="bar">
        <div class="combo">
          <button class="lang" type="button" aria-haspopup="listbox" aria-expanded="false">
            <span class="lang-name"></span>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>
          </button>
          <div class="menu" hidden>
            <input class="search" type="text" placeholder="Search language" aria-label="Search language" />
            <ul class="list" role="listbox"></ul>
          </div>
        </div>
        <span class="from"></span>
        <button class="icon close" type="button" aria-label="Close">&times;</button>
      </div>
      <p class="orig"></p>
      <div class="result loading" aria-live="polite"></div>
      <div class="foot" hidden>
        <button class="btn retry" type="button" hidden>Try again</button>
        <button class="btn primary copy" type="button">Copy</button>
      </div>
    </div>
  `;

  let host, root, el;
  let state = { text: "", target: "bn", anchor: null, reqId: 0, open: false };

  function build() {
    host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;top:0;left:0;z-index:2147483647;";
    root = host.attachShadow({ mode: "closed" });
    root.innerHTML = TEMPLATE;
    const q = (s) => root.querySelector(s);
    el = {
      panel: q(".panel"), langBtn: q(".lang"), langName: q(".lang-name"), menu: q(".menu"),
      search: q(".search"), list: q(".list"), from: q(".from"), close: q(".close"),
      orig: q(".orig"), result: q(".result"), foot: q(".foot"), copy: q(".copy"), retry: q(".retry")
    };

    el.langBtn.addEventListener("click", () => (el.menu.hidden ? openMenu() : closeMenu()));
    el.search.addEventListener("input", renderList);
    el.search.addEventListener("keydown", onSearchKey);
    el.list.addEventListener("keydown", onListKey);
    el.close.addEventListener("click", closePanel);
    el.retry.addEventListener("click", run);
    el.copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(el.result.textContent);
        el.copy.textContent = "Copied";
      } catch {
        el.copy.textContent = "Copy failed";
      }
      setTimeout(() => (el.copy.textContent = "Copy"), 1500);
    });
    document.documentElement.appendChild(host);
  }

  // ----- language menu -----
  function renderList() {
    const term = el.search.value.trim().toLowerCase();
    el.list.textContent = "";
    LANGS.filter(([c, en, native]) =>
      !term || en.toLowerCase().includes(term) || native.toLowerCase().includes(term) || c.toLowerCase() === term
    ).forEach(([code, en, native]) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "item";
      b.dataset.code = code;
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", String(code === state.target));
      const a = document.createElement("span");
      a.textContent = native;
      const s = document.createElement("small");
      s.textContent = en === native ? "" : en;
      b.append(a, s);
      b.addEventListener("click", () => pickLang(code));
      li.appendChild(b);
      el.list.appendChild(li);
    });
  }
  function openMenu() {
    el.menu.hidden = false;
    el.langBtn.setAttribute("aria-expanded", "true");
    el.search.value = "";
    renderList();
    el.search.focus();
  }
  function closeMenu() {
    el.menu.hidden = true;
    el.langBtn.setAttribute("aria-expanded", "false");
  }
  function onSearchKey(e) {
    const items = [...el.list.querySelectorAll(".item")];
    if (e.key === "Enter" && items[0]) { e.preventDefault(); pickLang(items[0].dataset.code); }
    if (e.key === "ArrowDown" && items[0]) { e.preventDefault(); items[0].focus(); }
  }
  function onListKey(e) {
    const items = [...el.list.querySelectorAll(".item")];
    const i = items.indexOf(root.activeElement);
    if (e.key === "ArrowDown" && items[i + 1]) { e.preventDefault(); items[i + 1].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); (items[i - 1] || el.search).focus(); }
  }
  function pickLang(code) {
    state.target = code;
    try { chrome.storage.local.set({ qtTarget: code }); } catch {}
    closeMenu();
    el.langName.textContent = nameOf(code)[2];
    run();
  }

  // ----- translate -----
  async function run() {
    const id = ++state.reqId;
    el.langName.textContent = nameOf(state.target)[2];
    el.from.textContent = "";
    el.foot.hidden = true;
    el.retry.hidden = true;
    el.result.className = "result loading";
    el.result.textContent = "Translating…";
    place();

    let res;
    try {
      res = await chrome.runtime.sendMessage({ type: "qt-translate", text: state.text, target: state.target });
    } catch (e) {
      res = { ok: false, error: "The extension was reloaded. Refresh this page and try again." };
    }
    if (id !== state.reqId) return; // a newer request replaced this one

    if (res && res.ok) {
      el.result.className = "result";
      el.result.textContent = res.text;
      let from = "";
      try { from = new Intl.DisplayNames(["en"], { type: "language" }).of(res.source); } catch {}
      el.from.textContent = from ? `from ${from}` : "";
      el.foot.hidden = false;
    } else {
      el.result.className = "result error";
      el.result.textContent = (res && res.error) || "Couldn't translate. Check your connection and try again.";
      el.foot.hidden = false;
      el.retry.hidden = false;
    }
    place();
  }

  // ----- placement -----
  function selectionRect() {
    const sel = getSelection();
    if (sel && sel.rangeCount) {
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (r.width || r.height) return r;
    }
    const a = document.activeElement; // text inputs and textareas
    if (a && a !== document.body && a.getBoundingClientRect) return a.getBoundingClientRect();
    const y = innerHeight / 3;
    return { left: innerWidth / 2 - 180, top: y, bottom: y };
  }
  function place() {
    const p = el.panel;
    p.hidden = false;
    const a = state.anchor;
    const w = p.offsetWidth, h = p.offsetHeight;
    const left = Math.max(8, Math.min(a.left, innerWidth - w - 8));
    let top = a.bottom + 10;
    if (top + h > innerHeight - 8) top = Math.max(8, a.top - h - 10);
    p.style.left = left + "px";
    p.style.top = top + "px";
  }

  // ----- open / close -----
  function onDocDown(e) {
    if (!e.composedPath().includes(host)) closePanel();
  }
  function onKey(e) {
    if (e.key !== "Escape") return;
    if (!el.menu.hidden) { closeMenu(); el.langBtn.focus(); }
    else closePanel();
  }
  function closePanel() {
    if (!state.open) return;
    state.open = false;
    state.reqId++;
    closeMenu();
    el.panel.hidden = true;
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onKey, true);
  }

  async function show(text) {
    text = (text || "").trim();
    if (!text) return;
    if (!host) build();
    try {
      const saved = await chrome.storage.local.get("qtTarget");
      if (saved.qtTarget) state.target = saved.qtTarget;
    } catch {}
    state.text = text;
    state.anchor = selectionRect();
    el.orig.textContent = text;
    if (!state.open) {
      state.open = true;
      document.addEventListener("mousedown", onDocDown, true);
      document.addEventListener("keydown", onKey, true);
    }
    run();
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "qt-show") show(msg.text);
  });
})();
