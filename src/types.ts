export interface InspectedElementData {
  tagName: string;
  id?: string;
  classList: string[];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  boxModel: {
    margin: { top: number; right: number; bottom: number; left: number };
    padding: { top: number; right: number; bottom: number; left: number };
    border: { top: number; right: number; bottom: number; left: number };
  };
  typography: {
    fontFamily: string;
    detectedFontName: string;
    isWebFont: boolean;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    color: ColorValue;
  };
  styling: {
    backgroundColor: ColorValue;
    border: string;
    borderRadius: {
      value: string;
      rem: string;
      tailwindMatch?: string;
    };
    boxShadow: string;
    opacity: string;
    backdropFilter: string;
    display: string;
    position: string;
    zIndex: string;
  };
  frameworks: {
    react?: {
      componentName: string;
      hierarchy?: string[];
      propsCount?: number;
    };
    radix?: {
      primitive: string;
      part?: string;
      state?: string;
      attributes: Record<string, string>;
    };
    tailwind: {
      matchedClasses: string[];
      categorized: {
        typography: string[];
        layout: string[];
        spacing: string[];
        colors: string[];
        effects: string[];
        borders: string[];
        other: string[];
      };
    };
    cssVariables: CSSVariableMatch[];
  };
}

export interface ColorValue {
  hex: string;
  rgb: string;
  hsl: string;
  alpha: number;
  raw: string;
  cssVariable?: string;
  tailwindClass?: string;
}

export interface CSSVariableMatch {
  property: string;
  variableName: string;
  computedValue: string;
}

export interface ExtensionSettings {
  isEnabled: boolean;
  highlightMargin: boolean;
  highlightPadding: boolean;
  highlightBorder: boolean;
  showTooltips: boolean;
  showTailwind: boolean;
  showReact: boolean;
  showRadix: boolean;
  showCSSVariables: boolean;
  fabPosition: { x?: number; y?: number };
}

export type ExtensionMessage =
  | { type: 'TOGGLE_INSPECTION'; payload?: boolean }
  | { type: 'GET_STATE' }
  | { type: 'STATE_UPDATE'; payload: { isEnabled: boolean } }
  | { type: 'COPY_TEXT'; payload: { text: string; label: string } };
