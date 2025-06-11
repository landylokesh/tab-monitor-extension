# Tab Monitor Chrome Extension

A comprehensive Chrome extension for monitoring and managing browser tabs with enhanced metadata tracking and window organization.

## ✨ Features

- **Comprehensive Tab Management**: View, navigate to, and close tabs across all Chrome windows
- **Enhanced Tab Metadata**: Shows last active time, position, domain, and status indicators
- **Window Organization**: Group tabs by browser windows with collapsible sections
- **Professional UI**: Clean, modern interface with status badges and visual indicators
- **Full-Page Experience**: Opens as a dedicated tab instead of a small popup

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder (created after running build)

4. **Use the extension**
   - Click the extension icon in Chrome's toolbar
   - A new tab will open with the Tab Monitor interface

## 🛠️ Development

For development with hot reloading:

```bash
npm run dev
```

Open `http://localhost:5173/` to see the interface with mock data.

**Note**: The `dist/` folder and `node_modules/` are excluded from git tracking. You'll need to run `npm install` and `npm run build` after cloning the repository.

## 📋 Tab Information

Each tab displays:
- **Title and URL** with favicon
- **Domain** prominently highlighted
- **Status badges**: Active, Pinned, Loading, Audio/Muted, Grouped
- **Last Active time** (when the tab was last focused)
- **Position** within its window

## 🏗️ Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Chrome Extension Manifest V3** - Latest extension platform
- **Chrome APIs** - Tabs, Windows, and Storage APIs

---

**Note**: This extension requires Chrome and uses Manifest V3 for enhanced security and performance.