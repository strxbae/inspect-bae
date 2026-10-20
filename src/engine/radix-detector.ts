import { InspectedElementData } from '../types';

export function detectRadix(element: HTMLElement): InspectedElementData['frameworks']['radix'] | undefined {
  try {
    let curr: HTMLElement | null = element;
    let radixAttrs: Record<string, string> = {};
    let primitive = '';
    let part = '';
    let state = '';

    // Search element and up to 4 ancestors
    for (let depth = 0; depth < 5 && curr; depth++) {
      const attributes = Array.from(curr.attributes);
      let foundOnThis = false;

      for (const attr of attributes) {
        const name = attr.name;
        const val = attr.value;

        if (name.startsWith('data-radix-') || name === 'data-state' || name === 'data-orientation' || name === 'data-side' || name === 'data-align' || name === 'data-placeholder') {
          radixAttrs[name] = val;
          foundOnThis = true;
        }

        if (name.startsWith('data-radix-')) {
          // e.g. data-radix-dropdown-menu-content => DropdownMenu.Content
          const parts = name.replace('data-radix-', '').split('-');
          if (parts.length > 0 && !primitive) {
            primitive = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
          }
        }

        if (name === 'data-state') {
          state = val;
        }
      }

      // Check class or attribute heuristics for known Radix UI primitives
      if (!primitive && foundOnThis) {
        primitive = guessRadixPrimitive(curr);
      }

      if (primitive) {
        break;
      }

      curr = curr.parentElement;
    }

    if (Object.keys(radixAttrs).length > 0 || primitive) {
      return {
        primitive: primitive || 'RadixPrimitive',
        part: part || undefined,
        state: state || undefined,
        attributes: radixAttrs
      };
    }
  } catch (e) {
    // Silently continue
  }

  return undefined;
}

function guessRadixPrimitive(element: HTMLElement): string {
  const role = element.getAttribute('role');
  const tag = element.tagName.toLowerCase();
  const id = element.id || '';
  const className = element.className || '';

  if (element.hasAttribute('data-radix-collection-item')) {
    return 'CollectionItem';
  }

  if (role === 'dialog' || element.hasAttribute('data-radix-dialog-content')) {
    return 'Dialog';
  }
  if (role === 'menu' || role === 'menuitem' || element.hasAttribute('data-radix-dropdown-menu-trigger')) {
    return 'DropdownMenu';
  }
  if (role === 'tooltip' || element.hasAttribute('data-radix-tooltip-trigger')) {
    return 'Tooltip';
  }
  if (role === 'tab' || role === 'tablist' || role === 'tabpanel') {
    return 'Tabs';
  }
  if (role === 'switch') {
    return 'Switch';
  }
  if (role === 'checkbox') {
    return 'Checkbox';
  }
  if (role === 'combobox') {
    return 'Select / Combobox';
  }
  if (element.hasAttribute('data-radix-accordion-item') || element.hasAttribute('data-radix-accordion-trigger')) {
    return 'Accordion';
  }
  if (element.hasAttribute('data-radix-popover-content') || element.hasAttribute('data-radix-popover-trigger')) {
    return 'Popover';
  }
  if (element.hasAttribute('data-radix-scroll-area-viewport')) {
    return 'ScrollArea';
  }

  // Check data-state presence
  if (element.hasAttribute('data-state')) {
    return 'RadixPrimitive';
  }

  return '';
}
