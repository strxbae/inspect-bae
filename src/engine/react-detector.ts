import { InspectedElementData } from '../types';

export function detectReact(element: HTMLElement): InspectedElementData['frameworks']['react'] | undefined {
  try {
    let curr: any = element;
    let fiberNode: any = null;

    // Search up to 5 levels of DOM parents for react fiber
    for (let i = 0; i < 5 && curr; i++) {
      const keys = Object.keys(curr);
      const fiberKey = keys.find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
      if (fiberKey) {
        fiberNode = curr[fiberKey];
        break;
      }
      curr = curr.parentElement;
    }

    if (!fiberNode) {
      // Also check if react event listener is attached (e.g. __reactProps$, __reactEvents$)
      const propKeys = Object.keys(element).filter(k => k.startsWith('__reactProps$'));
      if (propKeys.length > 0) {
        const props = (element as any)[propKeys[0]];
        if (props && typeof props === 'object') {
          return {
            componentName: 'ReactElement',
            propsCount: Object.keys(props).length
          };
        }
      }
      return undefined;
    }

    // Traverse fiber hierarchy upward to find component names
    const hierarchy: string[] = [];
    let currentFiber = fiberNode;
    let componentName = '';

    while (currentFiber) {
      const name = getFiberComponentName(currentFiber);
      if (name && !isInternalReactTag(name)) {
        if (!componentName) {
          componentName = name;
        }
        hierarchy.push(name);
      }
      currentFiber = currentFiber.return;
    }

    if (componentName) {
      const memoizedProps = fiberNode.memoizedProps || fiberNode.pendingProps;
      const propsCount = memoizedProps ? Object.keys(memoizedProps).length : undefined;

      return {
        componentName,
        hierarchy: hierarchy.slice(0, 5),
        propsCount
      };
    }
  } catch (e) {
    // Silently continue if cross-origin or restricted
  }

  return undefined;
}

function getFiberComponentName(fiber: any): string | null {
  if (!fiber || !fiber.type) return null;

  if (typeof fiber.type === 'string') {
    // HTML tag like 'div', 'button', 'span'
    return null;
  }

  if (typeof fiber.type === 'function') {
    return fiber.type.displayName || fiber.type.name || 'AnonymousComponent';
  }

  if (typeof fiber.type === 'object') {
    // Memo or ForwardRef
    if (fiber.type.displayName) return fiber.type.displayName;
    if (fiber.type.render) {
      return fiber.type.render.displayName || fiber.type.render.name || 'ForwardRef';
    }
    if (fiber.type.type) {
      return getFiberComponentName({ type: fiber.type.type });
    }
  }

  return null;
}

function isInternalReactTag(name: string): boolean {
  const internal = ['Fragment', 'Suspense', 'StrictMode', 'Provider', 'Consumer', 'Context'];
  return internal.includes(name);
}
