# 🔍 InspectBae

<p align="center">
  <img src="src/manifest.json" width="0" alt="" />
  <strong>The modern visual DevTools & real-time design tweaker for Chromium browsers (Manifest V3).</strong><br>
  Reverse-engineer components, tweak CSS live in real-time, and generate clean Markdown handover notes for frontend developers.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Version-v1.1.0-6366f1.svg" alt="Version" />
  <img src="https://img.shields.io/badge/Chrome-Supported-success.svg" alt="Chrome" />
  <img src="https://img.shields.io/badge/Edge-Supported-blue.svg" alt="Edge" />
  <img src="https://img.shields.io/badge/Arc-Supported-purple.svg" alt="Arc" />
  <img src="https://img.shields.io/badge/Brave-Supported-orange.svg" alt="Brave" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<div align="center">

### 📦 Quick Download & Install (No Build Required)

[![Download Extension ZIP](https://img.shields.io/badge/⬇️_DOWNLOAD_EXTENSION_(ZIP)-v1.1.0_LATEST-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/strxbae/inspect-bae/releases/download/v1.1.0/inspect-bae-extension.zip)

**[👉 Direct Download (GitHub Release ZIP)](https://github.com/strxbae/inspect-bae/releases/download/v1.1.0/inspect-bae-extension.zip)** &bull; **[Alternative Mirror (Raw Main)](https://github.com/strxbae/inspect-bae/raw/main/inspect-bae-extension.zip)**

*1. Download ZIP &rarr; 2. Extract folder &rarr; 3. Go to `chrome://extensions/` &rarr; Turn on "Developer mode" &rarr; Click "Load unpacked" &rarr; Done!*

</div>

---

## ✨ Highlights & Features

### ⚡ 1. Real-Time Custom Values (Live Tweaks)
Tweak any element's design directly on the live webpage without touching DevTools console:
- **Colors**: Text Color, Background Color, and Border Color with 2-way sync native color pickers + HEX/RGB text inputs.
- **Typography**: Modify `font-size`, `font-weight`, `line-height`, and `letter-spacing`.
- **Dimensions & Layout**: Adjust `width`, `height`, `gap`, and `display` (flex, grid, block, inline-flex).
- **Spacing**: Test different `padding` and `margin` values with shorthand support.
- **Borders & Effects**: Live tweak `border-radius`, `border`, and `opacity`.
- **Live Sync**: Changes are applied instantly to the DOM (`!important` inline style), and the Box Model overlay resizes live in real-time.
- **↺ Reset All**: Revert all tweaks back to the element's original styles in one click.

### 📝 2. Instant Markdown Handover Notes (`Copy Note`)
Never manually type style change tickets again. InspectBae automatically tracks all modifications from baseline to current values:
- Click **Copy Note** at the bottom toolbar.
- Copies a clean, structured **Markdown** handover note ready to paste into **Slack, Notion, Jira, Linear, or GitHub Issues**.
- Includes:
  - Target element selector (`<button> #checkout-btn .btn.btn-primary`)
  - React Component name & component hierarchy tree
  - Radix UI primitive & state
  - Clear diff of modified properties (`14px` ➔ `18px`)
  - Copy-paste ready CSS snippet block

### 🎯 3. Floating Action Button (FAB) & Corner Docking
- Lightweight floating trigger button on the screen.
- Draggable with smooth inertia and automatic viewport edge clamping.
- Drops and docks cleanly into the nearest corner (`bottom-right`, `bottom-left`, `top-right`, `top-left`).
- Click FAB or press `Esc` to toggle inspection mode on/off.

### 📐 4. High-Precision Box Model Visualizer
- 4-layer visual overlay matching Chrome DevTools:
  - **Margin**: Dashed amber box (`rgba(246, 178, 107, 0.35)`)
  - **Border**: Solid yellow box (`rgba(255, 229, 153, 0.35)`)
  - **Padding**: Dashed green box (`rgba(182, 215, 168, 0.4)`)
  - **Content**: Blue accent outline (`#3b82f6`)
- Sub-pixel dimension indicators matching browser computed styles.

### 🧩 5. Framework & Token Reverse Engineering
- **React 16/17/18/19 Detection**: Traverses internal Fiber nodes (`__reactFiber$`) to extract the exact React Component name and parent hierarchy (e.g. `<UserProfileCard>` ➔ `<Dashboard>` ➔ `<App>`).
- **Radix UI Detection**: Identifies Radix primitives (`Dialog`, `DropdownMenu`, `Tooltip`, `Tabs`, `Popover`, `Select`) and runtime states (`[data-state="open"]`).
- **Tailwind CSS Utility Parsing**: Categorizes and displays matched Tailwind classes (colors, spacing, layout, typography, borders).
- **CSS Variables & Tokens**: Resolves variables (`var(--primary)`, `var(--radius)`, `var(--tw-*)`) from stylesheets showing runtime computed values.

### 🛡️ 6. Zero-Leak Shadow DOM Architecture
- All extension UI runs inside an isolated `ShadowRoot` (`mode: 'open'`).
- Extension styles never leak into the host page, and host CSS never breaks InspectBae.

---

## 🚀 Installation Guide

InspectBae works on all Chromium-based browsers: **Google Chrome, Microsoft Edge, Arc, Brave, and Opera**.

### Option A: Quick Install via Pre-built ZIP (No Node.js Required)

> **Best for Designers, Product Managers, and Non-Developers.**

1. **Download the Extension:**
   - Click to download: **[inspect-bae-extension.zip (v1.1.0)](https://github.com/strxbae/inspect-bae/releases/download/v1.1.0/inspect-bae-extension.zip)** (or [direct mirror](https://github.com/strxbae/inspect-bae/raw/main/inspect-bae-extension.zip)).
2. **Extract the ZIP:**
   - Unzip `inspect-bae-extension.zip` on your computer (you will get an `inspect-bae-extension` folder containing `manifest.json`, `content.js`, etc.).
3. **Load in your Browser:**
   - Follow the browser-specific steps below.

---

### Option B: Build from Source (For Developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/strxbae/inspect-bae.git
   cd inspect-bae
   ```
2. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```
   This generates the production-ready bundle in the `dist/` directory.

---

## 🌐 Loading Unpacked Extension in Browsers

### 🔵 Google Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the **`dist`** folder (if building from source) or the unzipped folder.
5. InspectBae is now installed! Click the puzzle icon in Chrome toolbar and **pin** InspectBae.

### 🌊 Microsoft Edge
1. Open Edge and navigate to `edge://extensions/`
2. Turn on **Developer mode** in the left sidebar.
3. Click **Load unpacked** at the top.
4. Select the **`dist`** folder.
5. Pin InspectBae to your toolbar.

### 🎨 Arc Browser
1. Open Arc and navigate to `arc://extensions/` (or press `Cmd+T` and type `Extensions`).
2. Toggle **Developer mode** in the top-right.
3. Click **Load unpacked** and select the **`dist`** folder.
4. InspectBae will be available in your Arc extensions bar.

### 🦁 Brave Browser
1. Open Brave and go to `brave://extensions/`
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the **`dist`** folder.

---

## 🎮 How to Use & Workflow

### 1. Start Inspecting
- Click the **InspectBae FAB button** on the bottom-right of any webpage, or click the extension icon in your toolbar, or press **`Cmd+Shift+X`** (macOS) / **`Ctrl+Shift+X`** (Windows).
- Hover over any element to view real-time box model overlays, typography, colors, and framework components.

### 2. Lock / Freeze Element Focus
- **Click** on the element you want to inspect (or press **`P`**).
- The inspector card locks onto that element so you can scroll through properties and click copy buttons without losing focus.

### 3. Tweak Values in Real-Time
- Click the **⚡ Custom Values** tab at the top of the card.
- Adjust **Font Size**, **Height**, **Width**, **Gap**, **Padding**, **Border Radius**, or pick new **Colors**.
- Watch the webpage update live immediately!
- If you want to start over, click **↺ Reset All**.

### 4. Export Handover Notes to Frontend Devs
- Click the **📝 Copy Note** button at the bottom of the card.
- Paste the generated Markdown directly into your team's chat or ticket.

---

## 📋 Sample Handover Note Output

Here is what gets copied when you click **Copy Note**:

```markdown
### 📝 Design Tweak Handover Notes

**Target Element:** `<button> #sample-btn .btn.btn-primary`
**React Component:** `<CheckoutButton>`

---

#### 🔄 Modified Properties (5)

- **Font Size** (`font-size`): `14px` ➔ **`18px`**
- **Height** (`height`): `40px` ➔ **`48px`**
- **Gap** (`gap`): `8px` ➔ **`16px`**
- **Background** (`background-color`): `#3b82f6` ➔ **`#0f172a`**
- **Border Radius** (`border-radius`): `8px` ➔ **`12px`**

#### 📋 CSS Snippet to Apply:
```css
/* Applied to <button> #sample-btn .btn.btn-primary */
font-size: 18px;
height: 48px;
gap: 16px;
background-color: #0f172a;
border-radius: 12px;
```

---
*Exported via InspectBae DevTools*
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Cmd + Shift + X`** (macOS) / **`Ctrl + Shift + X`** | Toggle Inspection Mode |
| **`P`** | Lock / Pin current element card |
| **`Esc`** | Unlock pinned element or exit inspection mode |
| **Click Element** | Freeze & lock inspection onto element |
| **Drag Card Topbar** | Move card anywhere on viewport (snaps to corner) |

*(Note: Shortcuts like `P` and `Esc` automatically suspend when typing into input fields inside Custom Values mode).*

---

## 🧪 Development & Testing

Run automated build and contract verification tests:

```bash
# Run build & verification test suite
npm test

# Run build in watch mode for active development
npm run watch
```

You can also test directly by opening `test/index.html` or `test/e2e-test.html` in your browser.

---

## 📁 Repository Structure

```text
inspect-bae/
├── dist/                          # Compiled extension ready for browser loading
├── src/
│   ├── manifest.json              # Manifest V3 extension configuration
│   ├── types.ts                   # TypeScript interfaces & change record types
│   ├── background.ts              # Service worker handling commands and tab badges
│   ├── content.ts                 # Content script entry & isolated Shadow DOM host
│   ├── popup.html                 # Extension toolbar popup interface
│   ├── popup.ts                   # Toolbar popup controller
│   ├── engine/
│   │   ├── inspector.ts           # Box model, metrics & style extraction engine
│   │   ├── color-parser.ts        # Color parser, HEX/RGB/HSL & Tailwind palette matcher
│   │   ├── react-detector.ts      # React Fiber (__reactFiber$) tree reverse-engineering
│   │   ├── radix-detector.ts      # Radix UI primitives and state detection
│   │   ├── tailwind-detector.ts   # Tailwind CSS utility class classifier
│   │   └── css-variables.ts       # CSS custom properties / design tokens resolver
│   └── ui/
│       ├── fab.ts                 # Draggable, interactive Floating Action Button
│       ├── overlay.ts             # 4-layer box model visualizer (Margin/Border/Padding)
│       ├── tooltip-card.ts        # Card UI with Inspect & Custom Values tabs
│       └── styles.ts              # Isolated CSS injected into ShadowRoot
├── test/
│   ├── index.html                 # Playground demo page
│   ├── e2e-test.html              # End-to-end integration test page
│   ├── verify-build.js            # Build & Manifest verification
│   └── verify-custom-values.js    # Custom values & Markdown note verification
├── inspect-bae-extension.zip      # Portable pre-built ZIP bundle for direct install
├── generate-icons.js              # Standalone Node.js PNG icon generator
├── build.js                       # High-performance esbuild bundler
└── package.json                   # Project configuration & scripts
```

---

## 📄 License

MIT © 2026 [InspectBae Team](https://github.com/strxbae/inspect-bae)
