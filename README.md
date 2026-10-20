# 🔍 InspectBae

> **The modern, high-precision visual DevTools overlay for Chrome and Microsoft Edge (Manifest V3).**  
> Reverse-engineer any web page: inspect Box Model overlays, React Fiber component hierarchies, Radix UI primitives, Tailwind CSS utility classes, and CSS custom properties (design tokens) inside an isolated Shadow DOM.

---

## ✨ Features

- **🎯 Floating Action Button (FAB)**
  - Positioned non-intrusively in the viewport.
  - Smoothly draggable to any position with automatic edge clamping.
  - Single-click toggle to enter and exit **Inspection Mode** (or press `Esc`).
  - Active pulse indicator and glowing accent state.

- **📐 Box Model Visualizer & Highlight Overlay**
  - Instant high-precision overlays showing 4 layers:
    - **Margin**: Dashed amber/orange box (`rgba(246, 178, 107, 0.35)`)
    - **Border**: Solid yellow box (`rgba(255, 229, 153, 0.35)`)
    - **Padding**: Dashed green box (`rgba(182, 215, 168, 0.4)`)
    - **Content**: Blue accent outline (`#3b82f6`)
  - Sub-pixel dimension indicators matching browser computed styles.

- **🛡️ Isolated Shadow DOM Architecture**
  - Uses native Web Components `ShadowRoot` with `mode: 'open'`.
  - Extension styles **never leak** into host web pages.
  - Host website CSS **never pollutes** or breaks the inspector UI.

- **🧩 Framework & Library Reverse Engineering**
  - **React 16/17/18/19 Detection**: Traverses internal DOM properties (`__reactFiber$`, `__reactInternalInstance$`) to extract the exact React Component name and parent component hierarchy (e.g. `<UserProfileCard>` &rarr; `<Dashboard>` &rarr; `<App>`).
  - **Radix UI Detection**: Dissects Radix UI primitives (`Dialog`, `DropdownMenu`, `Tooltip`, `Tabs`, `Accordion`, `Popover`, `Select`) by analyzing `data-radix-*`, `data-state`, `data-orientation`, `data-side`, and ARIA roles.
  - **Tailwind CSS Utility Parsing**: Scans element classes against the Tailwind CSS design system (colors, spacing, flexbox/grid, typography, borders, shadows, rounded scales).
  - **CSS Custom Properties & Design Tokens**: Resolves variables (`var(--primary)`, `var(--radius)`, `var(--ds-*)`, `var(--tw-*)`) from matched stylesheet rules, displaying both the token name and computed runtime value.

- **📋 Quick Copy Tools**
  - **Copy CSS**: Generates clean, ready-to-use CSS rules (dimensions, typography, colors, borders, shadows, box model).
  - **Copy Tailwind**: Copies all matched Tailwind utility classes in one click.
  - **Copy Color**: Copies HEX / RGB values.
  - **Copy Component**: Copies the detected React component name.
  - **Pin Mode (`P`)**: Pins the tooltip card in place to easily interact with copy buttons without losing focus.

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+)
- Google Chrome or Microsoft Edge

### 1. Build the Extension
In your terminal, navigate to the project directory and build the extension:

```bash
cd /Users/macmini/vibecoder/inspect-bae
npm install
npm run build
```

This compiles TypeScript with `esbuild`, generates extension icons, and bundles the production-ready extension into the `dist/` folder:

```text
dist/
├── manifest.json
├── content.js
├── background.js
├── popup.html
├── popup.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

### 2. Install on Google Chrome

1. Open **Google Chrome**.
2. Navigate to `chrome://extensions/` in the URL bar.
3. In the top-right corner, turn on **Developer mode**.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker, select the **`dist`** directory inside `inspect-bae`:
   ```
   /Users/macmini/vibecoder/inspect-bae/dist
   ```
6. InspectBae will now appear in your extensions list! Pin it to your Chrome toolbar for easy access.

