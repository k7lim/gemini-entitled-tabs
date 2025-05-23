### **Prompt 1: Project Setup - Manifest File (Completed: [ YES ])**

```text
You are an expert AI programmer. Your task is to help build a Chrome browser extension (Manifest V3) called "Gemini Entitled Tabs."

**Current Goal:** Create the initial `manifest.json` file.

**Specifications:**
1.  **File:** `manifest.json`
2.  **`manifest_version`:** 3
3.  **`name`:** "Gemini Entitled Tabs"
4.  **`version`:** "1.0"
5.  **`description`:** "Dynamically updates Gemini tab titles based on chat content for better tab identification."
6.  **`action`:** For now, do not define a browser action (popup). The extension should operate silently as per spec 4.4.

**Output:**
Provide the complete content for `manifest.json`.

**Testing:**
After this step, the developer should be able to:
1. Create a directory for the extension.
2. Save the generated `manifest.json` in this directory.
3. Go to `chrome://extensions` (or `brave://extensions`), enable "Developer mode," and click "Load unpacked."
4. Select the extension directory.
5. The extension should load without errors, displaying its name and version.
```

---

### **Prompt 2: Project Setup - Basic Content Script & Injection (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 1 created the basic `manifest.json`.

**Current Goal:** Create a basic content script (`content.js`) and configure the manifest to inject it into Gemini pages.

**Specifications:**
1.  **File to Create:** `content.js`
    *   Add a simple `console.log("Gemini Entitled Tabs content script loaded on:", window.location.href);` to verify it runs.
2.  **File to Modify:** `manifest.json`
    *   Add a `content_scripts` section.
    *   The content script (`content.js`) should `matches` only `https://gemini.google.com/*`.
    *   It should run at `document_idle`.

**Output:**
1.  The complete content for the new `content.js`.
2.  The complete, updated content for `manifest.json`.

**Testing:**
After this step, the developer should be able to:
1. Save `content.js` in the extension directory.
2. Update `manifest.json`.
3. Reload the unpacked extension in `chrome://extensions`.
4. Open a tab and navigate to `https://gemini.google.com/`.
5. Open the browser's developer console (for the Gemini tab) and verify the log message from `content.js` appears.
6. Navigate to another site (e.g., `https://www.google.com`) and verify the log message does *not* appear.
```

---

### **Prompt 3: Project Setup - Basic Background Service Worker (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 2 set up `content.js` and its injection.

**Current Goal:** Create a basic background service worker (`background.js`) and configure the manifest.

**Specifications:**
1.  **File to Create:** `background.js`
    *   Add a simple `console.log("Gemini Entitled Tabs background service worker started.");` that runs when the service worker initializes (e.g., directly in the script or within an `chrome.runtime.onInstalled` listener for first install/update).
2.  **File to Modify:** `manifest.json`
    *   Add a `background` section specifying `background.js` as the `service_worker`.

**Output:**
1.  The complete content for the new `background.js`.
2.  The complete, updated content for `manifest.json`.

**Testing:**
After this step, the developer should be able to:
1. Save `background.js` in the extension directory.
2. Update `manifest.json`.
3. Reload the unpacked extension in `chrome://extensions`.
4. Inspect the service worker for the extension (usually via a link on the `chrome://extensions` page for that extension) and verify its console shows the "background service worker started" message.
```

---

### **Prompt 4: Fallback Titling - DOM Interaction in Content Script (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 3 set up `background.js`. We now focus on `content.js` for the fallback titling mechanism (Spec 4.1.2).

**Current Goal:** In `content.js`, implement functions to:
1.  Identify and get text from the Gemini prompt input field.
2.  Set the document's title.

**Specifications (`content.js`):**
1.  **Identify Prompt Input Field:**
    *   The Gemini prompt input field is described in spec 6.3.2 as potentially `<div class="ql-editor ..."><p>PROMPT_TEXT</p></div>`.
    *   Create a function, e.g., `getPromptInputElement()`. This function should try to find this element. Use a robust selector. For now, let's assume the selector is `div.ql-editor p` or `div.ql-editor`. Log if the element is not found.
    *   **Note for LLM:** The actual selector might need adjustment based on live inspection of `gemini.google.com`. Advise the user to verify this selector.
2.  **Get Prompt Text:**
    *   Create a function `getPromptText()` that:
        *   Calls `getPromptInputElement()`.
        *   If the element is found, returns its `innerText` or `textContent`.
        *   If not found, returns an empty string or `null`.
3.  **Set Tab Title:**
    *   Create a function `setTabTitle(newTitle)` that:
        *   Sets `document.title = newTitle;`.
        *   As per spec 4.2, the title must *only* consist of `newTitle` (no prefixes/suffixes).

**Output:**
1.  The complete, updated content for `content.js`, including the new functions. The initial log message can remain for now.

**Testing:**
After this step, the developer should be able to:
1. Update `content.js`.
2. Reload the unpacked extension.
3. Open `https://gemini.google.com/`.
4. In the Gemini tab's developer console:
    *   Execute `getPromptInputElement()` and verify it logs or returns the correct DOM element.
    *   Type "Test prompt here" into the Gemini prompt box.
    *   Execute `getPromptText()` and verify it returns "Test prompt here".
    *   Execute `setTabTitle("Custom Title Test")` and verify the browser tab's title changes to "Custom Title Test".
