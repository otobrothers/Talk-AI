# Talk AI — Chrome Extension

> Hover over any word on any webpage to instantly see its AI & tech definition.  
> Built by [otobrothers](https://buymeacoffee.com/otobrothers).

---

## What it does

**Talk AI** is a lightweight Chrome extension that works like WhatFont — but for AI and tech terminology. Click the extension icon to activate it, then hover over any word on the page. If the word is in the dictionary, a tooltip appears with its definition. Click the word for the full popup with a plain-language explanation.

### Features

- **Hover tooltip** — instantly shows the term and its definition as you move your cursor
- **Click popup** — full definition + ELI16 (Explain Like I'm 16) explanation on click
- **776 terms** covering AI, ML, cloud infrastructure, tools, and models
- **Multi-word detection** — recognizes phrases up to 5 words long (e.g. "neural machine translation")
- **Toggle on/off** — click the icon once to activate, click again to deactivate
- **Zero permissions bloat** — only uses `activeTab` and `scripting`

---

## Installation (Developer Mode)

The extension is not yet on the Chrome Web Store. To install it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the folder containing this repository
6. The Talk AI icon will appear in your toolbar

---

## How to use

1. Click the **Talk AI icon** in the Chrome toolbar to activate
2. Move your mouse over any text on the page
3. A small tooltip appears near your cursor:
   - **Dark box** — word detected but not in dictionary
   - **Blue-bordered box** — word found, shows definition
4. **Click** any word in the dictionary to open the full popup
5. Click the **✕** button or anywhere outside the popup to close it
6. Click the icon again to **deactivate**

---

## File structure

```
talk-ai/
├── manifest.json         # Extension config (Manifest V3)
├── background.js         # Service worker — handles icon click & injects content script
├── content.js            # Main logic — hover tooltip, click popup, dictionary lookup
├── dictionary_en.json    # 776 AI/tech terms with definitions and ELI16 explanations
├── icon16.png            # Toolbar icon (16×16)
├── icon48.png            # Extension page icon (48×48)
└── icon128.png           # Chrome Web Store icon (128×128)
```

---

## Dictionary format

The dictionary lives in `dictionary_en.json`. Each term has this structure:

```json
{
  "id": "transformer",
  "main_term": "Transformer",
  "variations": ["Transformer", "transformer model", "transformer architecture"],
  "definition": "A neural network architecture introduced in 'Attention Is All You Need' (2017)...",
  "eli16": "A type of AI brain that reads entire sentences at once instead of word by word...",
  "level": 1,
  "reference_link": ""
}
```

| Field | Description |
|---|---|
| `id` | Unique snake_case identifier |
| `main_term` | Display name shown in tooltip and popup |
| `variations` | All forms the extension will match (lowercase comparison) |
| `definition` | Technical definition |
| `eli16` | Plain-language explanation for a general audience |
| `level` | `1` = beginner-friendly, `2` = more technical |
| `reference_link` | Optional URL for further reading |

To add your own terms, edit `dictionary_en.json` following the same structure and reload the extension in `chrome://extensions`.

---

## Tech stack

- **Manifest V3** Chrome Extension API
- Vanilla JavaScript — no frameworks, no dependencies
- `document.caretRangeFromPoint` for word detection under cursor
- `fetch` + `chrome.runtime.getURL` for loading the local dictionary

---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Access the current tab's content when activated |
| `scripting` | Inject the content script when the icon is clicked |

No data is collected. No network requests are made. Everything runs locally.

---

## Roadmap

- [ ] Chrome Web Store release
- [ ] User-configurable dictionary (add/remove terms via popup UI)
- [ ] Multi-language support
- [ ] Keyboard shortcut to toggle
- [ ] Export / import custom dictionaries

---

## Support

If you find this useful, consider buying me a coffee:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-otobrothers-orange?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/otobrothers)

---

## License

MIT — free to use, modify, and distribute.
