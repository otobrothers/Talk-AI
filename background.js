// Talk AI - background service worker
// Exact same pattern as WhatFont: click icon → inject content script

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id && tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});

chrome.runtime.onMessage.addListener(({ event }, sender) => {
  const tabId = sender.tab?.id;
  if (event === 'deactivated') {
    chrome.action.setTitle({ title: 'Activate Talk AI', tabId });
  } else if (event === 'activated') {
    chrome.action.setTitle({ title: 'Exit Talk AI', tabId });
  }
});
