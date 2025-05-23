// ABOUTME: Content script for Gemini Entitled Tabs extension
// ABOUTME: Handles DOM interaction and tab title updates on Gemini pages

console.log("Gemini Entitled Tabs content script loaded on:", window.location.href);

function getPromptInputElement() {
  const element = document.querySelector('div.ql-editor p') || document.querySelector('div.ql-editor');
  if (!element) {
    console.log("Prompt input element not found");
  }
  return element;
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