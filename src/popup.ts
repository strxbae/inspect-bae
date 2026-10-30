import { ExtensionMessage } from './types';

const toggle = document.getElementById('toggle-active') as HTMLInputElement | null;
const versionEl = document.getElementById('ext-version');
const hintEl = document.getElementById('status-hint');

function showHint(message: string, isError = true) {
  if (!hintEl) return;
  hintEl.textContent = message;
  hintEl.style.display = 'block';
  if (isError) {
    hintEl.style.background = 'rgba(239, 68, 68, 0.12)';
    hintEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    hintEl.style.color = '#f87171';
  } else {
    hintEl.style.background = 'rgba(245, 158, 11, 0.12)';
    hintEl.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    hintEl.style.color = '#fbbf24';
  }
}

function hideHint() {
  if (hintEl) hintEl.style.display = 'none';
}

function isRestrictedUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('devtools://') ||
    url.startsWith('view-source:') ||
    url.includes('chromewebstore.google.com') ||
    url.includes('chrome.google.com/webstore')
  );
}

async function injectContentScript(tabId: number): Promise<boolean> {
  if (typeof chrome !== 'undefined' && chrome.scripting && chrome.scripting.executeScript) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      return true;
    } catch (e) {
      console.warn('[InspectBae] Error injecting content script:', e);
      return false;
    }
  }
  return false;
}

async function initPopup() {
  // Set version dynamically from manifest
  try {
    const manifest = chrome.runtime.getManifest();
    if (versionEl && manifest.version) {
      versionEl.textContent = `v${manifest.version}`;
    }
  } catch (e) {
    // Ignore error
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    showHint('No active browser tab found.');
    if (toggle) toggle.disabled = true;
    return;
  }

  // Check if current tab is a restricted browser URL
  if (isRestrictedUrl(tab.url)) {
    showHint('Cannot inspect browser internal pages. Please open a website (e.g. localhost, github.com).', false);
    if (toggle) toggle.disabled = true;
    return;
  }

  // Query state from content script
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' } as ExtensionMessage, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be injected yet; keep toggle enabled for auto-injection
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
    hideHint();

    const sendToggleMessage = () => {
      return new Promise<boolean>((resolve) => {
        chrome.tabs.sendMessage(
          tab.id!,
          { type: 'TOGGLE_INSPECTION', payload: isChecked } as ExtensionMessage,
          (response) => {
            if (chrome.runtime.lastError) {
              resolve(false);
            } else {
              resolve(true);
            }
          }
        );
      });
    };

    let ok = await sendToggleMessage();
    if (!ok) {
      // Content script is not running on this tab yet: auto-inject it!
      const injected = await injectContentScript(tab.id!);
      if (injected) {
        setTimeout(async () => {
          const retryOk = await sendToggleMessage();
          if (!retryOk) {
            showHint('Please refresh this tab once to enable InspectBae.');
          }
        }, 150);
      } else {
        if (tab.url?.startsWith('file://')) {
          showHint('For local file:// pages, please turn on "Allow access to file URLs" in chrome://extensions.');
        } else {
          showHint('Please refresh this tab once to enable InspectBae.');
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