```

---

### **Prompt 5: Fallback Titling - Background Script - Tab Focus Detection (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 4 added DOM interaction functions to `content.js`.

**Current Goal:** In `background.js`, implement logic to detect when a tab loses focus (either by switching to another tab or by the browser window losing focus). This is for the "on blur" trigger (Spec 4.1.2).

**Specifications (`background.js`):**
1.  **State:** Store the ID of the previously active tab that was a Gemini tab. Let's call this `let lastFocusedGeminiTabId = null;`
2.  **`chrome.tabs.onActivated` Listener:**
    *   When a tab is activated (`activeInfo.tabId`):
        *   If `lastFocusedGeminiTabId` is not null (meaning a Gemini tab was previously focused and is now losing focus because another tab became active):
            *   Log to the background console: `Gemini tab ${lastFocusedGeminiTabId} lost focus due to tab switch to ${activeInfo.tabId}.`
            *   (Later, we'll send a message here).
        *   Check if the newly activated tab (`activeInfo.tabId`) is a Gemini tab. To do this, you'll need `chrome.tabs.get(activeInfo.tabId, (tab) => { ... })`.
        *   If it's a Gemini tab (URL starts with `https://gemini.google.com`), set `lastFocusedGeminiTabId = activeInfo.tabId;`.
        *   Otherwise, if the new tab is not Gemini, and if `lastFocusedGeminiTabId` was just set to the *current* tab (meaning we switched *from* a non-Gemini tab *to* a non-Gemini tab, but thought a Gemini tab was active), clear `lastFocusedGeminiTabId` if it wasn't the one that just lost focus. More simply: after processing a potential blur, update `lastFocusedGeminiTabId` based on the *newly* active tab.
        *   A simpler logic for `onActivated`:
            1. The `activeInfo` gives the `tabId` of the tab that just became active.
            2. If `lastFocusedGeminiTabId` is not null AND `lastFocusedGeminiTabId !== activeInfo.tabId`, it means the tab `lastFocusedGeminiTabId` (which was Gemini) just lost focus. Log this.
            3. Now, check the *newly* active tab (`activeInfo.tabId`). Get its details using `chrome.tabs.get`. If its URL is Gemini, set `lastFocusedGeminiTabId = activeInfo.tabId`. Otherwise, set `lastFocusedGeminiTabId = null`.
