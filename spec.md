**Developer-Ready Specification: Gemini Entitled Tabs - Browser Extension**

**Version:** 1.0
**Date:** March 28, 2024

**1. Introduction & Overview**
This document outlines the specifications for a browser extension, "Gemini Entitled Tabs," designed for Chromium-based browsers (specifically Brave). The primary purpose of this extension is to dynamically modify the browser tab titles of open Gemini (`gemini.google.com`) sessions. Instead of the generic "Gemini" title, the extension will use more descriptive information derived from the current chat content, significantly improving tab identification and searchability, especially when using features like Chrome/Brave's "Search Tabs" (`Cmd-Shift-A` or `Ctrl-Shift-A`).

**2. Goals & Objectives**
*   **Primary Goal:** Enhance the usability of multiple Gemini tabs by providing unique and context-rich tab titles.
*   **Objective 1:** Automatically update tab titles based on the currently selected conversation in the Gemini sidebar.
*   **Objective 2:** As a fallback for new, unsubmitted chats, update tab titles based on the initial text typed into the prompt box.
*   **Objective 3:** Ensure the extension operates silently without requiring user interaction for its core functionality.
*   **Objective 4:** Prioritize simplicity in implementation and minimal performance impact.

**3. Target Audience & Platform**
*   **Target Users:** Users of Gemini (`gemini.google.com`) who frequently work with multiple chat sessions simultaneously in a Chromium-based browser.
*   **Target Browser:** Chromium-based browsers (user specifically uses Brave). Initial development and testing should focus on compatibility with recent versions of Brave/Chrome.

**4. Functional Requirements**

   **4.1. Dynamic Tab Title Modification Logic:**
   The extension will monitor Gemini tabs and update their titles based on the following prioritized logic:

   *   **4.1.1. Primary Source: Selected Sidebar Conversation Title**
        *   **Condition:** A conversation is selected/active within the Gemini web interface's sidebar.
        *   **Content Source:** The text content of the title associated with the *currently selected* conversation in the Gemini sidebar.
        *   **Update Trigger:** The tab title must update *immediately* whenever the selected conversation's title appears for the first time (e.g., after a new chat is named) or changes (e.g., user renames it, or Gemini updates it).
        *   **Precedence:** This rule takes absolute precedence. If a conversation is selected and has a title, that title will be used for the tab.
        *   **Handling of Sidebar Titles:** If the sidebar title is unusually long, empty, or contains unconventional characters, the extension must use this title "as is" without attempting to clean, shorten, or modify it. The goal is to directly mirror the sidebar's provided title.

   *   **4.1.2. Fallback Source: Typed Prompt Text (for New/Unsubmitted Chats)**
        *   **Condition:** This rule applies *only if* no conversation is currently selected in the sidebar (typically indicating a new chat tab where a prompt has been typed but not yet submitted).
        *   **Content Source:** The full text content currently present in the main prompt input field on the Gemini page.
        *   **Update Trigger:** The tab title must update when the user has typed text into the prompt input field *and* the Gemini tab subsequently loses focus (i.e., an "on blur" event for the tab or its window). The title should *not* update live as the user types.
        *   **Transition:** Once a prompt derived from this rule is submitted and Gemini assigns an official title to it in the sidebar (making it the selected conversation), rule 4.1.1 will take over, and the tab title will update to the new sidebar title.

   *   **4.1.3. Default State: No Modification by Extension**
        *   **Condition:**
            *   A new Gemini tab is opened and is completely empty (no prompt text typed, no conversation selected).
            *   If, for any reason, neither the conditions for 4.1.1 nor 4.1.2 are met.
        *   **Behavior:** The extension must *not* modify the tab title. The title will remain as whatever the browser or the Gemini website initially set it to (e.g., "Gemini").

   **4.2. Tab Title Formatting:**
   *   **Content:** The browser tab title set by the extension must *only* consist of the content string derived from either rule 4.1.1 or 4.1.2.
   *   **No Suffix/Prefix:** The extension must *not* append or prepend any fixed strings (e.g., " - Gemini") to the derived title. The Gemini favicon is considered sufficient for site identification.
   *   **No Truncation by Extension:** The extension must use the full, untruncated string for the title. This is critical for maximizing searchability with the browser's built-in tab search functionality. (Browser UI itself may truncate visually, but the underlying `<title>` element should be complete).

   **4.3. Scope of Operation:**
   *   **Target URLs:** The extension's functionality must be active *exclusively* on pages whose URL is `gemini.google.com`. It should not affect any other domains or subdomains.
   *   **Automatic Activation:** The extension should automatically activate and apply its logic whenever a tab navigates to, or is opened on, `gemini.google.com`.
   *   **No Manual Toggle:** No user interface element (e.g., a browser action button) is required to enable or disable the core tab titling functionality. If the extension is installed and enabled in the browser, it should be active on the target URL.

   **4.4. User Interface / Feedback:**
   *   **Silent Operation:** The extension must operate silently in the background.
   *   **No Visible UI:** There should be no visible UI elements specific to the extension (e.g., no popups, no browser action button icon that requires interaction for core functionality, no desktop notifications).
   *   **Implicit Feedback:** The dynamic change of the Gemini tab's title itself is the sole intended feedback to the user.