---

### 3. Install on Microsoft Edge

1. Open **Microsoft Edge**.
2. Navigate to `edge://extensions/` in the URL bar.
3. In the left sidebar, turn on **Developer mode**.
4. Click **Load unpacked** (top of the page or sidebar).
5. Select the **`dist`** folder:
   ```
   /Users/macmini/vibecoder/inspect-bae/dist
   ```
6. InspectBae is now active on Microsoft Edge.

---

## 🎮 How to Use

1. **Activate Inspection**:
   - Click the **FAB** (floating circular button on the bottom right).
   - Or click the **InspectBae icon** in your browser toolbar popup.
   - Or press the default shortcut (`Cmd+Shift+X` on macOS, `Ctrl+Shift+X` on Windows/Linux).
2. **Inspect Any Element**:
   - Hover over headers, buttons, cards, or dialogs.
   - The Box Model overlay immediately highlights margins, paddings, and borders.
   - The floating tooltip card displays typography, colors, framework tags, and CSS variables.
3. **Pin & Copy**:
   - Press **`P`** on your keyboard (or click the 📌 pin button) to lock the tooltip card in place.
   - Click **Copy CSS**, **Tailwind**, **Color**, or **Component** to copy code straight to your clipboard.
4. **Deactivate**:
   - Press **`Esc`** or click the FAB again.

---

## 🧪 Testing & Verification

A comprehensive demo page (`test/index.html`) is included in the repository featuring:
- Tailwind CSS utility classes (`bg-zinc-900`, `p-6`, `rounded-2xl`, `shadow-xl`)
- Radix UI attributes (`data-state="open"`, `data-radix-dialog-content`, `data-radix-collection-item`)
- Simulated React 18 component tree via `__reactFiber$` (`<UserProfileCard>`, `<ActionButton>`)
- CSS custom properties (`var(--primary)`, `var(--card-bg)`, `var(--shadow-glow)`)

To run the automated verification suite:

```bash
npm test
```

To view the demo test page in your browser:
Open `test/index.html` directly in Chrome or Edge:
```
file:///Users/macmini/vibecoder/inspect-bae/test/index.html
```

---

## 📁 Project Structure

```
inspect-bae/
├── src/
│   ├── manifest.json              # Manifest V3 extension configuration
│   ├── types.ts                   # TypeScript interfaces and data models
│   ├── background.ts              # Service worker handling commands and tab badges
│   ├── content.ts                 # Main content script entry point & Shadow DOM host
│   ├── popup.html                 # Extension toolbar popup interface
│   ├── popup.ts                   # Popup controller script
│   ├── engine/
│   │   ├── inspector.ts           # Element metrics and style extraction engine
│   │   ├── color-parser.ts        # Color conversions, alpha, and Tailwind palette matcher
│   │   ├── react-detector.ts      # React Fiber (__reactFiber$) tree reverse-engineering
│   │   ├── radix-detector.ts      # Radix UI primitives and state detection
│   │   ├── tailwind-detector.ts   # Tailwind CSS utility class classifier
│   │   └── css-variables.ts       # CSS custom properties / design tokens resolver
│   └── ui/
│       ├── fab.ts                 # Draggable, interactive Floating Action Button
│       ├── overlay.ts             # 4-layer box model visualizer (Margin/Border/Padding)
│       ├── tooltip-card.ts        # Inspection tooltip card with copy actions
│       └── styles.ts              # Isolated CSS styles injected into ShadowRoot
├── test/
│   ├── index.html                 # Demo test page
│   └── verify-build.js            # Automated build & artifact verification script
├── generate-icons.js              # Standalone Node.js PNG icon generator
├── build.js                       # High-performance esbuild bundle runner
├── tsconfig.json                  # TypeScript compiler settings
├── package.json                   # Project scripts and dependencies
└── README.md                      # Documentation & installation instructions
```

---

## 📄 License

MIT © 2026 InspectBae Team
