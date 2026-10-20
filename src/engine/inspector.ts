import { InspectedElementData } from '../types';
import { parseColor, pxToRem, matchTailwindRounded } from './color-parser';
import { detectReact } from './react-detector';
import { detectRadix } from './radix-detector';
import { detectTailwind } from './tailwind-detector';
import { detectCSSVariables } from './css-variables';

export function extractElementData(element: HTMLElement): InspectedElementData {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  // Box model numbers
  const parseNum = (val: string) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : Math.round(n);
  };

  const boxModel = {
    margin: {
      top: parseNum(computed.marginTop),
      right: parseNum(computed.marginRight),
      bottom: parseNum(computed.marginBottom),
      left: parseNum(computed.marginLeft)
    },
    padding: {
      top: parseNum(computed.paddingTop),
      right: parseNum(computed.paddingRight),
      bottom: parseNum(computed.paddingBottom),
      left: parseNum(computed.paddingLeft)
    },
    border: {
      top: parseNum(computed.borderTopWidth),
      right: parseNum(computed.borderRightWidth),
      bottom: parseNum(computed.borderBottomWidth),
      left: parseNum(computed.borderLeftWidth)
    }
  };

  // Typography
  const fontFamilyRaw = computed.fontFamily || '';
  const firstFont = fontFamilyRaw.split(',')[0].replace(/['"]/g, '').trim();
  const isWebFont = isFontLoadedAsWebFont(firstFont);
  const color = parseColor(computed.color, element, 'color');

  // Styling & effects
  const backgroundColor = parseColor(computed.backgroundColor, element, 'background-color');
  const borderRadiusVal = computed.borderRadius;
  const borderRadiusRem = pxToRem(borderRadiusVal);
  const tailwindRadius = matchTailwindRounded(borderRadiusVal);

  const borderWidth = computed.borderWidth;
  const borderStyle = computed.borderStyle;
  const borderColor = computed.borderColor;
  const borderFormatted = (borderWidth !== '0px' && borderStyle !== 'none')
    ? `${borderWidth} ${borderStyle} ${borderColor}`
    : 'none';

  // Frameworks & tokens
  const reactData = detectReact(element);
  const radixData = detectRadix(element);
  const tailwindData = detectTailwind(element);
  const cssVariables = detectCSSVariables(element, computed);

  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    classList: Array.from(element.classList),
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      bottom: Math.round(rect.bottom),
      right: Math.round(rect.right)
    },
    boxModel,
    typography: {
      fontFamily: fontFamilyRaw,
      detectedFontName: firstFont,
      isWebFont,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      color
    },
    styling: {
      backgroundColor,
      border: borderFormatted,
      borderRadius: {
        value: borderRadiusVal,
        rem: borderRadiusRem,
        tailwindMatch: tailwindRadius
      },
      boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : 'none',
      opacity: computed.opacity,
      backdropFilter: computed.backdropFilter || (computed as any).webkitBackdropFilter || 'none',
      display: computed.display,
      position: computed.position,
      zIndex: computed.zIndex
    },
    frameworks: {
      react: reactData,
      radix: radixData,
      tailwind: tailwindData,
      cssVariables
    }
  };
}

function isFontLoadedAsWebFont(fontName: string): boolean {
  if (!fontName) return false;
  const standardFonts = [
    'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
    'Helvetica Neue', 'Arial', 'sans-serif', 'serif', 'monospace', 'Times New Roman',
    'Georgia', 'Courier New', 'Verdana', 'Tahoma', 'Trebuchet MS'
  ];
  if (standardFonts.map(f => f.toLowerCase()).includes(fontName.toLowerCase())) {
    return false;
  }

  // Check document.fonts
  if (document.fonts && document.fonts.check) {
    return document.fonts.check(`12px "${fontName}"`);
  }
  return true;
}