**5. Non-Functional Requirements**

   *   **5.1. Performance:**
        *   The extension must have a minimal impact on browser performance and the responsiveness of the Gemini web application.
        *   DOM manipulations and event listeners should be efficient. Avoid frequent, heavy computations or DOM queries, especially during user input.
        *   The "on blur" trigger for typed prompts is chosen specifically to minimize performance overhead compared to live typing listeners.

   *   **5.2. Reliability:**
        *   The extension should consistently apply the titling logic as defined.
        *   It should be resilient to minor changes in the Gemini page structure, although major redesigns might require updates (see Maintainability).

   *   **5.3. Security:**
        *   The extension must request minimal permissions necessary for its operation (likely `tabs` to modify titles and `scripting` or `activeTab` to interact with page content on `gemini.google.com`).
        *   It must not collect, store, or transmit any user data or browsing history. All operations are local and transient.

   *   **5.4. Maintainability:**
        *   Code should be clean, well-commented, and organized to facilitate future updates, especially if Gemini's DOM structure changes.
        *   Selectors for DOM elements should be as robust as possible, but acknowledge that they are subject to change by Google.

   *   **5.5. Usability (of the extension):**
        *   The extension should "just work" once installed, requiring no configuration or interaction from the user.

**6. Technical Architecture & Design**

   *   **6.1. Extension Type (Manifest V3):**
        *   **Content Script:** This will be the primary component, injected into `gemini.google.com` pages. It will be responsible for:
            *   Observing the DOM for changes in the selected sidebar conversation title.
            *   Observing the DOM for text in the prompt input field.
            *   Modifying the `document.title` of the page.
        *   **Background Service Worker (Optional but Recommended):** While the "on blur" for the *tab* can sometimes be managed from a content script observing window blur/focus, a more robust way to detect tab deactivation/activation is via the `chrome.tabs.onActivated` and `chrome.windows.onFocusChanged` events in a background script. The background script would then message the relevant content script to trigger the title update based on the prompt input if necessary. This decouples tab state logic from the content script.
            *   If using a background script, it would also handle the "on blur" (tab deactivation) logic to trigger a check in the content script.

   *   **6.2. Key Components and Responsibilities:**
        *   **Content Script (`content.js`):**
            *   Initializes upon page load on `gemini.google.com`.
            *   Sets up `MutationObserver` to monitor changes in the Gemini sidebar, specifically watching for changes to the selected conversation title or the selection itself.
            *   Identifies the prompt input field.
            *   Implements functions to extract:
                *   The title of the currently selected sidebar conversation.
                *   The text from the prompt input field.
            *   Implements a function to update `document.title`.
            *   Listens for messages from the background script (if used) regarding tab blur events.
            *   Alternatively, if no background script for blur, listens for `window.blur` events.
        *   **Background Service Worker (`background.js`) (Recommended):**
            *   Listens to `chrome.tabs.onUpdated` to inject the content script when a tab's URL is `gemini.google.com` and status is `complete`.
            *   Listens to `chrome.tabs.onActivated` to detect when the user switches to a different tab.
            *   Listens to `chrome.windows.onFocusChanged` to detect when the browser window loses focus.
            *   When a Gemini tab loses focus, it sends a message to the content script of that tab to trigger the "typed prompt as title" logic if applicable.

   *   **6.3. DOM Element Identification Strategy:**
        *   The extension will rely on querying the DOM to find relevant elements. Selectors should be:
            *   Specific enough to target the correct elements.
            *   Resilient to minor UI changes (e.g., prefer IDs if stable, or more semantic class combinations over highly structural paths).
        *   **Key Element Locators (Initial Guidance - Developer to verify and refine):**
            *   **Selected Conversation Title in Sidebar:** Needs a reliable selector for the element containing the title of the *active/selected* chat in the sidebar. User example indicated a `div` with class `conversation-title` that also has a distinct styling/class when "selected" (e.g., `gds-label-l` vs `gds-body-m` or an explicit `selected` class on an ancestor). `MutationObserver` should watch the part of the DOM containing the list of conversations.
            *   **Prompt Input Field:** The text area where the user types their prompt. User example: `<div class="ql-editor ..."><p>PROMPT_TEXT</p></div>`.
        *   These selectors are critical and are the most likely part of the extension to break if Google updates the Gemini UI.

