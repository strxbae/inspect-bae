import { InspectedElementData, StyleChangeRecord } from '../types';
import { parseColor } from '../engine/color-parser';

interface PropertyMeta {
  label: string;
  cssProp: string;
  category: 'color' | 'typography' | 'dimensions' | 'spacing' | 'style';
  placeholder?: string;
  type?: 'text' | 'color' | 'select';
  options?: string[];
}

const TRACKED_PROPERTIES: PropertyMeta[] = [
  // Colors
  { label: 'Text Color', cssProp: 'color', category: 'color', type: 'color' },
  { label: 'Background', cssProp: 'background-color', category: 'color', type: 'color' },
  { label: 'Border Color', cssProp: 'border-color', category: 'color', type: 'color' },
  // Typography
  { label: 'Font Size', cssProp: 'font-size', category: 'typography', type: 'text', placeholder: '16px' },
  { label: 'Font Weight', cssProp: 'font-weight', category: 'typography', type: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { label: 'Line Height', cssProp: 'line-height', category: 'typography', type: 'text', placeholder: '1.5 or 24px' },
  { label: 'Letter Spacing', cssProp: 'letter-spacing', category: 'typography', type: 'text', placeholder: '0px' },
  // Dimensions & Layout
  { label: 'Width', cssProp: 'width', category: 'dimensions', type: 'text', placeholder: 'auto or 200px' },
  { label: 'Height', cssProp: 'height', category: 'dimensions', type: 'text', placeholder: 'auto or 44px' },
  { label: 'Gap', cssProp: 'gap', category: 'dimensions', type: 'text', placeholder: '8px or 1rem' },
  { label: 'Display', cssProp: 'display', category: 'dimensions', type: 'select', options: ['block', 'flex', 'inline-flex', 'grid', 'inline-block', 'inline', 'none'] },
  // Spacing
  { label: 'Padding', cssProp: 'padding', category: 'spacing', type: 'text', placeholder: '8px 16px' },
  { label: 'Margin', cssProp: 'margin', category: 'spacing', type: 'text', placeholder: '0px auto' },
  // Style & Effects
  { label: 'Border Radius', cssProp: 'border-radius', category: 'style', type: 'text', placeholder: '8px or 9999px' },
  { label: 'Border', cssProp: 'border', category: 'style', type: 'text', placeholder: '1px solid #3b82f6' },
  { label: 'Opacity', cssProp: 'opacity', category: 'style', type: 'text', placeholder: '1 or 0.8' },
];

export class TooltipCard {
  private card: HTMLDivElement;
  private isPinned = false;
  private activeTab: 'inspect' | 'custom' = 'inspect';
  private currentData: InspectedElementData | null = null;
  private currentTarget: HTMLElement | null = null;
  private onCopyCallback?: (text: string, label: string) => void;
  private onElementModified?: (element: HTMLElement) => void;
  private userHasMovedCard = false;
  private currentCorner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';

  // Live style changes tracking
  private originalStyles: Map<string, string> = new Map();
  private originalInlineStyles: Map<string, string> = new Map();
  private styleChanges: Map<string, StyleChangeRecord> = new Map();

  // Dragging state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardStartX = 0;
  private cardStartY = 0;

  constructor(
    shadowRoot: ShadowRoot,
    onCopy?: (text: string, label: string) => void,
    onElementModified?: (element: HTMLElement) => void
  ) {
    this.onCopyCallback = onCopy;
    this.onElementModified = onElementModified;
    this.card = document.createElement('div');
    this.card.className = 'ib-tooltip-card';
    this.card.style.display = 'none';

    shadowRoot.appendChild(this.card);
    this.initCardDragging();
    this.applyCornerPosition(this.currentCorner);
  }

  public getPinned(): boolean {
    return this.isPinned;
  }

  public setPinned(pinned: boolean): void {
    this.isPinned = pinned;
    this.card.classList.toggle('ib-pinned', this.isPinned);
    const pinBtn = this.card.querySelector('.ib-pin-btn');
    if (pinBtn) {
      pinBtn.classList.toggle('ib-active', this.isPinned);
      pinBtn.setAttribute('title', this.isPinned ? 'Locked (Click to unlock)' : 'Click or click element to lock');
      pinBtn.textContent = this.isPinned ? '🔒' : '🔓';
    }
  }

  public update(data: InspectedElementData, targetElement: HTMLElement): void {
    if (this.isPinned) return;

    if (this.currentTarget !== targetElement) {
      this.currentTarget = targetElement;
      this.captureBaselineStyles(targetElement);
      this.styleChanges.clear();
    }

    this.currentData = data;
    this.render();
    if (!this.userHasMovedCard) {
      this.applyCornerPosition(this.currentCorner);
    }
    this.card.style.display = 'flex';
  }

  public hide(): void {
    if (!this.isPinned) {
      this.card.style.display = 'none';
    }
  }

  public togglePin(): void {
    this.setPinned(!this.isPinned);
  }

  private captureBaselineStyles(element: HTMLElement): void {
    this.originalStyles.clear();
    this.originalInlineStyles.clear();
    const computed = window.getComputedStyle(element);

    TRACKED_PROPERTIES.forEach(prop => {
      this.originalInlineStyles.set(prop.cssProp, element.style.getPropertyValue(prop.cssProp));

      let val = '';
      if (prop.cssProp === 'color') {
        val = parseColor(computed.color).hex;
      } else if (prop.cssProp === 'background-color') {
        val = parseColor(computed.backgroundColor).hex;
      } else if (prop.cssProp === 'border-color') {
        val = parseColor(computed.borderColor).hex;
      } else if (prop.cssProp === 'padding') {
        val = getBoxModelShorthand(computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft);
      } else if (prop.cssProp === 'margin') {
        val = getBoxModelShorthand(computed.marginTop, computed.marginRight, computed.marginBottom, computed.marginLeft);
      } else if (prop.cssProp === 'width') {
        val = element.style.width || `${Math.round(element.getBoundingClientRect().width)}px`;
      } else if (prop.cssProp === 'height') {
        val = element.style.height || `${Math.round(element.getBoundingClientRect().height)}px`;
      } else if (prop.cssProp === 'gap') {
        val = computed.gap && computed.gap !== 'normal' ? computed.gap : '0px';
      } else {
        val = computed.getPropertyValue(prop.cssProp) || '';
      }

      this.originalStyles.set(prop.cssProp, val);
    });
  }

  private applyCornerPosition(corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'): void {
    this.currentCorner = corner;
    const margin = 24;
    const cardWidth = 390;
    const cardHeight = Math.min(this.card.offsetHeight || 460, 560);
    const viewportWidth = window.innerWidth || 1200;
    const viewportHeight = window.innerHeight || 800;

    let left = viewportWidth - cardWidth - margin;
    let top = viewportHeight - cardHeight - margin;

    if (corner === 'bottom-left') {
      left = margin;
      top = viewportHeight - cardHeight - margin;
    } else if (corner === 'top-right') {
      left = viewportWidth - cardWidth - margin;
      top = margin;
    } else if (corner === 'top-left') {
      left = margin;
      top = margin;
    }

    this.card.style.left = `${Math.round(left)}px`;
    this.card.style.top = `${Math.round(top)}px`;
    this.card.style.right = 'auto';
    this.card.style.bottom = 'auto';
  }

  private initCardDragging(): void {
    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;

      let newLeft = this.cardStartX + dx;
      let newTop = this.cardStartY + dy;

      const pad = 12;
      const maxX = (window.innerWidth || 1200) - (this.card.offsetWidth || 390) - pad;
      const maxY = (window.innerHeight || 800) - (this.card.offsetHeight || 460) - pad;

      newLeft = Math.max(pad, Math.min(maxX, newLeft));
      newTop = Math.max(pad, Math.min(maxY, newTop));

      this.card.style.left = `${newLeft}px`;
      this.card.style.top = `${newTop}px`;
      this.userHasMovedCard = true;
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });

      const rect = this.card.getBoundingClientRect();
      const midX = window.innerWidth / 2;
      const midY = window.innerHeight / 2;
      const isRight = (rect.left + rect.width / 2) >= midX;
      const isBottom = (rect.top + rect.height / 2) >= midY;

      if (isBottom && isRight) this.currentCorner = 'bottom-right';
      else if (isBottom && !isRight) this.currentCorner = 'bottom-left';
      else if (!isBottom && isRight) this.currentCorner = 'top-right';
      else this.currentCorner = 'top-left';
    };

    this.card.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ib-card-topbar') || target.closest('button') || target.closest('.ib-topbar-actions')) {
        return;
      }
      if (e.button !== 0) return;

      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const rect = this.card.getBoundingClientRect();
      this.cardStartX = rect.left;
      this.cardStartY = rect.top;

      window.addEventListener('pointermove', onPointerMove, { capture: true });
      window.addEventListener('pointerup', onPointerUp, { capture: true });
      e.preventDefault();
    });
  }

  private render(): void {
    if (!this.currentData) return;
    const d = this.currentData;

    const tagDisplay = `<span class="ib-badge ib-tag-badge">&lt;${d.tagName}&gt;</span>`;
    const idDisplay = d.id ? `<span class="ib-id-badge">#${escapeHtml(d.id)}</span>` : '';
    const classCount = d.classList.length ? `<span class="ib-meta-dim">.${d.classList.slice(0, 2).map(escapeHtml).join('.')} ${d.classList.length > 2 ? `+${d.classList.length - 2}` : ''}</span>` : '';

    const changeCount = this.styleChanges.size;

    this.card.innerHTML = `
      <div class="ib-card-topbar">
        <div class="ib-topbar-title">
          <div class="ib-logo-dot"></div>
          <span class="ib-brand">InspectBae</span>
          ${tagDisplay}
          ${idDisplay}
          ${classCount}
        </div>
        <div class="ib-topbar-actions">
          <button class="ib-icon-btn ib-pin-btn ${this.isPinned ? 'ib-active' : ''}" title="${this.isPinned ? 'Locked (Click to unlock)' : 'Click to lock/freeze info'}">
            ${this.isPinned ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      <!-- Mode Tabs -->
      <div class="ib-mode-tabs">
        <button type="button" class="ib-tab-btn ${this.activeTab === 'inspect' ? 'ib-tab-active' : ''}" data-mode="inspect">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Inspect
        </button>
        <button type="button" class="ib-tab-btn ${this.activeTab === 'custom' ? 'ib-tab-active' : ''}" data-mode="custom">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Custom Values
          ${changeCount > 0 ? `<span class="ib-tab-badge">${changeCount}</span>` : ''}
        </button>
      </div>

      <!-- Scrollable Content Body -->
      <div class="ib-card-content">
        ${this.activeTab === 'inspect' ? this.renderInspectTab() : this.renderCustomTab()}
      </div>

      <!-- Persistent Copy Toolbar Footer -->
      <div class="ib-copy-toolbar">
        <button type="button" class="ib-action-btn ib-copy-note-btn" title="Copy handover notes in Markdown format">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Copy Note
        </button>
        <button type="button" class="ib-action-btn ib-copy-css" title="Copy clean CSS snippet">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          CSS
        </button>
        ${d.frameworks.tailwind.matchedClasses.length > 0 ? `
          <button type="button" class="ib-action-btn ib-copy-tw-all" title="Copy Tailwind utility classes">
            Tailwind
          </button>
        ` : ''}
        <button type="button" class="ib-action-btn ib-copy-color-btn" title="Copy element colors">
          Color
        </button>
        ${d.frameworks.react ? `
          <button type="button" class="ib-action-btn ib-copy-comp-btn" title="Copy React component name">
            Component
          </button>
        ` : ''}
      </div>
    `;

    this.bindEvents();
    if (this.activeTab === 'custom') {
      this.bindCustomTabEvents();
    }
  }

  private renderInspectTab(): string {
    if (!this.currentData) return '';
    const d = this.currentData;

    const reactBadge = d.frameworks.react
      ? `<div class="ib-fw-pill ib-react-pill" title="React Component">
           <svg width="12" height="12" viewBox="-11.5 -10.23174 23 20.46348"><circle cx="0" cy="0" r="2.05" fill="#00d8ff"/><g stroke="#00d8ff" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>
           <span>${escapeHtml(d.frameworks.react.componentName)}</span>
         </div>`
      : '';

    const radixBadge = d.frameworks.radix
      ? `<div class="ib-fw-pill ib-radix-pill" title="Radix UI Primitive">
           <span class="ib-pill-dot" style="background:#8e4ec6;"></span>
           <span>Radix: ${escapeHtml(d.frameworks.radix.primitive)}</span>
           ${d.frameworks.radix.state ? `<span class="ib-pill-state">[${escapeHtml(d.frameworks.radix.state)}]</span>` : ''}
         </div>`
      : '';

    const tailwindPill = d.frameworks.tailwind.matchedClasses.length > 0
      ? `<div class="ib-fw-pill ib-tw-pill" title="Tailwind CSS">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>
           <span>${d.frameworks.tailwind.matchedClasses.length} Tailwind utilities</span>
         </div>`
      : '';

    const bgSwatch = renderColorSwatch('BG', d.styling.backgroundColor);
    const textSwatch = renderColorSwatch('Text', d.typography.color);

    const m = d.boxModel.margin;
    const p = d.boxModel.padding;

    let cssVarRows = '';
    if (d.frameworks.cssVariables.length > 0) {
      cssVarRows = `
        <div class="ib-section">
          <div class="ib-section-header">
            <span>CSS Variables & Tokens</span>
            <span class="ib-count">${d.frameworks.cssVariables.length}</span>
          </div>
          <div class="ib-vars-grid">
            ${d.frameworks.cssVariables.map(v => `
              <div class="ib-var-item" data-copy="var(${escapeHtml(v.variableName)})">
                <span class="ib-var-name" title="${escapeHtml(v.variableName)}">${escapeHtml(v.variableName)}</span>
                <span class="ib-var-val" title="${escapeHtml(v.computedValue)}">${escapeHtml(v.computedValue)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let tailwindSection = '';
    if (d.frameworks.tailwind.matchedClasses.length > 0) {
      const displayClasses = d.frameworks.tailwind.matchedClasses.slice(0, 14);
      const remaining = d.frameworks.tailwind.matchedClasses.length - displayClasses.length;

      tailwindSection = `
        <div class="ib-section">
          <div class="ib-section-header">
            <span>Tailwind Classes</span>
            <button class="ib-btn-subtle ib-copy-tw-btn">Copy All</button>
          </div>
          <div class="ib-pills-wrap">
            ${displayClasses.map(c => `<span class="ib-tw-badge" data-copy="${escapeHtml(c)}">${escapeHtml(c)}</span>`).join('')}
            ${remaining > 0 ? `<span class="ib-more-badge">+${remaining} more</span>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <!-- Framework Badges -->
      ${(reactBadge || radixBadge || tailwindPill) ? `
        <div class="ib-fw-bar">
          ${reactBadge}
          ${radixBadge}
          ${tailwindPill}
        </div>
      ` : ''}

      <!-- Dimensions Strip -->
      <div class="ib-dim-strip">
        <div class="ib-dim-item">
          <span class="ib-dim-label">Dimensions</span>
          <span class="ib-dim-val">${d.rect.width} × ${d.rect.height} px</span>
        </div>
        <div class="ib-dim-item">
          <span class="ib-dim-label">Display</span>
          <span class="ib-dim-val">${d.styling.display}</span>
        </div>
        <div class="ib-dim-item">
          <span class="ib-dim-label">Position</span>
          <span class="ib-dim-val">${d.styling.position}</span>
        </div>
      </div>

      <!-- Typography -->
      <div class="ib-section">
        <div class="ib-section-header">
          <span>Typography</span>
          <button class="ib-btn-subtle ib-copy-font-btn">Copy Font</button>
        </div>
        <div class="ib-grid-2col">
          <div class="ib-prop-row">
            <span class="ib-prop-key">Family</span>
            <span class="ib-prop-val ib-font-name" title="${escapeHtml(d.typography.fontFamily)}">
              ${escapeHtml(d.typography.detectedFontName)}
              ${d.typography.isWebFont ? '<span class="ib-webfont-tag">webfont</span>' : ''}
            </span>
          </div>
          <div class="ib-prop-row">
            <span class="ib-prop-key">Size / Weight</span>
            <span class="ib-prop-val">${d.typography.fontSize} / ${d.typography.fontWeight}</span>
          </div>
          <div class="ib-prop-row">
            <span class="ib-prop-key">Line Height</span>
            <span class="ib-prop-val">${d.typography.lineHeight}</span>
          </div>
          <div class="ib-prop-row">
            <span class="ib-prop-key">Color</span>
            <span class="ib-prop-val">${textSwatch}</span>
          </div>
        </div>
      </div>

      <!-- Box Model Visualizer -->
      <div class="ib-section">
        <div class="ib-section-header">
          <span>Box Model (m / p)</span>
        </div>
        <div class="ib-mini-boxmodel">
          <div class="ib-bm-margin" title="Margin: ${m.top} ${m.right} ${m.bottom} ${m.left}">
            <span class="ib-bm-label">M: ${m.top} ${m.right} ${m.bottom} ${m.left}</span>
            <div class="ib-bm-padding" title="Padding: ${p.top} ${p.right} ${p.bottom} ${p.left}">
              <span class="ib-bm-label">P: ${p.top} ${p.right} ${p.bottom} ${p.left}</span>
              <div class="ib-bm-content">${d.rect.width} × ${d.rect.height}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Styling & Effects -->
      <div class="ib-section">
        <div class="ib-section-header">
          <span>Styling & Effects</span>
        </div>
        <div class="ib-grid-2col">
          <div class="ib-prop-row">
            <span class="ib-prop-key">Background</span>
            <span class="ib-prop-val">${bgSwatch}</span>
          </div>
          <div class="ib-prop-row">
            <span class="ib-prop-key">Border Radius</span>
            <span class="ib-prop-val">${d.styling.borderRadius.value} ${d.styling.borderRadius.tailwindMatch ? `<span class="ib-tw-mini-tag">${d.styling.borderRadius.tailwindMatch}</span>` : ''}</span>
          </div>
          ${d.styling.border !== 'none' ? `
            <div class="ib-prop-row ib-col-span-2">
              <span class="ib-prop-key">Border</span>
              <span class="ib-prop-val ib-truncate" title="${escapeHtml(d.styling.border)}">${escapeHtml(d.styling.border)}</span>
            </div>
          ` : ''}
          ${d.styling.boxShadow !== 'none' ? `
            <div class="ib-prop-row ib-col-span-2">
              <span class="ib-prop-key">Shadow</span>
              <span class="ib-prop-val ib-truncate" title="${escapeHtml(d.styling.boxShadow)}">${escapeHtml(d.styling.boxShadow)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Tailwind Section -->
      ${tailwindSection}

      <!-- CSS Variables Section -->
      ${cssVarRows}
    `;
  }

  private renderCustomTab(): string {
    const changeCount = this.styleChanges.size;

    const renderInputRow = (prop: PropertyMeta) => {
      const changed = this.styleChanges.has(prop.cssProp);
      const currentVal = changed
        ? this.styleChanges.get(prop.cssProp)!.current
        : (this.originalStyles.get(prop.cssProp) || '');

      let inputHtml = '';
      if (prop.type === 'color') {
        const hex7 = toHex7(currentVal);
        inputHtml = `
          <div class="ib-color-picker-row">
            <input type="color" class="ib-color-input-native" data-color-sync="${prop.cssProp}" value="${hex7}" />
            <input type="text" class="ib-input ${changed ? 'ib-input-changed' : ''}" data-prop="${prop.cssProp}" value="${escapeHtml(currentVal)}" placeholder="#rrggbb or rgb()" />
          </div>
        `;
      } else if (prop.type === 'select') {
        inputHtml = `
          <select class="ib-select ${changed ? 'ib-input-changed' : ''}" data-prop="${prop.cssProp}">
            ${prop.options?.map(opt => `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        `;
      } else {
        inputHtml = `
          <input type="text" class="ib-input ${changed ? 'ib-input-changed' : ''}" data-prop="${prop.cssProp}" value="${escapeHtml(currentVal)}" placeholder="${prop.placeholder || ''}" />
        `;
      }

      return `
        <div class="ib-field-group">
          <label class="ib-field-label">
            <span>${prop.label}</span>
            ${changed ? '<span class="ib-changed-dot" title="Modified value"></span>' : ''}
          </label>
          ${inputHtml}
        </div>
      `;
    };

    const colorFields = TRACKED_PROPERTIES.filter(p => p.category === 'color').map(renderInputRow).join('');
    const typographyFields = TRACKED_PROPERTIES.filter(p => p.category === 'typography').map(renderInputRow).join('');
    const dimensionFields = TRACKED_PROPERTIES.filter(p => p.category === 'dimensions').map(renderInputRow).join('');
    const spacingFields = TRACKED_PROPERTIES.filter(p => p.category === 'spacing').map(renderInputRow).join('');
    const styleFields = TRACKED_PROPERTIES.filter(p => p.category === 'style').map(renderInputRow).join('');

    return `
      <div class="ib-custom-container">
        <!-- Status Bar -->
        <div class="ib-custom-status-bar">
          <div class="ib-custom-status-text">
            <span class="ib-live-indicator"></span>
            <span>Live Edit Active ${changeCount > 0 ? `(${changeCount} tweaked)` : ''}</span>
          </div>
          ${changeCount > 0 ? `
            <button type="button" class="ib-btn-reset-all" title="Revert all tweaked styles to baseline">
              ↺ Reset All
            </button>
          ` : ''}
        </div>

        <!-- Colors -->
        <div class="ib-custom-section">
          <span class="ib-custom-sec-title">Colors</span>
          <div class="ib-custom-grid">
            ${colorFields}
          </div>
        </div>

        <!-- Typography -->
        <div class="ib-custom-section">
          <span class="ib-custom-sec-title">Typography</span>
          <div class="ib-custom-grid">
            ${typographyFields}
          </div>
        </div>

        <!-- Layout & Size -->
        <div class="ib-custom-section">
          <span class="ib-custom-sec-title">Dimensions & Layout</span>
          <div class="ib-custom-grid">
            ${dimensionFields}
          </div>
        </div>

        <!-- Spacing -->
        <div class="ib-custom-section">
          <span class="ib-custom-sec-title">Spacing (Padding & Margin)</span>
          <div class="ib-custom-grid">
            ${spacingFields}
          </div>
        </div>

        <!-- Borders & Effects -->
        <div class="ib-custom-section">
          <span class="ib-custom-sec-title">Borders & Effects</span>
          <div class="ib-custom-grid">
            ${styleFields}
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.currentData) return;
    const d = this.currentData;

    // Pin button
    const pinBtn = this.card.querySelector('.ib-pin-btn');
    pinBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePin();
    });

    // Tab buttons
    const tabBtns = this.card.querySelectorAll('.ib-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.getAttribute('data-mode') as 'inspect' | 'custom';
        if (mode && mode !== this.activeTab) {
          this.activeTab = mode;
          if (mode === 'custom') {
            this.setPinned(true);
          }
          this.render();
        }
      });
    });

    // Copy Font
    const copyFontBtn = this.card.querySelector('.ib-copy-font-btn');
    copyFontBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = `font-family: ${d.typography.fontFamily};\nfont-size: ${d.typography.fontSize};\nfont-weight: ${d.typography.fontWeight};`;
      this.copy(text, 'Font properties copied');
    });

    // Copy Tailwind Classes
    const copyTwBtns = this.card.querySelectorAll('.ib-copy-tw-btn, .ib-copy-tw-all');
    copyTwBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.copy(d.frameworks.tailwind.matchedClasses.join(' '), 'Tailwind classes copied');
      });
    });

    // Individual copy pills
    const copyablePills = this.card.querySelectorAll('[data-copy]');
    copyablePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = pill.getAttribute('data-copy');
        if (text) {
          this.copy(text, `Copied "${text}"`);
        }
      });
    });

    // Bottom Action Buttons
    const copyNoteBtn = this.card.querySelector('.ib-copy-note-btn');
    copyNoteBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const note = this.generateMarkdownNote();
      this.copy(note, 'Handover Note (Markdown) copied!');
    });

    const copyCssBtn = this.card.querySelector('.ib-copy-css');
    copyCssBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cssLines = [
        `/* <${d.tagName}> styles */`,
        `width: ${d.rect.width}px;`,
        `height: ${d.rect.height}px;`,
        `font-family: ${d.typography.fontFamily};`,
        `font-size: ${d.typography.fontSize};`,
        `font-weight: ${d.typography.fontWeight};`,
        `color: ${d.typography.color.hex};`,
        d.styling.backgroundColor.hex !== 'transparent' ? `background-color: ${d.styling.backgroundColor.hex};` : '',
        d.styling.borderRadius.value !== '0px' ? `border-radius: ${d.styling.borderRadius.value};` : '',
        d.styling.border !== 'none' ? `border: ${d.styling.border};` : '',
        d.styling.boxShadow !== 'none' ? `box-shadow: ${d.styling.boxShadow};` : '',
        `padding: ${d.boxModel.padding.top}px ${d.boxModel.padding.right}px ${d.boxModel.padding.bottom}px ${d.boxModel.padding.left}px;`,
        `margin: ${d.boxModel.margin.top}px ${d.boxModel.margin.right}px ${d.boxModel.margin.bottom}px ${d.boxModel.margin.left}px;`
      ].filter(Boolean).join('\n');
      this.copy(cssLines, 'CSS snippet copied');
    });

    const copyColorBtn = this.card.querySelector('.ib-copy-color-btn');
    copyColorBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const colorVal = d.styling.backgroundColor.hex !== 'transparent'
        ? d.styling.backgroundColor.hex
        : d.typography.color.hex;
      this.copy(colorVal, `Color ${colorVal} copied`);
    });

    const copyCompBtn = this.card.querySelector('.ib-copy-comp-btn');
    copyCompBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (d.frameworks.react) {
        this.copy(d.frameworks.react.componentName, `Component <${d.frameworks.react.componentName}> copied`);
      }
    });
  }

  private bindCustomTabEvents(): void {
    // Reset all button
    const resetBtn = this.card.querySelector('.ib-btn-reset-all');
    resetBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.resetAllChanges();
    });

    // Inputs
    const propInputs = this.card.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-prop]');
    propInputs.forEach(input => {
      const prop = input.getAttribute('data-prop');
      if (!prop) return;

      const onInput = () => {
        this.applyLiveStyle(prop, input.value);

        // Synchronize corresponding native color picker if present
        const colorPicker = this.card.querySelector<HTMLInputElement>(`[data-color-sync="${prop}"]`);
        if (colorPicker) {
          const hex = toHex7(input.value);
          if (hex !== '#000000' || input.value.toLowerCase() === '#000000' || input.value.toLowerCase() === 'black') {
            colorPicker.value = hex;
          }
        }
      };

      input.addEventListener('input', onInput);
      input.addEventListener('change', onInput);
    });

    // Native Color Pickers
    const colorPickers = this.card.querySelectorAll<HTMLInputElement>('[data-color-sync]');
    colorPickers.forEach(picker => {
      const prop = picker.getAttribute('data-color-sync');
      if (!prop) return;

      const onColorChange = () => {
        const textInput = this.card.querySelector<HTMLInputElement>(`input[data-prop="${prop}"]`);
        if (textInput) {
          textInput.value = picker.value;
        }
        this.applyLiveStyle(prop, picker.value);
      };

      picker.addEventListener('input', onColorChange);
      picker.addEventListener('change', onColorChange);
    });
  }

  private applyLiveStyle(cssProp: string, value: string): void {
    if (!this.currentTarget) return;
    const trimmed = value.trim();
    const original = this.originalStyles.get(cssProp) ?? '';

    if (trimmed === '' || trimmed === original) {
      const origInline = this.originalInlineStyles.get(cssProp);
      if (origInline) {
        this.currentTarget.style.setProperty(cssProp, origInline);
      } else {
        this.currentTarget.style.removeProperty(cssProp);
      }
      this.styleChanges.delete(cssProp);
    } else {
      this.currentTarget.style.setProperty(cssProp, trimmed, 'important');
      const meta = TRACKED_PROPERTIES.find(p => p.cssProp === cssProp);
      this.styleChanges.set(cssProp, {
        label: meta ? meta.label : cssProp,
        cssProp,
        original: original || 'initial',
        current: trimmed
      });
    }

    this.updateVisualChangeIndicators(cssProp);

    if (this.onElementModified) {
      try {
        this.onElementModified(this.currentTarget);
      } catch (err) {
        console.error('[InspectBae] Error updating modified element:', err);
      }
    }
  }

  private updateVisualChangeIndicators(cssProp: string): void {
    const isChanged = this.styleChanges.has(cssProp);
    const input = this.card.querySelector<HTMLElement>(`[data-prop="${cssProp}"]`);
    if (input) {
      input.classList.toggle('ib-input-changed', isChanged);
      const group = input.closest('.ib-field-group');
      if (group) {
        const label = group.querySelector('.ib-field-label');
        if (label) {
          const dot = label.querySelector('.ib-changed-dot');
          if (isChanged && !dot) {
            const newDot = document.createElement('span');
            newDot.className = 'ib-changed-dot';
            newDot.title = 'Modified value';
            label.appendChild(newDot);
          } else if (!isChanged && dot) {
            dot.remove();
          }
        }
      }
    }

    // Update tab badge count
    const customTab = this.card.querySelector('[data-mode="custom"]');
    if (customTab) {
      const count = this.styleChanges.size;
      let badge = customTab.querySelector('.ib-tab-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'ib-tab-badge';
          customTab.appendChild(badge);
        }
        badge.textContent = `${count}`;
      } else if (badge) {
        badge.remove();
      }
    }

    // Update status text
    const statusText = this.card.querySelector('.ib-custom-status-text span:nth-child(2)');
    if (statusText) {
      const count = this.styleChanges.size;
      statusText.textContent = `Live Edit Active ${count > 0 ? `(${count} tweaked)` : ''}`;
    }

    // Update Reset button visibility
    const statusBar = this.card.querySelector('.ib-custom-status-bar');
    if (statusBar) {
      let resetBtn = statusBar.querySelector('.ib-btn-reset-all');
      if (this.styleChanges.size > 0 && !resetBtn) {
        resetBtn = document.createElement('button');
        resetBtn.setAttribute('type', 'button');
        resetBtn.className = 'ib-btn-reset-all';
        resetBtn.setAttribute('title', 'Revert all tweaked styles to baseline');
        resetBtn.textContent = '↺ Reset All';
        resetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.resetAllChanges();
        });
        statusBar.appendChild(resetBtn);
      } else if (this.styleChanges.size === 0 && resetBtn) {
        resetBtn.remove();
      }
    }
  }

  private resetAllChanges(): void {
    if (!this.currentTarget) return;

    this.styleChanges.forEach((_, cssProp) => {
      const origInline = this.originalInlineStyles.get(cssProp);
      if (origInline) {
        this.currentTarget!.style.setProperty(cssProp, origInline);
      } else {
        this.currentTarget!.style.removeProperty(cssProp);
      }
    });

    this.styleChanges.clear();
    this.render();

    if (this.onElementModified) {
      this.onElementModified(this.currentTarget);
    }

    if (this.onCopyCallback) {
      this.onCopyCallback('', 'All styles reverted to original');
    }
  }

  private generateMarkdownNote(): string {
    if (!this.currentData || !this.currentTarget) return '';
    const d = this.currentData;
    const changes = Array.from(this.styleChanges.values());

    const elementIdentifier = [
      `<${d.tagName}>`,
      d.id ? `#${d.id}` : '',
      d.classList.length ? `.${d.classList.slice(0, 3).map(escapeHtml).join('.')}` : ''
    ].filter(Boolean).join(' ');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let md = `### 📝 Design Tweak Handover Notes\n\n`;
    md += `**Target Element:** \`${elementIdentifier}\`\n`;
    if (d.frameworks.react?.componentName) {
      md += `**React Component:** \`<${d.frameworks.react.componentName}>\`\n`;
      if (d.frameworks.react.hierarchy && d.frameworks.react.hierarchy.length > 1) {
        md += `**Component Tree:** ${d.frameworks.react.hierarchy.map(h => `\`<${h}>\``).join(' ➔ ')}\n`;
      }
    }
    if (d.frameworks.radix?.primitive) {
      md += `**Radix UI Primitive:** \`${d.frameworks.radix.primitive}\`${d.frameworks.radix.state ? ` (state: \`${d.frameworks.radix.state}\`)` : ''}\n`;
    }
    md += `\n---\n\n`;

    if (changes.length > 0) {
      md += `#### 🔄 Modified Properties (${changes.length})\n\n`;
      changes.forEach(c => {
        md += `- **${c.label}** (\`${c.cssProp}\`): \`${c.original}\` ➔ **\`${c.current}\`**\n`;
      });
      md += `\n#### 📋 CSS Snippet to Apply:\n\`\`\`css\n/* Applied to ${elementIdentifier} */\n`;
      changes.forEach(c => {
        md += `${c.cssProp}: ${c.current};\n`;
      });
      md += `\`\`\`\n`;
    } else {
      md += `#### 📐 Current Computed Specs (No custom changes made)\n\n`;
      md += `- **Dimensions:** \`${d.rect.width} × ${d.rect.height}px\`\n`;
      md += `- **Display / Position:** \`${d.styling.display}\` / \`${d.styling.position}\`\n`;
      md += `- **Font:** \`${d.typography.fontFamily}\` | \`${d.typography.fontSize}\` / \`${d.typography.fontWeight}\` | \`${d.typography.lineHeight}\`\n`;
      md += `- **Color:** \`${d.typography.color.hex}\`\n`;
      md += `- **Background:** \`${d.styling.backgroundColor.hex}\`\n`;
      md += `- **Padding:** \`${d.boxModel.padding.top}px ${d.boxModel.padding.right}px ${d.boxModel.padding.bottom}px ${d.boxModel.padding.left}px\`\n`;
      md += `- **Margin:** \`${d.boxModel.margin.top}px ${d.boxModel.margin.right}px ${d.boxModel.margin.bottom}px ${d.boxModel.margin.left}px\`\n`;
      if (d.styling.borderRadius.value !== '0px') {
        md += `- **Border Radius:** \`${d.styling.borderRadius.value}\`\n`;
      }
      if (d.styling.border !== 'none') {
        md += `- **Border:** \`${d.styling.border}\`\n`;
      }
    }

    md += `\n---\n*Exported via InspectBae DevTools (${timeStr})*\n`;
    return md;
  }

  private copy(text: string, label: string): void {
    if (this.onCopyCallback) {
      try {
        this.onCopyCallback(text, label);
      } catch (e) {
        console.error('Error invoking onCopyCallback:', e);
      }
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    }
  }

  public destroy(): void {
    this.card.remove();
  }
}

