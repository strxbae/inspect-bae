export const SHADOW_STYLES = `
/* CSS Reset inside Shadow DOM */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* FAB - Floating Action Button */
.ib-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  z-index: 2147483647;
  pointer-events: auto;
  cursor: grab;
  user-select: none;
  touch-action: none;
  border-radius: 50%;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
}

.ib-fab:active {
  cursor: grabbing;
  transform: scale(0.96);
}

.ib-fab-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #27272a;
}

.ib-fab-icon {
  color: #a1a1aa;
  transition: color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ib-fab:hover .ib-fab-icon {
  color: #fafafa;
  transform: rotate(15deg);
}

.ib-fab-active .ib-fab-inner {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-color: #818cf8;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
}

.ib-fab-active .ib-fab-icon {
  color: #ffffff;
  transform: rotate(90deg);
}

.ib-fab-pulse {
  display: none;
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #818cf8;
  animation: ib-pulse 1.8s infinite;
}

.ib-fab-active .ib-fab-pulse {
  display: block;
}

@keyframes ib-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* BOX MODEL OVERLAY */
.ib-overlay-container {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483645;
}

.ib-box-model {
  position: fixed;
  pointer-events: none;
  transition: top 0.05s ease-out, left 0.05s ease-out, width 0.05s ease-out, height 0.05s ease-out;
}

/* Margin Layer - Orange */
.ib-box-margin {
  background-color: rgba(246, 178, 107, 0.35);
  border: 1px dashed rgba(230, 145, 56, 0.8);
}

/* Border Layer - Yellow/Amber */
.ib-box-border {
  background-color: rgba(255, 229, 153, 0.35);
  border: 1px solid rgba(241, 194, 50, 0.85);
}

/* Padding Layer - Green */
.ib-box-padding {
  background-color: rgba(182, 215, 168, 0.4);
  border: 1px dashed rgba(106, 168, 79, 0.85);
}

/* Content Layer - Soft Blue / Cyan */
.ib-box-content {
  background-color: rgba(111, 168, 220, 0.3);
  box-shadow: 0 0 0 1.5px #3b82f6;
}

/* FLOATING TOOLTIP CARD */
.ib-tooltip-card {
  position: fixed;
  width: 390px;
  max-height: 560px;
  background: #0e0e11;
  color: #e4e4e7;
  border-radius: 14px;
  border: 1px solid #27272a;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
  z-index: 2147483646;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 12px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  animation: ib-pop 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

.ib-pinned {
  border-color: #6366f1 !important;
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.35), 0 0 0 2px #6366f1 !important;
}

.ib-card-topbar {
  cursor: grab;
}

.ib-card-topbar:active {
  cursor: grabbing;
}

/* Topbar */
.ib-card-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #141418;
  border-bottom: 1px solid #1f1f23;
  user-select: none;
}

.ib-topbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ib-logo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 8px #6366f1;
}

.ib-brand {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717a;
}

.ib-tag-badge {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
}

.ib-id-badge {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: #f59e0b;
}

.ib-meta-dim {
  font-size: 11px;
  color: #71717a;
}

.ib-topbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ib-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.15s, background-color 0.15s;
}

.ib-icon-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.08);
}

.ib-icon-btn.ib-active {
  opacity: 1;
  background: rgba(99, 102, 241, 0.25);
}

/* Card Content Body */
.ib-card-content {
  overflow-y: auto;
  max-height: 440px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ib-card-content::-webkit-scrollbar {
  width: 5px;
}
.ib-card-content::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 3px;
}

/* Framework Bar */
.ib-fw-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ib-fw-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
}

.ib-react-pill {
  background: rgba(0, 216, 255, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(0, 216, 255, 0.25);
}

.ib-radix-pill {
  background: rgba(142, 78, 198, 0.14);
  color: #c084fc;
  border: 1px solid rgba(142, 78, 198, 0.3);
}

.ib-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ib-pill-state {
  font-size: 10px;
  opacity: 0.8;
}

.ib-tw-pill {
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.25);
}

/* Dimension Strip */
.ib-dim-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #141418;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-dim-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ib-dim-label {
  font-size: 10px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ib-dim-val {
  font-size: 11px;
  font-weight: 600;
  color: #f4f4f5;
  font-family: ui-monospace, monospace;
}

/* Sections */
.ib-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ib-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ib-count {
  background: #27272a;
  color: #d4d4d8;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 9999px;
}

.ib-btn-subtle {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
}

.ib-btn-subtle:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
}

.ib-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  background: #141418;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-col-span-2 {
  grid-column: span 2;
}

.ib-prop-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ib-prop-key {
  font-size: 10px;
  color: #71717a;
}

.ib-prop-val {
  font-size: 11px;
  color: #f4f4f5;
  font-family: ui-monospace, monospace;
  word-break: break-all;
}

.ib-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ib-font-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ib-webfont-tag {
  font-size: 9px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: sans-serif;
  text-transform: uppercase;
}

/* Color Swatches */
.ib-color-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.ib-swatch {
  width: 13px;
  height: 13px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.ib-swatch-trans {
  background: repeating-conic-gradient(#3f3f46 0% 25%, #27272a 0% 50%) 50% / 6px 6px;
}

.ib-color-hex {
  font-size: 11px;
}

.ib-tw-mini-tag {
  font-size: 9px;
  background: #27272a;
  color: #38bdf8;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: ui-monospace, monospace;
}

/* Mini Box Model Visualizer */
.ib-mini-boxmodel {
  background: #141418;
  border: 1px solid #1f1f23;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  justify-content: center;
}

.ib-bm-margin {
  background: rgba(246, 178, 107, 0.15);
  border: 1px dashed rgba(230, 145, 56, 0.6);
  padding: 6px;
  border-radius: 6px;
  text-align: center;
  width: 100%;
}

.ib-bm-padding {
  background: rgba(182, 215, 168, 0.2);
  border: 1px dashed rgba(106, 168, 79, 0.6);
  padding: 6px;
  border-radius: 4px;
  margin-top: 4px;
}

.ib-bm-content {
  background: rgba(111, 168, 220, 0.25);
  border: 1px solid #3b82f6;
  border-radius: 3px;
  padding: 4px 0;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  color: #93c5fd;
  font-weight: 600;
  margin-top: 4px;
}

.ib-bm-label {
  font-size: 9px;
  font-family: ui-monospace, monospace;
  color: #a1a1aa;
}

/* Tailwind Pills */
.ib-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  background: #141418;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-tw-badge {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.ib-tw-badge:hover {
  background: rgba(56, 189, 248, 0.25);
  color: #ffffff;
}

.ib-more-badge {
  font-size: 10px;
  color: #71717a;
  padding: 2px 4px;
  align-self: center;
}

/* CSS Variables Grid */
.ib-vars-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #141418;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-var-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 10.5px;
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
}

.ib-var-item:hover {
  background: rgba(99, 102, 241, 0.15);
}

.ib-var-name {
  color: #c084fc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 55%;
}

.ib-var-val {
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40%;
}

/* Copy Toolbar */
.ib-copy-toolbar {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  background: #141418;
  border-top: 1px solid #1f1f23;
  flex-shrink: 0;
}

/* Mode Tabs */
.ib-mode-tabs {
  display: flex;
  background: #141418;
  border-bottom: 1px solid #1f1f23;
  padding: 4px 10px;
  gap: 6px;
  flex-shrink: 0;
}

.ib-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #a1a1aa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ib-tab-btn:hover {
  color: #fafafa;
  background: rgba(255, 255, 255, 0.05);
}

.ib-tab-btn.ib-tab-active {
  color: #ffffff;
  background: #27272a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.ib-tab-badge {
  background: #6366f1;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 9999px;
  line-height: 1;
}

/* Custom Values Editor */
.ib-custom-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ib-custom-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #141418;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-custom-status-text {
  font-size: 11px;
  color: #a1a1aa;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ib-live-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.ib-btn-reset-all {
  background: transparent;
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fb7185;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ib-btn-reset-all:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: #f43f5e;
  color: #ffffff;
}

.ib-custom-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ib-custom-sec-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717a;
  padding-left: 2px;
}

.ib-custom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #141418;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #1f1f23;
}

.ib-field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ib-field-group.ib-col-span-2 {
  grid-column: span 2;
}

.ib-field-label {
  font-size: 10px;
  color: #858592;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.ib-changed-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 6px #818cf8;
  display: inline-block;
}

.ib-input {
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #fafafa;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 6px 8px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.ib-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.ib-input.ib-input-changed {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
}

.ib-color-picker-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ib-color-input-native {
  -webkit-appearance: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  padding: 0;
  flex-shrink: 0;
}

.ib-color-input-native::-webkit-color-swatch-wrapper {
  padding: 0;
}

.ib-color-input-native::-webkit-color-swatch {
  border: 1px solid #3f3f46;
  border-radius: 5px;
}

.ib-select {
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #fafafa;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 6px 8px;
  width: 100%;
  outline: none;
  cursor: pointer;
}

.ib-select:focus {
  border-color: #6366f1;
}

.ib-select.ib-input-changed {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
}

.ib-copy-note-btn {
  background: #4f46e5 !important;
  color: #ffffff !important;
  border-color: #6366f1 !important;
  font-weight: 700 !important;
}

.ib-copy-note-btn:hover {
  background: #4338ca !important;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.4) !important;
}

.ib-action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: #1c1c21;
  color: #d4d4d8;
  border: 1px solid #2e2e34;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ib-action-btn:hover {
  background: #27272a;
  color: #ffffff;
  border-color: #3f3f46;
}

.ib-action-btn:active {
  transform: scale(0.98);
}

/* Toast Notification */
.ib-toast {
  position: fixed;
  bottom: 84px;
  right: 24px;
  background: #10b981;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 2147483647;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ib-toast-anim 2s forwards;
}

@keyframes ib-toast-anim {
  0% { opacity: 0; transform: translateY(10px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}
`;
