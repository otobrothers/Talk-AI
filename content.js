// Talk AI - content script
// Injected each time the icon is clicked (same pattern as WhatFont)
// Second injection toggles the extension OFF

(function () {

  // ── TOGGLE ──────────────────────────────────────────────────────────────────
  if (window.__dictHoverActive) {
    window.__dictHoverActive = false;
    window.__dictHoverCleanup && window.__dictHoverCleanup();
    chrome.runtime.sendMessage({ event: 'deactivated' });
    return;
  }

  window.__dictHoverActive = true;
  chrome.runtime.sendMessage({ event: 'activated' });


  // ── STYLES ───────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = '__dict-hover-style';
  style.textContent = `

    /* ── Hover tooltip ── */
    #__dict-hover-box {
      position: fixed;
      z-index: 2147483646;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      border-radius: 6px;
      padding: 5px 9px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      max-width: 300px;
      word-wrap: break-word;
      display: none;
      background: #1e1e1e;
      color: #e8e8e8;
      border: 1px solid #444;
    }
    #__dict-hover-box.has-def {
      background: #1a2a3a;
      border-color: #4a90d9;
    }
    #__dict-hover-box .word {
      font-weight: 600;
      color: #fff;
      font-size: 12px;
    }
    #__dict-hover-box .def {
      color: #b0c8e8;
      margin-top: 4px;
      font-size: 11.5px;
    }

    /* ── Click popup ── */
    #__dict-popup-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(0, 0, 0, 0.45);
    }
    #__dict-popup {
      position: fixed;
      z-index: 2147483647;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.55;
      border-radius: 8px;
      padding: 20px 22px 16px 22px;
      max-width: 420px;
      width: calc(100vw - 48px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      box-sizing: border-box;
    }
    #__dict-popup-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    #__dict-popup-term {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      line-height: 1.3;
      padding-right: 12px;
    }
    #__dict-popup-close {
      background: none;
      border: none;
      color: #888;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      margin-top: 1px;
    }
    #__dict-popup-close:hover {
      color: #fff;
    }
    #__dict-popup-def-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 4px;
    }
    #__dict-popup-def-text {
      color: #ddd;
      font-size: 13px;
      margin-bottom: 14px;
    }
    #__dict-popup-eli-label {

      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 4px;
    }
    #__dict-popup-eli-text {
      color: #ddd;
      font-size: 13px;
      margin-bottom: 18px;
    }
    #__dict-popup-footer {
      border-top: 1px solid #222;
      padding-top: 11px;
      font-size: 12px;
      color: #555;
    }
    #__dict-popup-footer a {
      color: #555;
      text-decoration: none;
    }
    #__dict-popup-footer a:hover {
      color: #777;
    }
  `;
  document.head.appendChild(style);


  // ── HOVER TOOLTIP DOM ────────────────────────────────────────────────────────
  const box = document.createElement('div');
  box.id = '__dict-hover-box';
  document.body.appendChild(box);


  // ── CLICK POPUP DOM ──────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__dict-popup-overlay';
  overlay.style.display = 'none';

  const popup = document.createElement('div');
  popup.id = '__dict-popup';
  popup.innerHTML = `
    <div id="__dict-popup-header">
      <div id="__dict-popup-term"></div>
      <button id="__dict-popup-close">✕</button>
    </div>
    <div id="__dict-popup-def-label">Definition</div>
    <div id="__dict-popup-def-text"></div>
    <div id="__dict-popup-eli-label">ELI16</div>
    <div id="__dict-popup-eli-text"></div>
    <div id="__dict-popup-footer">
      <a href="https://buymeacoffee.com/otobrothers" target="_blank" rel="noopener noreferrer">Donate</a>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  function openPopup(entry) {
    document.getElementById('__dict-popup-term').textContent = entry.main_term;
    document.getElementById('__dict-popup-def-text').textContent = entry.definition;
    document.getElementById('__dict-popup-eli-text').textContent = entry.eli16 || '—';
    overlay.style.display = 'block';
    box.style.display = 'none'; // hide tooltip while popup is open
  }

  function closePopup() {
    overlay.style.display = 'none';
  }

  document.getElementById('__dict-popup-close').addEventListener('click', closePopup);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup(); // click outside popup closes it
  });


  // ── LOAD DICTIONARY ──────────────────────────────────────────────────────────
  let lookup = null;

  async function loadDictionary() {
    const url = chrome.runtime.getURL('dictionary_en.json');
    const res = await fetch(url);
    const data = await res.json();
    lookup = {};
    for (const term of data.terms) {
      for (const variation of term.variations) {
        lookup[variation.toLowerCase()] = term;
      }
    }
  }

  loadDictionary();


  // ── WORD / PHRASE DETECTION ──────────────────────────────────────────────────
  function getCandidatesAtPoint(x, y) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return [];

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return [];

    const text = node.textContent;
    const offset = range.startOffset;

    const tokenPattern = /\S+/g;
    const tokens = [];
    let m;
    while ((m = tokenPattern.exec(text)) !== null) {
      const clean = m[0].replace(/^[.,;:!?"'()\-–—]+|[.,;:!?"'()\-–—]+$/g, '');
      if (clean.length > 0) {
        tokens.push({ word: clean, start: m.index, end: m.index + m[0].length });
      }
    }

    let curIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
      if (offset >= tokens[i].start && offset <= tokens[i].end) {
        curIdx = i;
        break;
      }
    }
    if (curIdx === -1) return [];

    const candidates = [];
    const maxLen = Math.min(5, tokens.length);

    for (let len = maxLen; len >= 1; len--) {
      const startMin = Math.max(0, curIdx - len + 1);
      const startMax = Math.min(curIdx, tokens.length - len);

      for (let s = startMin; s <= startMax; s++) {
        const e = s + len - 1;
        if (curIdx >= s && curIdx <= e) {
          const phrase = tokens.slice(s, e + 1).map(t => t.word).join(' ');
          if (!candidates.includes(phrase)) candidates.push(phrase);
        }
      }
    }

    return candidates;
  }

  function findEntry(candidates) {
    for (const candidate of candidates) {
      const entry = lookup[candidate.toLowerCase()];
      if (entry) return entry;
    }
    return null;
  }


  // ── MOUSE MOVE (hover tooltip) ───────────────────────────────────────────────
  let lastKey = '';

  function onMouseMove(e) {
    if (!lookup) return;
    if (overlay.style.display !== 'none') return; // popup open, skip hover

    const candidates = getCandidatesAtPoint(e.clientX, e.clientY);
    const singleWord = candidates.length ? candidates[candidates.length - 1].toLowerCase() : '';

    if (singleWord === lastKey) {
      if (box.style.display !== 'none') positionBox(e.clientX, e.clientY);
      return;
    }
    lastKey = singleWord;

    if (!candidates.length || singleWord.length < 2) {
      box.style.display = 'none';
      return;
    }

    const found = findEntry(candidates);

    positionBox(e.clientX, e.clientY);
    box.style.display = 'block';

    if (found) {
      box.classList.add('has-def');
      box.innerHTML =
        `<div class="word">${escapeHtml(found.main_term)}</div>` +
        `<div class="def">${escapeHtml(found.definition)}</div>`;
    } else {
      box.classList.remove('has-def');
      box.innerHTML = `<div class="word">${escapeHtml(candidates[candidates.length - 1])}</div>`;
    }
  }


  // ── CLICK (popup) ────────────────────────────────────────────────────────────
  function onClick(e) {
    if (!lookup) return;
    if (overlay.style.display !== 'none') return; // popup already open

    // Ignore clicks inside the popup/overlay itself
    if (e.target.closest('#__dict-popup-overlay')) return;

    const candidates = getCandidatesAtPoint(e.clientX, e.clientY);
    const found = findEntry(candidates);

    if (found) {
      e.preventDefault();
      e.stopPropagation();
      box.style.display = 'none';
      openPopup(found);
    }
  }


  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function positionBox(x, y) {
    const ox = 15, oy = 15;
    const bw = box.offsetWidth  || 150;
    const bh = box.offsetHeight || 40;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + ox;
    let top  = y + oy;

    if (left + bw > vw - 10) left = x - bw - ox;
    if (top  + bh > vh - 10) top  = y - bh - oy;

    box.style.left = left + 'px';
    box.style.top  = top  + 'px';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick, true); // capture phase


  // ── CLEANUP ──────────────────────────────────────────────────────────────────
  window.__dictHoverCleanup = function () {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', onClick, true);
    document.getElementById('__dict-hover-box')?.remove();
    document.getElementById('__dict-popup-overlay')?.remove();
    document.getElementById('__dict-hover-style')?.remove();
    lookup = null;
  };

})();
