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
- `translate.js`: the translation provider. Swap this one file to use DeepL, Google Cloud Translation, or your own backend.

## Notes
- The default provider is Google's free, unofficial web endpoint. Good for prototyping; for a published extension, switch to an official API.
- Chrome blocks extensions on `chrome://` pages, the Web Store and the built-in PDF viewer.
