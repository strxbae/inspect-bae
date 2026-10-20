import { ExtensionMessage } from './types';

const toggle = document.getElementById('toggle-active') as HTMLInputElement | null;

async function initPopup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Query state from content script
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' } as ExtensionMessage, (response) => {
      if (chrome.runtime.lastError) {
        // Tab might not have content script loaded (e.g. chrome:// URL)
        if (toggle) toggle.disabled = true;
        return;
      }
      if (response && toggle) {
        toggle.checked = Boolean(response.isEnabled);
      }
    });
  } catch (e) {
    // Fail gracefully
  }

  toggle?.addEventListener('change', async () => {
    const isChecked = toggle.checked;
    try {
      await chrome.tabs.sendMessage(tab.id!, {
        type: 'TOGGLE_INSPECTION',
        payload: isChecked
      } as ExtensionMessage);
    } catch (err) {
      console.warn('Could not communicate with tab:', err);
    }
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