**7. Data Handling**
*   **No Persistent Data Storage:** The extension will not store any data persistently (e.g., using `chrome.storage` or `localStorage`).
*   **Transient Data:** All data processed (current sidebar title, prompt text) is transient, read directly from the DOM, and used only for updating the current tab's title.
*   **Privacy:** The extension will not collect or transmit any user information, chat content, or browsing activity.

**8. Error Handling & Logging**
*   **Graceful Degradation:** If DOM elements cannot be found (e.g., due to Gemini UI updates):
    *   The extension should not throw unhandled errors that break the Gemini page or the browser.
    *   It should silently fail to update the tab title for the affected logic path.
    *   The tab title would then simply remain as set by Gemini or the browser.
*   **Console Logging:**
    *   Minimal logging in the production version.
    *   During development, `console.log` can be used for debugging selector issues or event firing.
    *   Consider a `DEBUG` flag that can be toggled during development to enable more verbose logging.
    *   Log critical errors (e.g., unexpected issues during initialization) to the console.

**9. Testing Plan**

   *   **9.1. Unit Tests (Optional but Recommended for helper functions):**
        *   If any complex logic is abstracted into helper functions (e.g., parsing specific DOM structures, if not straightforward), these could be unit-tested.

   *   **9.2. Manual Functional Testing (Core Scenarios):**
        *   **Scenario 1 (New, Empty Tab):** Open `gemini.google.com`. Verify tab title remains "Gemini" (or browser default).
        *   **Scenario 2 (Typed Prompt -> Blur):**
            1.  In a new Gemini tab, type text into the prompt box (e.g., "My test prompt").
            2.  Switch to another browser tab or application.
            3.  Verify the Gemini tab title updates to "My test prompt".
        *   **Scenario 3 (Typed Prompt -> Submit -> Sidebar Title):**
            1.  Follow Scenario 2.
            2.  Switch back to the Gemini tab, submit the prompt.
            3.  Wait for Gemini to process and assign a title in the sidebar (e.g., "Test Prompt Analysis").
            4.  Verify the tab title immediately updates to "Test Prompt Analysis".
        *   **Scenario 4 (Switching Selected Conversations):**
            1.  Have multiple conversations in the Gemini sidebar with distinct titles.
            2.  Click on Conversation A. Verify tab title matches Conversation A's title.
            3.  Click on Conversation B. Verify tab title immediately updates to Conversation B's title.
        *   **Scenario 5 (Gemini Renames/Updates Sidebar Title):**
            1.  If Gemini allows renaming chats, or if it auto-updates a chat title after more interaction, verify the tab title reflects this change immediately.
        *   **Scenario 6 (Very Long Sidebar Title):** Create or use a chat with a very long title. Verify the full title is set in `document.title` (can be checked via dev tools or by trying to search the full title in "Search Tabs").
        *   **Scenario 7 (Empty/Unusual Sidebar Title):** If possible to create a chat with an empty title in the sidebar, verify the tab title becomes empty.
        *   **Scenario 8 (Non-Gemini Tabs):** Verify the extension does not affect tab titles on any other website.

   *   **9.3. Edge Case Testing:**
        *   Rapidly typing in the prompt box and then blurring the tab.
        *   Rapidly switching between conversations in the sidebar.
        *   Duplicating a Gemini tab (behavior should be consistent for the new tab based on its state).
        *   Opening Gemini links in new tabs.
        *   Closing and reopening Gemini tabs.
        *   Network interruptions while Gemini is loading/updating.

   *   **9.4. Performance Testing (Observational):**
        *   With the extension active, use Gemini normally with multiple tabs open.
        *   Monitor browser task manager/activity monitor for excessive CPU or memory usage by the extension.
        *   Ensure no noticeable lag or unresponsiveness in the Gemini interface or browser.

   *   **9.5. Browser Compatibility Testing:**
        *   Primary: Latest stable version of Brave.
        *   Secondary: Latest stable version of Google Chrome.

**10. Future Considerations / Out of Scope for V1.0**
*   Support for non-Chromium browsers (e.g., Firefox).
*   User-configurable options (e.g., custom title formatting, truncation preferences, option to disable specific behaviors).
*   Support for other Google domains or subdomains if Gemini's URL structure evolves.
*   Advanced error reporting or UI for when selectors break.  The most potentially fragile part will be the DOM selectors for Gemini's interface, which may require careful implementation and updates if the site changes.

**11. Deliverables**
*   A packed Chromium browser extension (`.crx` or zipped source).
*   Source code, including `manifest.json`, content scripts, background scripts (if any), and any assets.
