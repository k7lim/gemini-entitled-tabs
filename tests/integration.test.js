// ABOUTME: Integration tests for Gemini Entitled Tabs extension
// ABOUTME: Tests extension functionality in simulated browser environment

describe('Extension Integration Tests', () => {
  test('manifest.json has required properties', () => {
    const fs = require('fs');
    const path = require('path');
    
    const manifestPath = path.join(__dirname, '../manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('Gemini Entitled Tabs');
    expect(manifest.version).toBe('1.0');
    expect(manifest.description).toContain('Dynamically updates Gemini tab titles');
    expect(manifest.permissions).toContain('tabs');
    expect(manifest.content_scripts).toHaveLength(1);
    expect(manifest.content_scripts[0].matches).toContain('https://gemini.google.com/*');
    expect(manifest.background.service_worker).toBe('background.js');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBe('icons/icon16.png');
    expect(manifest.icons['48']).toBe('icons/icon48.png');
    expect(manifest.icons['128']).toBe('icons/icon128.png');
    expect(manifest.host_permissions).toContain('https://gemini.google.com/*');
  });

  test('content script files exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    expect(fs.existsSync(path.join(__dirname, '../content.js'))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, '../background.js'))).toBe(true);
  });

  test('content script has required functions', () => {
    const fs = require('fs');
    const path = require('path');
    
    const contentScript = fs.readFileSync(path.join(__dirname, '../content.js'), 'utf8');
    
    expect(contentScript).toContain('function getPromptInputElement()');
    expect(contentScript).toContain('function getPromptText()');
    expect(contentScript).toContain('function setTabTitle(newTitle)');
    expect(contentScript).toContain('function getSelectedConversationTitleElement()');
    expect(contentScript).toContain('function getSelectedSidebarTitleText()');
    expect(contentScript).toContain('chrome.runtime.onMessage.addListener');
    expect(contentScript).toContain('MutationObserver');
    expect(contentScript).toContain('initializeMutationObserver');
    expect(contentScript).toContain('updateDocumentTitle');
    expect(contentScript).toContain('currentKnownSidebarTitle');
    expect(contentScript).toContain('lastPromptTextOnBlur');
    expect(contentScript).toContain('const SELECTORS = {');
    expect(contentScript).toContain('promptInput:');
    expect(contentScript).toContain('selectedConversationTitle:');
    expect(contentScript).toContain('sidebarContainer:');
    expect(contentScript).toContain('try {');
    expect(contentScript).toContain('catch (error)');
    expect(contentScript).toContain('console.warn');
  });

  test('background script has required functionality', () => {
    const fs = require('fs');
    const path = require('path');
    
    const backgroundScript = fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8');
    
    expect(backgroundScript).toContain('lastFocusedGeminiTabId');
    expect(backgroundScript).toContain('chrome.tabs.onActivated.addListener');
    expect(backgroundScript).toContain('chrome.windows.onFocusChanged.addListener');
    expect(backgroundScript).toContain('gemini.google.com');
  });
});