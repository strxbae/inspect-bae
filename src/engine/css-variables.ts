import { CSSVariableMatch } from '../types';

// Extract CSS variable references and find matching custom properties on the element or root
export function detectCSSVariables(element: HTMLElement, computedStyle: CSSStyleDeclaration): CSSVariableMatch[] {
  const matches: CSSVariableMatch[] = [];
  const checkedProperties = [
    'background-color',
    'color',
    'border-color',
    'border-radius',
    'font-family',
    'font-size',
    'gap',
    'padding',
    'margin',
    'box-shadow',
    'fill',
    'stroke'
  ];

  // 1. Check inline style
  for (let i = 0; i < element.style.length; i++) {
    const prop = element.style[i];
    const val = element.style.getPropertyValue(prop);
    const varMatches = val.match(/var\((--[a-zA-Z0-9-_]+)\)/g);
    if (varMatches) {
      for (const vm of varMatches) {
        const varName = vm.replace(/var\(|\)/g, '').trim();
        const resolved = computedStyle.getPropertyValue(varName).trim();
        matches.push({
          property: prop,
          variableName: varName,
          computedValue: resolved || computedStyle.getPropertyValue(prop)
        });
      }
    }
  }

  // 2. Scan stylesheets matching element rules
  try {
    const rootStyle = getComputedStyle(document.documentElement);
    // Common design token prefixes (Tailwind v4, Shadcn/Radix, Design System, DaisyUI, etc.)
    const interestingVarPrefixes = ['--tw-', '--ds-', '--color-', '--primary', '--secondary', '--background', '--foreground', '--radius', '--font-', '--space-', '--shadow-'];

    // Collect all computed custom properties in element or root
    // To do this, scan through document.styleSheets
    const foundVars = new Map<string, string>();

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) {
            // Check if rule applies to element or :root
            let isApplicable = false;
            try {
              if (rule.selectorText === ':root' || rule.selectorText === 'html' || rule.selectorText === 'body' || element.matches(rule.selectorText)) {
                isApplicable = true;
              }
            } catch (e) {
              // Ignore invalid selector errors
            }

            if (isApplicable) {
              const style = rule.style;
              for (let j = 0; j < style.length; j++) {
                const name = style[j];
                if (name.startsWith('--')) {
                  const val = style.getPropertyValue(name).trim();
                  foundVars.set(name, val);
                }
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin CSS rule access blocked, continue safely
      }
    }

    // Match properties to discovered tokens
    for (const prop of checkedProperties) {
      const compVal = computedStyle.getPropertyValue(prop).trim();
      if (!compVal) continue;

      for (const [varName, rawVal] of foundVars.entries()) {
        const resolvedVal = computedStyle.getPropertyValue(varName).trim() || rootStyle.getPropertyValue(varName).trim();
        if (resolvedVal && (resolvedVal === compVal || (compVal.includes(resolvedVal) && resolvedVal.length > 3))) {
          if (!matches.some(m => m.variableName === varName && m.property === prop)) {
            matches.push({
              property: prop,
              variableName: varName,
              computedValue: compVal
            });
          }
        }
      }
    }
  } catch (e) {
    // Fail gracefully
  }

  return matches.slice(0, 10);
}