3.  **`chrome.windows.onFocusChanged` Listener:**
    *   When window focus changes (`windowId`):
        *   If `windowId === chrome.windows.WINDOW_ID_NONE` (browser window lost focus) AND `lastFocusedGeminiTabId` is not null:
            *   Log to the background console: `Gemini tab ${lastFocusedGeminiTabId} lost focus due to browser window blur.`
            *   (Later, we'll send a message here).
        *   If the window regained focus (`windowId !== chrome.windows.WINDOW_ID_NONE`):
            *   Query the active tab in this window: `chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => { ... })`.
            *   If an active tab is found and it's a Gemini tab, set `lastFocusedGeminiTabId = tabs[0].id;`.
            *   Else, `lastFocusedGeminiTabId = null;` (unless it was already a Gemini tab in another focused window, this logic is for the current window).
            *   This part ensures `lastFocusedGeminiTabId` is correctly set when focus returns to a window with an active Gemini tab.

**Permissions:**
*   Ensure `manifest.json` has the `"tabs"` permission for `chrome.tabs.get`, `chrome.tabs.query`, `chrome.tabs.onActivated`.

**Output:**
1.  The complete, updated content for `background.js`.
2.  The complete, updated content for `manifest.json` (if permissions changed).

**Testing:**
After this step, the developer should be able to:
1. Update `background.js` and `manifest.json`.
2. Reload the unpacked extension.
3. Inspect the service worker console.
4. **Scenario 1 (Tab Switch):**
    *   Open a Gemini tab. (Background console might log setting `lastFocusedGeminiTabId`).
    *   Open another (non-Gemini) tab and switch to it.
    *   Verify background console logs that the Gemini tab lost focus due to tab switch.
    *   Switch back to the Gemini tab. (Background console might log setting `lastFocusedGeminiTabId` again).
5.  **Scenario 2 (Window Blur):**
    *   Have a Gemini tab active.
    *   Click outside the browser window (e.g., on the desktop or another application).
    *   Verify background console logs that the Gemini tab lost focus due to browser window blur.
    *   Click back into the browser window on the Gemini tab.
```

---

### **Prompt 6: Fallback Titling - Communication & Logic (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 5 implemented tab focus detection in `background.js`.

**Current Goal:**
1.  Modify `background.js` to send a message to the content script of a Gemini tab when it loses focus.
2.  Modify `content.js` to listen for this message and, if no sidebar title is active (placeholder for now), update the tab title using the prompt input text.
3.  Add necessary permissions to `manifest.json`.

**Specifications:**

**`background.js` (Updates):**
1.  When a Gemini tab (identified by `lastFocusedGeminiTabId`) loses focus (in both `chrome.tabs.onActivated` and `chrome.windows.onFocusChanged` listeners):
    *   Instead of just logging, send a message to that specific tab's content script:
        `chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" });`
    *   Add error handling for `sendMessage` (e.g., if the tab was closed).
    *   After sending the message (or attempting to), if the focus is moving *away* from this Gemini tab (i.e., the new active tab is not this one, or window lost focus), then clear or update `lastFocusedGeminiTabId` as per previous logic. (The `lastFocusedGeminiTabId` update logic from prompt 5 should still be in place to correctly identify the *next* focused Gemini tab, or none if focus moves to non-Gemini).

**`content.js` (Updates):**
1.  **Message Listener:**
    *   Add `chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { ... });`.
    *   Inside the listener, if `request.type === "GEMINI_TAB_BLURRED"`:
        *   Log "GEMINI_TAB_BLURRED message received."
        *   Call `const promptText = getPromptText();`.
        *   **Crucial Condition (Spec 4.1.2 Fallback):** For now, we assume no sidebar conversation is selected. This condition will be refined later.
        *   If `promptText` is not empty (and not just whitespace):
            *   Call `setTabTitle(promptText);`.
            *   Log `Tab title updated to prompt text: "${promptText}"`.
        *   Else, log "Prompt text is empty, not updating title on blur."

**`manifest.json` (Updates):**
1.  Ensure permissions:
    *   `"tabs"` (already added, for `chrome.tabs.sendMessage`, `onActivated`, `get`, `query`).
    *   `"scripting"` might be needed if we were injecting, but for `sendMessage` to existing content scripts declared in manifest, it's usually fine with just `tabs` and `host_permissions`. Let's confirm. (The `scripting` permission is more for `chrome.scripting.executeScript`. `host_permissions` grant content scripts the ability to run and use `chrome.runtime.sendMessage/onMessage`).
    *   **`host_permissions`**: Ensure `https://gemini.google.com/*` is present (already added for content script injection, this also allows API communication like `sendMessage` from background to content scripts on these origins without extra permissions).

**Output:**
1.  The complete, updated content for `background.js`.
2.  The complete, updated content for `content.js`.
3.  The complete, updated content for `manifest.json` (confirming permissions).

**Testing:**
After this step, the developer should be able to:
1. Update all files.
2. Reload the unpacked extension.
3. **Scenario:**
    *   Open a Gemini tab.
    *   Type "My Awesome Prompt" into the prompt box. Do NOT submit.
    *   Switch to another browser tab (or blur the browser window).
    *   **Verify:** The Gemini tab's title should change to "My Awesome Prompt".
    *   Check the Gemini tab's console for logs about receiving the message and updating the title.
    *   Check the background script's console for logs about sending the message.
4.  **Scenario (Empty Prompt):**
    *   Open a new Gemini tab (or clear the prompt box in an existing one).
    *   Switch to another browser tab.
    *   **Verify:** The Gemini tab's title should *not* change (or if it was "Gemini", it remains "Gemini").
    *   Check console logs indicating prompt was empty.
```

---

### **Prompt 7: Primary Titling - Sidebar DOM Interaction in Content Script (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 6 implemented the fallback titling (prompt text on blur).

**Current Goal:** In `content.js`, implement functions to identify and get the text of the *currently selected* sidebar conversation title (Spec 4.1.1).

**Specifications (`content.js`):**
1.  **Identify Selected Sidebar Conversation Title Element:**
    *   Spec 6.3.2 suggests this element might be a `div` with class `conversation-title` that also has a distinct styling/class when "selected" (e.g., `gds-label-l` vs `gds-body-m` or an explicit `selected` class on an ancestor). This requires careful inspection of Gemini's DOM.
    *   Create a function, e.g., `getSelectedConversationTitleElement()`. This function should:
        *   Find all potential conversation title elements in the sidebar.
        *   Determine which one is "selected" or "active". This might involve checking for a specific class on the element itself, its parent, or an ancestor `a` tag or `div` that wraps the title.
        *   **Selector Guidance (to be verified by developer):** Look for a list of chat items. Each item might have a title. The active/selected item will have a visual distinction. Try to find a stable class or attribute that marks the *active* chat item's title. For example, it could be something like: `document.querySelector('.chat-history-list .selected .conversation-title-text-element')` (this is a hypothetical example).
        *   Log if the element is not found.
    *   **Note for LLM:** Emphasize that the developer *must* inspect the live Gemini DOM to find a reliable selector for the *selected* conversation title. The provided example is a guess.
2.  **Get Selected Sidebar Title Text:**
    *   Create a function `getSelectedSidebarTitleText()` that:
        *   Calls `getSelectedConversationTitleElement()`.
        *   If the element is found, returns its `innerText` or `textContent`.
        *   If not found (e.g., new chat, or element structure changed), returns `null` or an empty string. This is important for later logic.

**Output:**
1.  The complete, updated content for `content.js`, including these new functions. Existing functions (`getPromptText`, `setTabTitle`, message listener etc.) should remain.

**Testing:**
After this step, the developer should be able to:
1. Update `content.js`.
2. Reload the unpacked extension.
3. Open `https://gemini.google.com/` and ensure there are some conversations in the sidebar.
4. In the Gemini tab's developer console:
    *   Select a conversation in the sidebar.
    *   Execute `getSelectedConversationTitleElement()` and verify it logs or returns the correct DOM element for the selected title.
    *   Execute `getSelectedSidebarTitleText()` and verify it returns the exact text of the selected conversation's title from the sidebar.
    *   Select a *different* conversation in the sidebar.
    *   Re-execute `getSelectedSidebarTitleText()` and verify it returns the new selected title.
    *   If possible, navigate to a state where no conversation is explicitly selected (e.g., a brand new chat before first submission). Execute `getSelectedSidebarTitleText()` and verify it returns `null` or an empty string.
```

---

### **Prompt 8: Primary Titling - Dynamic Updates via MutationObserver (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 7 added functions to `content.js` to get the selected sidebar conversation title.

**Current Goal:** In `content.js`, set up a `MutationObserver` to monitor changes in the Gemini sidebar. When the selected conversation changes or its title is updated, the observer should immediately update the document title using the sidebar title. This is the primary titling logic (Spec 4.1.1).

**Specifications (`content.js`):**
1.  **MutationObserver Setup:**
    *   At an appropriate point in `content.js` (e.g., after an initial delay or when the sidebar is likely to be present), initialize a `MutationObserver`.
    *   The observer should watch a stable ancestor element that contains the list of sidebar conversations. (Developer needs to identify this selector, e.g., a `div` that wraps the chat history).
    *   Configure the observer to watch for `childList` and `subtree` changes. Also consider `characterData` if titles can be edited in place and only their text nodes change.
2.  **Observer Callback Logic:**
    *   When the `MutationObserver`'s callback is triggered:
        *   Call `const sidebarTitle = getSelectedSidebarTitleText();`.
        *   **If `sidebarTitle` is found (not null and not empty):**
            *   Call `setTabTitle(sidebarTitle);`.
            *   Log `Tab title updated from sidebar: "${sidebarTitle}"`.
        *   (If `sidebarTitle` is null/empty, meaning no conversation is selected or it has no title, do nothing for now. The blur logic will handle cases for new chats. This ensures sidebar title takes precedence if available).
3.  **Observer Initialization:**
    *   The observer needs to be started. Consider a slight delay or a check for the target observation node's existence before starting, as Gemini's UI might load progressively.
    *   `const sidebarContainer = document.querySelector('YOUR_SIDEBAR_CONTAINER_SELECTOR');`
    *   `if (sidebarContainer) { observer.observe(sidebarContainer, { childList: true, subtree: true, characterData: true }); } else { console.warn('Gemini Entitled Tabs: Sidebar container not found for MutationObserver.'); // Optionally, retry after a delay }`
    *   **Note for LLM:** The `YOUR_SIDEBAR_CONTAINER_SELECTOR` needs to be determined by inspecting Gemini's DOM. It should be the element that wraps all the conversation items in the sidebar.

**Output:**
1.  The complete, updated content for `content.js`. Ensure existing functionality (prompt handling, message listeners) is preserved and integrated where appropriate (though for now, this observer will act independently and more immediately).

**Testing:**
After this step, the developer should be able to:
1. Update `content.js`.
2. Reload the unpacked extension.
3. Open `https://gemini.google.com/` with existing conversations.
4. **Scenario 1 (Switching Conversations):**
    *   Click on Conversation A in the sidebar. Verify the tab title *immediately* updates to Conversation A's title.
    *   Click on Conversation B in the sidebar. Verify the tab title *immediately* updates to Conversation B's title.
5.  **Scenario 2 (New Chat Gets Title):**
    *   Start a new chat. Type a prompt (e.g., "Summarize AI impact").
    *   Submit the prompt.
    *   Wait for Gemini to process and assign a title to this new chat in the sidebar.
    *   **Verify:** As soon as the title appears in the sidebar for the selected chat, the tab title *immediately* updates to this new sidebar title.
6.  **Scenario 3 (Title Renaming - if Gemini supports it):**
    *   If Gemini allows renaming chats directly in the sidebar: Rename a chat.
    *   **Verify:** The tab title *immediately* updates to the new, renamed title.
7. Check the Gemini tab's console for logs from the `MutationObserver` callback.
```

---

### **Prompt 9: Integrating Titling Logic - Unified Update Function (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 8 implemented the `MutationObserver` for sidebar title updates in `content.js`.

**Current Goal:** Refactor `content.js` to integrate the sidebar-driven and prompt-driven titling logic, ensuring correct prioritization as per Spec 4.1.

**Specifications (`content.js`):**
1.  **State Variables:**
    *   Introduce module-level state variables:
        *   `let currentKnownSidebarTitle = null;` (To store the latest title seen from the sidebar)
        *   `let lastPromptTextOnBlur = null;` (To store prompt text captured on blur)
        *   `let isTabFocused = true;` (To track tab focus state from within content script, potentially helpful, or rely on blur messages)
        *   Let's simplify and primarily react to events. We need to ensure sidebar title takes precedence.

2.  **Central Title Update Function `updateDocumentTitle()`:**
    *   Create a new function, `function updateDocumentTitle() { ... }`.
    *   **Logic within `updateDocumentTitle()`:**
        1.  Retrieve the current selected sidebar title: `const sidebarTitle = getSelectedSidebarTitleText();`
        2.  **If `sidebarTitle` is not null and not empty (and consists of more than just whitespace):**
            *   `setTabTitle(sidebarTitle);`
            *   `currentKnownSidebarTitle = sidebarTitle;` // Update state
            *   `lastPromptTextOnBlur = null;` // Sidebar title takes precedence, clear any stale prompt title
            *   Log: `Title set from sidebar: "${sidebarTitle}"`
            *   Return from the function.
        3.  **Else (no current sidebar title, or it's empty):**
            *   `currentKnownSidebarTitle = null;` // Update state
            *   If `lastPromptTextOnBlur` is not null and not empty (this value is set by the blur handler):
                *   `setTabTitle(lastPromptTextOnBlur);`
                *   Log: `Title set from prompt on blur: "${lastPromptTextOnBlur}"`
                *   Return.
        4.  **Else (neither sidebar nor blur-captured prompt applies):**
            *   Do nothing (respects Spec 4.1.3 - No Modification by Extension if conditions not met).
            *   The original document title (e.g., "Gemini") will remain.
            *   Log: "No applicable title source found (sidebar or prompt-on-blur)."

3.  **Modify `MutationObserver` Callback:**
    *   When the observer callback fires:
        *   Call `updateDocumentTitle();` (This function now contains the logic to check sidebar first).

4.  **Modify `chrome.runtime.onMessage` Listener (for `GEMINI_TAB_BLURRED`):**
    *   When `GEMINI_TAB_BLURRED` message is received:
        *   `isTabFocused = false;` (optional state tracking)
        *   Retrieve current prompt text: `const promptText = getPromptText();`
        *   **If `promptText` is not empty (and not just whitespace):**
            *   `lastPromptTextOnBlur = promptText;` // Store it
        *   **Else:**
            *   `lastPromptTextOnBlur = null;` // Clear if prompt is now empty on blur
        *   Call `updateDocumentTitle();`
            *   This ensures that if a sidebar title *became* active just before blur, it would still be picked up. If not, and `promptText` was valid, `lastPromptTextOnBlur` will be used by `updateDocumentTitle`.

5.  **Initial Call:**
    *   Consider calling `updateDocumentTitle()` once when the content script loads (e.g., after a short delay, to allow Gemini UI to settle a bit), to set an initial title if a conversation is already selected.
    *   `setTimeout(updateDocumentTitle, 1000); // Initial check after 1s`

6.  **(Optional) Tab Focus/Unfocus handling within content.js:**
    *   Listen to `window.addEventListener('focus', ...)` and `window.addEventListener('blur', ...)` in `content.js`.
    *   On `window.focus`: `isTabFocused = true; lastPromptTextOnBlur = null; updateDocumentTitle();` (clear blur prompt, re-evaluate)
    *   The background script messaging for blur is generally more reliable for tab-level blur. For now, let's stick to the background script message for triggering the "prompt on blur" capture. The `updateDocumentTitle` function is the key consolidator.

**Output:**
1.  The complete, updated content for `content.js`, with the new `updateDocumentTitle` function and modified observer/message listener logic.

**Testing:**
After this step, the developer should be able to:
1. Update `content.js`.
2. Reload the unpacked extension.
3. **Scenario 1 (New Tab, Type, Blur):**
    *   Open a new Gemini tab. Title should be "Gemini".
    *   Type "Test Prompt 1" in the prompt box.
    *   Switch to another tab. Title should change to "Test Prompt 1".
4.  **Scenario 2 (Type, Blur, Submit, Sidebar Title Appears):**
    *   Continue from Scenario 1. Switch back to Gemini tab.
    *   Submit "Test Prompt 1". Wait for Gemini to process and assign a sidebar title (e.g., "Analysis of Test Prompt 1").
    *   **Verify:** Tab title immediately changes to "Analysis of Test Prompt 1".
5.  **Scenario 3 (Existing Chat Selected on Load):**
    *   Open a Gemini tab that directly loads into an existing chat with a title.
    *   **Verify:** Tab title should quickly update to the selected chat's sidebar title (due to initial `updateDocumentTitle` call or first observer trigger).
6.  **Scenario 4 (Switching to Chat with Title, then New Chat, then Type, then Blur):**
    *   Select an existing chat with title "Chat A". Tab title becomes "Chat A".
    *   Click "New Chat" (or whatever action clears sidebar selection and presents an empty prompt). Tab title might revert to "Gemini" or stay "Chat A" briefly until blur or further action, depending on `updateDocumentTitle`'s logic if `getSelectedSidebarTitleText` returns null. `updateDocumentTitle` should handle this: if sidebar title becomes null, it won't set anything until blur logic provides `lastPromptTextOnBlur`.
    *   Type "New Chat Prompt" in the prompt box.
    *   Switch to another tab. Tab title should change to "New Chat Prompt".
7.  **Console Logs:** Observe console logs to understand the decision-making process of `updateDocumentTitle`.
```

---

### **Prompt 10: Refinements - Robust Selectors and Configuration (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 9 integrated the core titling logic in `content.js`.

**Current Goal:** Refine DOM selectors in `content.js` for robustness and move them to a configuration object for easier maintenance (Spec 4.1.1, 6.3.2, Phase 4.1).

**Specifications (`content.js`):**
1.  **Configuration Object for Selectors:**
    *   At the top of `content.js`, create a constant object, e.g., `const SELECTORS = { ... };`.
    *   Move all hardcoded DOM selector strings into this object. Examples:
        *   `promptInput:` (For `getPromptInputElement`) - e.g., `'div.ql-editor'` or `'div.ql-editor p'`
        *   `selectedConversationTitle:` (For `getSelectedConversationTitleElement`) - e.g., `'.selected-chat-item .title-text-class'` (This is highly dependent on Gemini's actual structure and needs careful verification)
        *   `sidebarContainer:` (For `MutationObserver` target) - e.g., `'#chat-history-panel'`
    *   **LLM Note:** These selectors are examples. The prompt should emphasize that the developer using the generated code *must* verify and update these selectors by inspecting the live `gemini.google.com` DOM.
2.  **Update Functions to Use Configured Selectors:**
    *   Modify `getPromptInputElement()`, `getSelectedConversationTitleElement()`, and the `MutationObserver` setup to use the selectors from the `SELECTORS` object (e.g., `document.querySelector(SELECTORS.promptInput)`).
3.  **Review Selectors for Robustness:**
    *   Briefly advise on choosing selectors: Prefer stable IDs if available and unique. Prefer classes that seem semantic over purely stylistic or deeply nested structural paths. Consider `data-*` attributes if Gemini uses them for key elements.
4.  **Add Comments:**
    *   Add comments next to each selector in the `SELECTORS` object explaining *why* that selector was chosen or what it targets, and a note that it might need updates if Gemini's UI changes.

**Output:**
1.  The complete, updated content for `content.js`, with selectors centralized in a `SELECTORS` object and functions updated to use them.

**Testing:**
After this step, the developer should be able to:
1.  **Crucially, before running:** Inspect `gemini.google.com` and update the selector strings in the `SELECTORS` object in `content.js` to match the current Gemini UI. This is a manual verification step for the developer.
2.  Update `content.js`.
3.  Reload the unpacked extension.
4.  Thoroughly re-test all core functionalities from previous prompts (new tab, type, blur; submit prompt; switch conversations; load existing chat). All should work as before, but now using the configured selectors.
5.  If any functionality breaks, it's likely due to incorrect selectors in the `SELECTORS` object. Debug by logging the elements found by the selectors or `null` if not found.
```

---

### **Prompt 11: Refinements - Error Handling (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 10 centralized DOM selectors in `content.js`.

**Current Goal:** Implement graceful error handling for DOM operations in `content.js` to prevent the extension from breaking if Gemini's UI changes and selectors fail (Spec 8.1).

**Specifications (`content.js`):**
1.  **`getPromptInputElement()`:**
    *   Wrap the `document.querySelector(SELECTORS.promptInput)` call in a `try...catch` block.
    *   If an error occurs or the element is not found, log a warning to the console (e.g., `console.warn("Gemini Entitled Tabs: Prompt input element not found using selector:", SELECTORS.promptInput);`) and return `null`.
2.  **`getSelectedConversationTitleElement()`:**
    *   Wrap the DOM querying logic in a `try...catch` block.
    *   If an error occurs or the element is not found, log a warning (e.g., `console.warn("Gemini Entitled Tabs: Selected conversation title element not found using selector:", SELECTORS.selectedConversationTitle);`) and return `null`.
3.  **`MutationObserver` Setup:**
    *   When trying to find `sidebarContainer` for the observer:
        *   If `document.querySelector(SELECTORS.sidebarContainer)` returns `null`, log a warning (e.g., `console.warn("Gemini Entitled Tabs: Sidebar container for MutationObserver not found using selector:", SELECTORS.sidebarContainer);`) and do not start the observer.
4.  **General Principle:** Ensure that if a critical DOM element cannot be found, the function relying on it fails gracefully (e.g., returns `null` or an empty string) rather than throwing an unhandled error that could break the script or the page. The `updateDocumentTitle()` function should already handle `null` values from `getSelectedSidebarTitleText()` and `getPromptText()` correctly.

**Output:**
1.  The complete, updated content for `content.js` with added `try...catch` blocks and null checks for critical DOM operations.

**Testing:**
After this step, the developer should be able to:
1. Update `content.js`.
2. Reload the unpacked extension.
3. **Normal Operation:** Verify all functionalities still work as expected (assuming correct selectors).
4.  **Simulate Selector Failure (Developer Task):**
    *   Temporarily change one of the selectors in the `SELECTORS` object to something invalid (e.g., `SELECTORS.promptInput = '.non-existent-class';`).
    *   Reload the extension and open Gemini.
    *   **Verify:** The extension should not throw visible errors that break the Gemini page.
    *   Check the console for the warning messages you implemented (e.g., "Prompt input element not found").
    *   The specific functionality relying on that selector should gracefully fail (e.g., if prompt input is not found, typing in it and blurring should not change the title based on prompt text). Other functionalities (e.g., sidebar title updates) should still work if their selectors are valid.
    *   Restore the correct selector and re-test. Repeat for other key selectors.
```

---

### **Prompt 12: Refinements - MutationObserver Optimization & Final Code Review (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 11 added error handling to `content.js`.

**Current Goal:**
1.  Optimize `MutationObserver` configuration in `content.js` (Spec 5.1, Phase 4.3).
2.  Perform a final review of `content.js` and `background.js` for clarity, comments, and adherence to best practices.
3.  Finalize `manifest.json` with icons (placeholder) and ensure all permissions are correct and minimal.

**Specifications:**

**`content.js`:**
1.  **`MutationObserver` Configuration:**
    *   Review the `observer.observe(sidebarContainer, config)` call.
    *   The `config` object (e.g., `{ childList: true, subtree: true, characterData: true }`) should be as specific as possible.
        *   `childList`: Likely needed if new conversation items are added/removed or their internal structure changes affecting selection.
        *   `subtree`: Likely needed if titles are nested and changes occur deeper.
        *   `attributes`: Consider if selection is marked by an attribute change on a stable element (e.g., `aria-selected`). If so, add `attributes: true` and potentially `attributeFilter: ['aria-selected', 'class']` (if class changes denote selection).
        *   `characterData`: Useful if titles are edited in-place and only text nodes change.
    *   The goal is to avoid overly broad observation if more specific options achieve the same result, but correctness is key. The current `{ childList: true, subtree: true, characterData: true }` is a reasonable default if specific attribute changes are not easily identifiable for selection.
    *   Add a comment explaining the chosen observer configuration.
2.  **Code Review (Self-Correction/Improvement):**
    *   Read through `content.js`. Add comments to explain complex parts or non-obvious logic.
    *   Ensure variable names are clear.
    *   Ensure functions have a single responsibility where possible.
    *   Remove any redundant `console.log` statements meant for temporary debugging, keeping only essential logs (like warnings or very high-level status, e.g., "Gemini Entitled Tabs initialized"). Spec 8.2 mentions minimal logging in production. A `DEBUG` flag pattern could be used if more logging is desired during development. For now, aim for minimal.

**`background.js`:**
1.  **Code Review:**
    *   Similarly, review `background.js` for clarity, comments.
    *   Ensure `lastFocusedGeminiTabId` logic is sound and handles edge cases gracefully (e.g., tab closed before message sent). The `chrome.tabs.sendMessage` callback can check for `chrome.runtime.lastError`.
        *   Example for `sendMessage`:
            ```javascript
            // In background.js, when sending message
            if (lastFocusedGeminiTabId !== null) {
                chrome.tabs.sendMessage(lastFocusedGeminiTabId, { type: "GEMINI_TAB_BLURRED" }, response => {
                    if (chrome.runtime.lastError) {
                        console.log("Gemini Entitled Tabs: Error sending message to tab", lastFocusedGeminiTabId, chrome.runtime.lastError.message);
                        // Potentially clear lastFocusedGeminiTabId if tab is no longer accessible
                    }
                });
            }
            ```
    *   Minimize logging.

**`manifest.json`:**
1.  **Icons:**
    *   Add an `icons` property with placeholder paths for 16, 48, and 128px icons. The LLM can suggest standard names like `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`. Actual icon files are not generated here.
    *   Example: `"icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }`
2.  **Permissions Review:**
    *   Confirm necessary permissions are:
        *   `"tabs"` (for `chrome.tabs.*` APIs in background script)
        *   No other special permissions like `"scripting"` or `"activeTab"` should be needed given the current design (content scripts declared in manifest, `host_permissions` grant access).
    *   `host_permissions`: Must include `"https://gemini.google.com/*"`.
3.  Ensure `description`, `name`, `version` are appropriate.

**Output:**
1.  The complete, updated content for `content.js`.
2.  The complete, updated content for `background.js`.
3.  The complete, updated content for `manifest.json`.

**Testing:**
After this step, the developer should:
1. Create placeholder icon files (e.g., simple colored squares) in an `icons` directory if they want to see them in `chrome://extensions`.
2. Update all three files (`content.js`, `background.js`, `manifest.json`).
3. Reload the unpacked extension.
4. **Full Regression Test:** Re-test all major scenarios:
    *   New tab, empty: title "Gemini".
    *   Type in prompt, blur tab: title is prompt text.
    *   Submit prompt, Gemini assigns sidebar title: title is sidebar title.
    *   Switch between existing chats: title updates to selected chat's sidebar title.
    *   Close Gemini tab: no errors in background script console related to sending messages to closed tab (due to `lastError` check).
    *   Open non-Gemini tab: no extension activity.
5.  Observe console logs in both content script and background script – they should be minimal and informative, not noisy.
6.  Check `chrome://extensions` to see if the extension icon (placeholder) and description appear correctly.
```

---

### **Prompt 13: Final Test - "As Is" Title Handling (Completed: [ YES ])**

```text
You are an expert AI programmer. We are building the "Gemini Entitled Tabs" Chrome extension.

**Previous Step:** Prompt 12 performed final code reviews, optimizations, and manifest updates. The core functionality should be complete.

**Current Goal:** Specifically test the requirement that tab titles are used "as is" without modification, especially regarding length and special characters (Spec 4.1.1, 4.2). This is primarily a testing step, assuming the `setTabTitle(newTitle)` function simply does `document.title = newTitle;`.

**Specifications & Testing Procedures:**

**Testing `content.js` behavior (no code changes expected unless `setTabTitle` was doing manipulation):**

1.  **Very Long Sidebar Title (Spec 4.2 "No Truncation by Extension"):**
    *   **Setup:** In Gemini, create or identify a chat session that has a very long title in the sidebar. If Gemini truncates it visually in the sidebar, that's fine. The goal is to see what title the extension sets.
    *   **Action:** Ensure this chat is selected.
    *   **Verification:**
        *   Observe the browser tab's title. It might be visually truncated by the browser UI itself.
        *   **Crucially:** Open the developer tools for the Gemini tab and inspect the `<title>` element in the `<head>` of the document (e.g., `document.head.querySelector('title').textContent`).
        *   **Verify:** The content of the `<title>` element must be the *full, untruncated* title from the Gemini sidebar.
        *   Use the browser's "Search Tabs" feature (Cmd/Ctrl-Shift-A) and try searching for a unique phrase from the *end* of the long title. It should find the tab.

2.  **Sidebar Title with Special Characters (Spec 4.1.1 "as is"):**
    *   **Setup:** If possible, create or rename a Gemini chat to include various special characters in its sidebar title (e.g., `& < > " ' / \ | ? * : - _ + = % # @ ! ( ) [ ] { }`).
    *   **Action:** Select this chat.
    *   **Verification:**
        *   Observe the browser tab's title.
        *   Inspect the `<title>` element content via developer tools.
        *   **Verify:** The title should contain the special characters exactly as they appear in the sidebar. (HTML entities like `&amp;` for `&` are expected if the source text in the DOM is already encoded that way, or if `textContent` vs `innerHTML` differences come into play when reading from the source, but `document.title` usually handles this fine). The key is that the extension itself isn't adding extra escaping or stripping.

3.  **Empty Sidebar Title (Spec 4.1.1):**
    *   **Setup:** If Gemini can produce a state where a selected chat in the sidebar has an effectively empty or whitespace-only title.
    *   **Action:** Select such a chat.
    *   **Verification:**
        *   The `getSelectedSidebarTitleText()` should ideally return `null` or an empty string, which `updateDocumentTitle()` handles by not setting a title from the sidebar. If `lastPromptTextOnBlur` is also null, the tab title should remain "Gemini" (or whatever the default is).
        *   If the sidebar truly provides an empty string as a "valid" title, the tab title should become empty. The spec says "use this title 'as is'". This scenario depends on Gemini's behavior. The current logic in `updateDocumentTitle` checks for `sidebarTitle` being non-null and non-empty before using it. If an empty string is a valid "as is" title, this check might need refinement: `if (sidebarTitle !== null) { ... }` and then handle empty string if that's desired. Given spec 4.1.3 "Default State: No Modification", an empty string from sidebar should probably lead to no modification *by the extension*, letting Gemini's default apply. The current check `if (sidebarTitle && sidebarTitle.trim() !== "")` is good for this.

**No Code Output Expected from LLM for this prompt unless the testing reveals a flaw in `setTabTitle` or title-fetching logic related to "as is" handling.** This prompt is primarily a test plan guide for the developer.

**If issues are found:**
*   The LLM could be asked to refine `getSelectedSidebarTitleText()` if it's improperly trimming or altering text.
*   The LLM could be asked to confirm `setTabTitle(text)` correctly assigns raw text to `document.title`.

This concludes the planned iterative steps for building the Gemini Entitled Tabs extension.
```
