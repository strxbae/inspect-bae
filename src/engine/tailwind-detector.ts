import { InspectedElementData } from '../types';

export function detectTailwind(element: HTMLElement): InspectedElementData['frameworks']['tailwind'] {
  const classList = Array.from(element.classList);
  const matchedClasses: string[] = [];
  const categorized: InspectedElementData['frameworks']['tailwind']['categorized'] = {
    typography: [],
    layout: [],
    spacing: [],
    colors: [],
    effects: [],
    borders: [],
    other: []
  };

  for (const cls of classList) {
    if (isTailwindClass(cls)) {
      matchedClasses.push(cls);
      const cat = categorizeClass(cls);
      categorized[cat].push(cls);
    }
  }

  return {
    matchedClasses,
    categorized
  };
}

function isTailwindClass(cls: string): boolean {
  // Common prefixes & Tailwind patterns
  const patterns = [
    // Spacing
    /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|space-[xy]|gap|gap-[xy])-(\d+|\[.+\]|auto|px)$/,
    // Layout & Flex & Grid
    /^(flex|inline-flex|grid|inline-grid|block|inline-block|inline|hidden)$/,
    /^(flex-(row|row-reverse|col|col-reverse|wrap|wrap-reverse|nowrap|1|auto|initial|none))$/,
    /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline|auto)/,
    /^(grid-cols|grid-rows|col-span|row-span)-/,
    // Sizing
    /^(w|min-w|max-w|h|min-h|max-h)-(\d+|\[.+\]|auto|full|screen|fit|min|max|px)/,
    // Typography
    /^(text|font|leading|tracking)-(xs|sm|base|lg|xl|\dxl|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|tight|snug|normal|relaxed|loose|tighter|wider|widest|center|left|right|justify)/,
    /^(underline|line-through|no-underline|uppercase|lowercase|capitalize|italic|not-italic|truncate)/,
    // Colors
    /^(bg|text|border|ring|accent|fill|stroke)-([a-z]+-\d+|white|black|transparent|current|\[.+\])/,
    // Borders & Rings
    /^(rounded|rounded-(t|r|b|l|tl|tr|br|bl))(-[a-z0-9]+|\[.+\])?$/,
    /^(border|border-[trblxy])(-(\d+|\[.+\]))?$/,
    /^(ring|ring-offset)(-(\d+|\[.+\]))?$/,
    // Effects
    /^(shadow|shadow-(sm|md|lg|xl|2xl|inner|none)|opacity-\d+|blur|backdrop-blur|blur-[a-z0-9]+)/,
    // Positioning
    /^(relative|absolute|fixed|sticky|static)$/,
    /^(top|right|bottom|left|inset|inset-[xy])-(\d+|auto|full|px|\[.+\])/,
    /^(z)-(\d+|auto|\[.+\])/,
    // Transitions & Transforms
    /^(transition|duration-\d+|ease-[a-z]+|scale-\d+|rotate-\d+|translate-[xy]-\d+)/,
    // Overflow & Display
    /^(overflow|overflow-[xy])-(auto|hidden|clip|visible|scroll)/,
    /^(cursor)-(pointer|default|not-allowed|text|move)/
  ];

  return patterns.some(pattern => pattern.test(cls));
}

function categorizeClass(cls: string): keyof InspectedElementData['frameworks']['tailwind']['categorized'] {
  if (/^(text|font|leading|tracking|underline|italic|truncate|uppercase|lowercase)/.test(cls)) return 'typography';
  if (/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|space|gap)/.test(cls)) return 'spacing';
  if (/^(bg|text|border)-([a-z]+-\d+|white|black|transparent)/.test(cls)) return 'colors';
  if (/^(rounded|border|ring)/.test(cls)) return 'borders';
  if (/^(shadow|opacity|blur|backdrop)/.test(cls)) return 'effects';
  if (/^(flex|grid|block|inline|items|justify|w-|h-|min-|max-|relative|absolute|fixed|sticky|overflow)/.test(cls)) return 'layout';
  return 'other';
}
