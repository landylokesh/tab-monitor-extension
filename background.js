chrome.runtime.onInstalled.addListener(() => {
  console.log("Tab Monitor Extension: Background service worker installed.");
  console.log("Available APIs:", {
    tabs: !!chrome.tabs,
    windows: !!chrome.windows,
    storage: !!chrome.storage,
    action: !!chrome.action
  });
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log("Tab Monitor Extension: Icon clicked, opening extension page");

  // Create a new tab with the extension page
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  }, (newTab) => {
    if (chrome.runtime.lastError) {
      console.error("Tab Monitor Extension: Error creating tab:", chrome.runtime.lastError);
    } else {
      console.log("Tab Monitor Extension: Successfully opened tab", newTab.id);
    }
  });
});

// Add error handling for runtime errors
chrome.runtime.onStartup.addListener(() => {
  console.log("Tab Monitor Extension: Runtime startup");
});

// Log any runtime errors
if (chrome.runtime.onSuspend) {
  chrome.runtime.onSuspend.addListener(() => {
    console.log("Tab Monitor Extension: Service worker suspending");
  });
}
