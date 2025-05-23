// ABOUTME: Background service worker for Gemini Entitled Tabs extension
// ABOUTME: Handles tab focus detection and messaging to content scripts

console.log("Gemini Entitled Tabs background service worker started.");

let lastFocusedGeminiTabId = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Gemini Entitled Tabs extension installed/updated.");
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (lastFocusedGeminiTabId !== null && lastFocusedGeminiTabId !== activeInfo.tabId) {
    console.log(`Gemini tab ${lastFocusedGeminiTabId} lost focus due to tab switch to ${activeInfo.tabId}.`);
    chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Error sending blur message to tab", lastFocusedGeminiTabId, chrome.runtime.lastError.message);
      }
    });
  }
  
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.startsWith("https://gemini.google.com")) {
      lastFocusedGeminiTabId = activeInfo.tabId;
    } else {
      lastFocusedGeminiTabId = null;
    }
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE && lastFocusedGeminiTabId !== null) {
    console.log(`Gemini tab ${lastFocusedGeminiTabId} lost focus due to browser window blur.`);
    chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Error sending blur message to tab", lastFocusedGeminiTabId, chrome.runtime.lastError.message);
      }
    });
  } else if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url && tabs[0].url.startsWith("https://gemini.google.com")) {
        lastFocusedGeminiTabId = tabs[0].id;
      } else {
        lastFocusedGeminiTabId = null;
      }
    });
  }
});