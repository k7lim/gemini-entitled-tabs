// ABOUTME: Background service worker for Gemini Entitled Tabs extension
// ABOUTME: Handles tab focus detection and messaging to content scripts

// Minimal production logging
console.log("Gemini Entitled Tabs: Background worker active");

let lastFocusedGeminiTabId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  try {
    if (lastFocusedGeminiTabId !== null && lastFocusedGeminiTabId !== activeInfo.tabId) {
      chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" }, (response) => {
        if (chrome.runtime.lastError) {
          // Tab likely closed or content script not ready - clear the reference
          lastFocusedGeminiTabId = null;
        }
      });
    }
    
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.warn('Gemini Entitled Tabs: Error getting tab info:', chrome.runtime.lastError.message);
        return;
      }
      
      if (tab.url && tab.url.startsWith("https://gemini.google.com")) {
        lastFocusedGeminiTabId = activeInfo.tabId;
      } else {
        lastFocusedGeminiTabId = null;
      }
    });
  } catch (error) {
    console.warn('Gemini Entitled Tabs: Error in tabs.onActivated:', error);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  try {
    if (windowId === chrome.windows.WINDOW_ID_NONE && lastFocusedGeminiTabId !== null) {
      chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" }, (response) => {
        if (chrome.runtime.lastError) {
          // Tab likely closed or content script not ready - clear the reference
          lastFocusedGeminiTabId = null;
        }
      });
    } else if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.warn('Gemini Entitled Tabs: Error querying active tab:', chrome.runtime.lastError.message);
          return;
        }
        
        if (tabs.length > 0 && tabs[0].url && tabs[0].url.startsWith("https://gemini.google.com")) {
          lastFocusedGeminiTabId = tabs[0].id;
        } else {
          lastFocusedGeminiTabId = null;
        }
      });
    }
  } catch (error) {
    console.warn('Gemini Entitled Tabs: Error in windows.onFocusChanged:', error);
  }
});