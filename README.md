# Tab Monitor Chrome Extension

A comprehensive Chrome extension for monitoring and managing browser tabs with enhanced metadata tracking, multi-selection capabilities, and window organization.

## ✨ Features

### **Core Tab Management**
- **Comprehensive Tab View**: View, navigate to, and close tabs across all Chrome windows
- **Enhanced Tab Metadata**: Shows last active time, position, domain, and status indicators
- **Window Organization**: Group tabs by browser windows with collapsible sections
- **Professional UI**: Clean, modern interface with status badges and visual indicators
- **Full-Page Experience**: Opens as a dedicated tab instead of a small popup

### **Multi-Selection & Bulk Operations**
- **Checkbox Selection**: Select individual tabs or use "Select All" for bulk operations
- **Bulk Close**: Close multiple selected tabs at once with confirmation dialog
- **Selection Persistence**: Maintain selections during sorting and window grouping
- **Visual Feedback**: Selected tabs are highlighted with green borders and backgrounds
- **Smart Controls**: Bulk action buttons appear only when tabs are selected

### **Advanced Sorting**
- **Multiple Sort Options**: Sort by Last Active, Title (A-Z), Domain (A-Z), or Tab Position
- **Context-Aware Sorting**: Global sorting when ungrouped, per-window sorting when grouped
- **Persistent Sort State**: Sort preferences maintained during the current session

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

## 📖 How to Use Multi-Selection

### **Selecting Tabs**
1. **Individual Selection**: Click the checkbox on any tab card to select it
2. **Select All**: Use the "Select All" checkbox in the header to select all visible tabs
3. **Mixed Selection**: Combine individual and bulk selection as needed

### **Bulk Operations**
1. **Select Target Tabs**: Choose the tabs you want to close using checkboxes
2. **Initiate Bulk Close**: Click the "Close Selected (X)" button that appears in the header
3. **Confirm Action**: Review the confirmation dialog and click "Close X Tabs" to proceed
4. **Automatic Cleanup**: Selections are automatically cleared after successful closure

### **Visual Feedback**
- **Selected Tabs**: Highlighted with green borders and subtle background color
- **Selection Count**: Displayed in header when tabs are selected
- **Bulk Action Button**: Only appears when tabs are selected, shows exact count
- **Confirmation Dialog**: Prevents accidental bulk closures with clear messaging

## 📋 Tab Information

Each tab displays:
- **Selection Checkbox**: For multi-selection and bulk operations
- **Title and URL** with favicon
- **Domain** prominently highlighted in metadata
- **Status badges**: Active, Pinned, Loading, Audio/Muted, Grouped
- **Last Active time** (when the tab was last focused)
- **Position** within its window
- **Visual Selection State**: Selected tabs have green borders and subtle background highlighting

## 🎯 User Interface

### **Header Controls**
- **Tab Count**: Shows total number of open tabs
- **Selection Status**: Displays count of selected tabs when applicable
- **Select All Checkbox**: Quickly select or deselect all visible tabs
- **Bulk Close Button**: Appears when tabs are selected, shows count in button text
- **Group by Windows Toggle**: Switch between grouped and flat tab views
- **Sort Dropdown**: Choose sorting method (context-aware based on grouping mode)
- **Window Count**: Shows number of browser windows

### **Interaction Behavior**
- **Tab Navigation**: Click anywhere on a tab card (except checkbox) to switch to that tab
- **Individual Selection**: Click checkboxes to select/deselect specific tabs
- **Bulk Selection**: Use "Select All" to select all visible tabs at once
- **Bulk Close**: Confirmation dialog prevents accidental mass closures
- **Responsive Design**: Interface adapts to different screen sizes and content amounts

## 🔧 Technical Features

### **State Management**
- **React Hooks**: Modern state management with useState and useCallback
- **Selection Persistence**: Maintains selected tabs during sorting and grouping operations
- **Error Handling**: Graceful fallbacks when Chrome APIs are unavailable
- **Performance Optimized**: Efficient rendering and state updates

### **Accessibility**
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
- **Visual Indicators**: Clear visual feedback for all interactive states
- **Professional Styling**: Consistent design language throughout the interface

### **Chrome Extension Integration**
- **Manifest V3**: Uses the latest Chrome extension platform for enhanced security
- **Permission Management**: Minimal required permissions for core functionality
- **Cross-Window Support**: Works seamlessly across multiple Chrome windows
- **Real-time Updates**: Reflects current browser state accurately

## 🏗️ Built With

- **React** - UI framework with hooks for modern state management
- **Vite** - Build tool and dev server with hot reloading
- **Chrome Extension Manifest V3** - Latest extension platform
- **Chrome APIs** - Tabs, Windows, TabGroups, and Storage APIs

## 🚨 Important Notes

- **Chrome Compatibility**: Requires Chrome browser with Manifest V3 support
- **Production Ready**: Designed for real-world use with proper error handling
- **Development Mode**: Includes mock data for testing without Chrome extension context
- **No External Dependencies**: Uses only Chrome APIs and React for maximum reliability

---

**Note**: This extension uses Manifest V3 for enhanced security and performance. All tab operations are performed through official Chrome APIs.