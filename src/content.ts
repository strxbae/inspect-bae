import { SHADOW_STYLES } from './ui/styles';
import { FABManager } from './ui/fab';
import { OverlayManager } from './ui/overlay';
import { TooltipCard } from './ui/tooltip-card';
import { extractElementData } from './engine/inspector';
import { ExtensionMessage } from './types';

(function () {
  // Prevent duplicate injection
  if ((window as any).__INSPECT_BAE_LOADED__) return;
  (window as any).__INSPECT_BAE_LOADED__ = true;

  let isInspectionActive = false;
  let hoveredElement: HTMLElement | null = null;
  let hostEl: HTMLDivElement | null = null;
  let shadowRoot: ShadowRoot | null = null;
  let fabManager: FABManager | null = null;
  let overlayManager: OverlayManager | null = null;
  let tooltipCard: TooltipCard | null = null;

  function initHost(): void {
    if (hostEl) return;

    hostEl = document.createElement('div');
    hostEl.id = 'inspect-bae-root';
    hostEl.style.position = 'fixed';
    hostEl.style.top = '0';
    hostEl.style.left = '0';
    hostEl.style.width = '0';
    hostEl.style.height = '0';
    hostEl.style.zIndex = '2147483647';
    hostEl.style.pointerEvents = 'none';

    // Shadow DOM to isolate styles completely
    shadowRoot = hostEl.attachShadow({ mode: 'open' });

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = SHADOW_STYLES;
    shadowRoot.appendChild(styleEl);

    overlayManager = new OverlayManager(shadowRoot);
    tooltipCard = new TooltipCard(shadowRoot, handleCopy);
    fabManager = new FABManager(shadowRoot, toggleInspection);

    document.documentElement.appendChild(hostEl);
  }

  function toggleInspection(forceState?: boolean): void {
    isInspectionActive = forceState !== undefined ? forceState : !isInspectionActive;
    if (fabManager) {
      fabManager.setActive(isInspectionActive);
    }

    if (isInspectionActive) {
      enableInspectionListeners();
      showToast('InspectBae: Inspection Mode Active');
    } else {
      disableInspectionListeners();
      if (overlayManager) overlayManager.hide();
      if (tooltipCard) tooltipCard.hide();
      showToast('InspectBae: Inspection Mode Deactivated');
    }

    // Broadcast state to runtime/popup
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'STATE_UPDATE',
          payload: { isEnabled: isInspectionActive }
        });
      }
    } catch (e) {
      // Background worker might be sleeping
    }
  }

  function handlePointerMove(e: MouseEvent): void {
    if (!isInspectionActive) return;

    // Ignore events on our own shadow root host or any element inside it
    if (hostEl) {
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(hostEl) || (shadowRoot && path.some(p => p instanceof Node && shadowRoot!.contains(p)))) {
        return;
      }
    }

    let target = e.target as HTMLElement | null;
    if (!target || target === hostEl || target.id === 'inspect-bae-root') {
      target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    }

    if (!target || target === hoveredElement || target === hostEl || target.id === 'inspect-bae-root') {
      return;
    }

    hoveredElement = target;

    try {
      const data = extractElementData(target);
      if (overlayManager) overlayManager.update(target, data);
      if (tooltipCard) tooltipCard.update(data, target);
    } catch (err) {
      console.error('[InspectBae] Error extracting element data:', err);
    }
  }

  function handleKeyDown(e: KeyboardEvent): void {
    // ESC disables inspection or unpins
    if (e.key === 'Escape' && isInspectionActive) {
      toggleInspection(false);
    }
    // 'p' or 'P' toggles pin when active
    if ((e.key === 'p' || e.key === 'P') && isInspectionActive) {
      if (tooltipCard) tooltipCard.togglePin();
    }
  }

  function handleCopy(text: string, label: string): void {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    } catch (e) {
      // Ignore copy error
    }
    showToast(label);
  }

  function showToast(message: string): void {
    if (!shadowRoot) return;
    const oldToasts = shadowRoot.querySelectorAll('.ib-toast');
    oldToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'ib-toast';
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${escapeHtml(message)}</span>
    `;

    shadowRoot.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2100);
  }

  function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function enableInspectionListeners(): void {
    window.addEventListener('pointermove', handlePointerMove, { passive: true, capture: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true, capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
  }

  function disableInspectionListeners(): void {
    window.removeEventListener('pointermove', handlePointerMove, { capture: true });
    window.removeEventListener('mousemove', handlePointerMove, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    hoveredElement = null;
  }

  // Listen for messages from popup or background (if running inside Chrome extension context)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
      if (message.type === 'TOGGLE_INSPECTION') {
        toggleInspection(message.payload);
        sendResponse({ isEnabled: isInspectionActive });
      } else if (message.type === 'GET_STATE') {
        sendResponse({ isEnabled: isInspectionActive });
      }
      return true;
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHost);
  } else {
    initHost();
  }
})();
