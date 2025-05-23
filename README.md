# Gemini Entitled Tabs

A Chrome extension that dynamically updates Gemini tab titles based on chat content for better tab identification and searchability.

## Overview

This extension enhances the usability of multiple Gemini tabs by providing unique and context-rich tab titles instead of the generic "Gemini" title. It automatically updates tab titles based on the currently selected conversation in the sidebar or, as a fallback, the text typed in the prompt box for new chats.

## Features

- **Dynamic Tab Titles**: Automatically updates tab titles based on:
  1. Selected conversation title in the Gemini sidebar (primary)
  2. Typed prompt text for new/unsubmitted chats (fallback)
- **Silent Operation**: Works automatically without requiring user interaction
- **Minimal Performance Impact**: Efficient DOM monitoring with optimized event handling
- **Privacy-Focused**: No data collection, storage, or transmission

## How It Works

### Priority Logic

1. **Selected Sidebar Conversation**: When a conversation is selected in the Gemini sidebar, the tab title immediately updates to match that conversation's title
2. **Typed Prompt Fallback**: For new chats where no conversation is selected, the tab title updates to the prompt text when the tab loses focus
3. **Default State**: Empty tabs remain unchanged with the original "Gemini" title

### Technical Details

- Built for Manifest V3 Chrome extensions
- Uses content scripts to monitor DOM changes on `gemini.google.com`
- Implements MutationObserver for efficient sidebar monitoring
- Background service worker handles tab focus/blur events

## Installation

### From Source

1. Clone this repository
2. Open Chrome/Brave and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project directory

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Watch tests during development
npm run test:watch
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Core functionality and helper functions
- **Integration Tests**: Content script and background script interaction
- **End-to-End Tests**: Full extension behavior in browser environment
- **Title Handling Tests**: Specific tab title update scenarios

Run tests with coverage reporting:
```bash
npm test
```

## Project Structure

```
gemini-entitled-tabs/
├── manifest.json          # Extension manifest
├── background.js           # Background service worker
├── content.js             # Content script for Gemini pages
├── icons/                 # Extension icons
├── tests/                 # Test suite
└── coverage/              # Test coverage reports
```

## Browser Compatibility

- **Primary**: Chromium-based browsers (Chrome, Brave)
- **Tested**: Latest stable versions of Chrome and Brave

## Permissions

The extension requires minimal permissions:
- `tabs`: To modify tab titles
- `host_permissions`: Limited to `https://gemini.google.com/*`

## Privacy

This extension:
- Does not collect any user data
- Does not store any information persistently
- Does not transmit any data to external servers
- Operates entirely locally within your browser

## Contributing

1. Write tests before implementing features (TDD approach)
2. Ensure all tests pass and coverage remains high
3. Follow the existing code style and formatting
4. Test manually with multiple Gemini tabs and scenarios

## License

This project is open source. See the repository for license details.