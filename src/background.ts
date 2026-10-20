import { ExtensionMessage } from './types';

// State per tab
const tabInspectionStates = new Map<number, boolean>();

// Extension icon click or shortcut
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  const currentState = tabInspectionStates.get(tab.id) || false;
  const newState = !currentState;
  tabInspectionStates.set(tab.id, newState);

  updateBadge(tab.id, newState);

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_INSPECTION',
      payload: newState
    } as ExtensionMessage);
  } catch (err) {
    // If content script not yet injected (e.g. newly opened page)
    console.warn('[InspectBae ServiceWorker] Could not send message to tab:', err);
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (message.type === 'STATE_UPDATE' && tabId) {
    const isEnabled = message.payload.isEnabled;
    tabInspectionStates.set(tabId, isEnabled);
    updateBadge(tabId, isEnabled);
    sendResponse({ success: true });
  }

  return true;
});

// Clean up tab state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabInspectionStates.delete(tabId);
});

function updateBadge(tabId: number, isEnabled: boolean) {
  if (isEnabled) {
    chrome.action.setBadgeText({ tabId, text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#6366f1' });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
}
