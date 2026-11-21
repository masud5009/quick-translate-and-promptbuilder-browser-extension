import { translate, generatePrompt } from "./translate.js";

const MENU_ID = "quick-translate";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Quick Translate",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  const frameId = info.frameId ?? 0;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [frameId] },
      files: ["content.js"]
    });
    await chrome.tabs.sendMessage(
      tab.id,
      { type: "qt-show", text: info.selectionText || "" },
      { frameId }
    );
  } catch (err) {
    // Happens on pages Chrome blocks extensions from, e.g. chrome:// pages or the Web Store.
    console.warn("Quick Translate can't run on this page:", err);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "qt-prompt") {
    generatePrompt(msg.text, msg.target)
      .then((r) => sendResponse({ ok: true, ...r }))
      .catch((e) => sendResponse({ ok: false, error: e.message || String(e) }));
    return true; // keep the channel open for the async response
  }
  if (msg?.type !== "qt-translate") return;
  translate(msg.text, msg.target)
    .then((r) => sendResponse({ ok: true, ...r }))
    .catch((e) => sendResponse({ ok: false, error: e.message || String(e) }));
  return true; // keep the channel open for the async response
});
