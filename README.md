# Quick Translate

Select text on any page → right-click → **Quick Translate** → pick a language → read the translation in a popup next to your selection.

## Install (development)
1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose this folder.
3. After editing any file, click the reload icon on the extension card, then refresh the page you're testing on.

## Files
- `manifest.json`: permissions and entry points (Manifest V3)
- `background.js`: creates the right-click item, injects the popup, relays translation requests
- `content.js`: the popup UI (Shadow DOM, light/dark, searchable language list, copy)
- `popup.html` / `popup.js`: settings popup (click the toolbar icon) — choose the provider
- `translate.js`: the translation provider router (Google free endpoint or your own custom AI)

## Bring your own AI (optional)

By default translations use Google's free web endpoint — no key needed. Click the
**Quick Translate** toolbar icon to switch to a **Custom AI** provider instead:

1. Paste any **OpenAI-compatible API base URL** (e.g. `https://api.openai.com/v1`,
   OpenRouter, Groq, DeepSeek, or a local `http://localhost:11434/v1` for Ollama).
2. Paste your **API key** and click **Load models** to list the models the endpoint offers.
3. Pick a model (or type any model ID) and hit **Save** — every translation now goes
   through that endpoint. **Test** runs one sample translation to verify the setup.

Security notes:
- Your API key is stored only in `chrome.storage.local` on your machine — it is never
  synced to a Google account and never included in this repository.
- Chrome asks you to grant access to the endpoint's origin the first time you use it
  (optional host permission), nothing broader.

## Notes
- The default provider is Google's free, unofficial web endpoint. Good for prototyping; for a published extension, switch to an official API.
- Chrome blocks extensions on `chrome://` pages, the Web Store and the built-in PDF viewer.
