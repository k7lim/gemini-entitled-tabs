// ABOUTME: Content script for Gemini Entitled Tabs extension
// ABOUTME: Handles DOM interaction and tab title updates on Gemini pages

// Configuration object for DOM selectors - update these based on live Gemini DOM inspection
const SELECTORS = {
  // Prompt input field selectors (try multiple patterns for robustness)
  promptInput: 'div.ql-editor',
  promptInputFallback: 'div.ql-editor p',
  
  // Selected conversation title selectors (these need verification against live Gemini)
  selectedConversationTitle: '.selected .conversation-title',
  selectedConversationTitleFallbacks: [
    '.active .conversation-title',
    '[aria-selected="true"] .conversation-title', 
    '.chat-history-list .selected',
    '.conversation-item.selected .title',
    '.selected [data-testid="conversation-title"]'
  ],
  
  // Sidebar container selectors for MutationObserver
  sidebarContainer: '#chat-history-panel',
  sidebarContainerFallbacks: [
    '.chat-history',
    '[data-testid="conversation-list"]',
    '.conversation-list',
    '[role="navigation"]'
  ]
};

// Minimal logging for production
console.log("Gemini Entitled Tabs: Extension active");

function getPromptInputElement() {
  try {
    // Try primary selector first, then fallback
    const element = document.querySelector(SELECTORS.promptInput) || 
                    document.querySelector(SELECTORS.promptInputFallback);
    if (!element) {
      console.warn("Gemini Entitled Tabs: Prompt input element not found using selectors:", SELECTORS.promptInput, SELECTORS.promptInputFallback);
    }
    return element;
  } catch (error) {
    console.warn("Gemini Entitled Tabs: Error finding prompt input element:", error);
    return null;
  }
}

function getPromptText() {
  const element = getPromptInputElement();
  if (element) {
    return element.innerText || element.textContent || "";
  }
  return "";
}

function setTabTitle(newTitle) {
  document.title = newTitle;
}

function getSelectedConversationTitleElement() {
  try {
    // Try primary selector first
    let element = document.querySelector(SELECTORS.selectedConversationTitle);
    if (element) {
      return element;
    }
    
    // Try fallback selectors
    for (const selector of SELECTORS.selectedConversationTitleFallbacks) {
      element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    
    console.warn("Gemini Entitled Tabs: Selected conversation title element not found using selector:", SELECTORS.selectedConversationTitle);
    return null;
  } catch (error) {
    console.warn("Gemini Entitled Tabs: Error finding selected conversation title element:", error);
    return null;
  }
}

function getSelectedSidebarTitleText() {
  const element = getSelectedConversationTitleElement();
  if (element) {
    return element.innerText || element.textContent || "";
  }
  return null;
}

// State variables for unified title management
let currentKnownSidebarTitle = null;
let lastPromptTextOnBlur = null;

// MutationObserver for sidebar changes
let observer = null;

function updateDocumentTitle() {
  // Central title update logic following spec prioritization
  const sidebarTitle = getSelectedSidebarTitleText();
  
  // Priority 1: Sidebar title (if available and not empty)
  if (sidebarTitle && sidebarTitle.trim() !== "") {
    setTabTitle(sidebarTitle);
    currentKnownSidebarTitle = sidebarTitle;
    lastPromptTextOnBlur = null; // Clear prompt title when sidebar takes precedence
    console.log(`Title set from sidebar: "${sidebarTitle}"`);
    return;
  }
  
  // Update state if no sidebar title
  currentKnownSidebarTitle = null;
  
  // Priority 2: Prompt text on blur (if available and no sidebar title)
  if (lastPromptTextOnBlur && lastPromptTextOnBlur.trim() !== "") {
    setTabTitle(lastPromptTextOnBlur);
    console.log(`Title set from prompt on blur: "${lastPromptTextOnBlur}"`);
    return;
  }
  
  // Priority 3: No modification (leave original title)
  console.log("No applicable title source found (sidebar or prompt-on-blur).");
}

function initializeMutationObserver() {
  // Wait for sidebar to be available
  setTimeout(() => {
    try {
      // Try primary selector first
      let sidebarContainer = document.querySelector(SELECTORS.sidebarContainer);
      
      // Try fallback selectors if primary fails
      if (!sidebarContainer) {
        for (const selector of SELECTORS.sidebarContainerFallbacks) {
          sidebarContainer = document.querySelector(selector);
          if (sidebarContainer) {
            console.log(`Sidebar container found with fallback selector: ${selector}`);
            break;
          }
        }
      } else {
        console.log(`Sidebar container found with primary selector: ${SELECTORS.sidebarContainer}`);
      }
      
      if (sidebarContainer) {
        console.log('Starting MutationObserver on sidebar container');
        
        observer = new MutationObserver((mutations) => {
          try {
            // Check if mutations contain relevant changes before processing
            const hasRelevantChanges = mutations.some(mutation => 
              mutation.type === 'childList' || 
              mutation.type === 'characterData' ||
              (mutation.type === 'attributes' && ['class', 'aria-selected'].includes(mutation.attributeName))
            );
            
            if (hasRelevantChanges) {
              updateDocumentTitle();
            }
          } catch (error) {
            console.warn('Gemini Entitled Tabs: Error in MutationObserver callback:', error);
          }
        });
        
        // Optimized observer configuration - monitor attributes for selection changes
        observer.observe(sidebarContainer, {
          childList: true,      // New conversation items added/removed
          subtree: true,        // Monitor nested elements for title changes
          characterData: true,  // Text content changes in titles
          attributes: true,     // Selection state changes
          attributeFilter: ['class', 'aria-selected'] // Only watch selection-related attributes
        });
      } else {
        console.warn('Gemini Entitled Tabs: Sidebar container not found using selector:', SELECTORS.sidebarContainer);
        // Retry after a longer delay
        setTimeout(initializeMutationObserver, 3000);
      }
    } catch (error) {
      console.warn('Gemini Entitled Tabs: Error initializing MutationObserver:', error);
      // Retry after a longer delay
      setTimeout(initializeMutationObserver, 3000);
    }
  }, 1000);
}

// Initialize observer when content script loads
initializeMutationObserver();

// Initial title update after page load
setTimeout(updateDocumentTitle, 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.type === "GEMINI_TAB_BLURRED") {
      const promptText = getPromptText();
      
      // Store prompt text for potential use
      if (promptText && promptText.trim() !== "") {
        lastPromptTextOnBlur = promptText;
      } else {
        lastPromptTextOnBlur = null;
      }
      
      // Use unified title update logic
      updateDocumentTitle();
    }
  } catch (error) {
    console.warn('Gemini Entitled Tabs: Error handling message:', error);
  }
});