function renderColorSwatch(label: string, color: any): string {
  if (color.hex === 'transparent') {
    return `<span class="ib-color-wrap"><span class="ib-swatch ib-swatch-trans"></span><span class="ib-color-val">transparent</span></span>`;
  }

  return `
    <span class="ib-color-wrap" data-copy="${escapeHtml(color.hex)}" title="Click to copy ${escapeHtml(color.hex)}">
      <span class="ib-swatch" style="background:${escapeHtml(color.hex)};"></span>
      <span class="ib-color-hex">${escapeHtml(color.hex)}</span>
      ${color.tailwindClass ? `<span class="ib-tw-mini-tag">${escapeHtml(color.tailwindClass)}</span>` : ''}
    </span>
  `;
}

function toHex7(colorStr: string): string {
  if (!colorStr || colorStr === 'transparent') return '#000000';
  const parsed = parseColor(colorStr);
  if (parsed.hex && parsed.hex.startsWith('#') && parsed.hex.length >= 7) {
    return parsed.hex.slice(0, 7);
  }
  return '#000000';
}

function getBoxModelShorthand(top: string, right: string, bottom: string, left: string): string {
  if (top === right && right === bottom && bottom === left) {
    return top;
  }
  if (top === bottom && right === left) {
    return `${top} ${right}`;
  }
  return `${top} ${right} ${bottom} ${left}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
