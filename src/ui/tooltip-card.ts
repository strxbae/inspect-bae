import { InspectedElementData } from '../types';

export class TooltipCard {
  private card: HTMLDivElement;
  private isPinned = false;
  private currentData: InspectedElementData | null = null;
  private onCopyCallback?: (text: string, label: string) => void;
  private userHasMovedCard = false;
  private currentCorner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';

  // Dragging state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardStartX = 0;
  private cardStartY = 0;

  constructor(shadowRoot: ShadowRoot, onCopy?: (text: string, label: string) => void) {
    this.onCopyCallback = onCopy;
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
    }
  }

  public update(data: InspectedElementData, targetElement: HTMLElement): void {
    if (this.isPinned) return;
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

  private applyCornerPosition(corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'): void {
    this.currentCorner = corner;
    const margin = 24;
    const cardWidth = 380;
    const cardHeight = Math.min(this.card.offsetHeight || 440, 500);
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
      const maxX = (window.innerWidth || 1200) - (this.card.offsetWidth || 380) - pad;
      const maxY = (window.innerHeight || 800) - (this.card.offsetHeight || 440) - pad;

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

      // Detect nearest corner (bottom-right, bottom-left, top-right, top-left)
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
      // Only drag when clicking the topbar or empty non-interactive header areas
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

    // Header with tag name, ID/classes, dimensions and quick actions
    const tagDisplay = `<span class="ib-badge ib-tag-badge">&lt;${d.tagName}&gt;</span>`;
    const idDisplay = d.id ? `<span class="ib-id-badge">#${escapeHtml(d.id)}</span>` : '';
    const classCount = d.classList.length ? `<span class="ib-meta-dim">.${d.classList.slice(0, 2).map(escapeHtml).join('.')} ${d.classList.length > 2 ? `+${d.classList.length - 2}` : ''}</span>` : '';

    // Framework Badges
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

    // Color Swatches
    const bgSwatch = renderColorSwatch('BG', d.styling.backgroundColor);
    const textSwatch = renderColorSwatch('Text', d.typography.color);

    // Box model values
    const m = d.boxModel.margin;
    const p = d.boxModel.padding;

    // CSS Variables HTML
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

    // Tailwind Class Preview HTML
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

    this.card.innerHTML = `
      <div class="ib-card-topbar">
        <div class="ib-topbar-title">
          <div class="ib-logo-dot"></div>
          <span class="ib-brand">InspectBae</span>
          ${tagDisplay}
          ${idDisplay}
        </div>
        <div class="ib-topbar-actions">
          <button class="ib-icon-btn ib-pin-btn ${this.isPinned ? 'ib-active' : ''}" title="${this.isPinned ? 'Locked (Click to unlock)' : 'Click to lock/freeze info'}">
            ${this.isPinned ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      <div class="ib-card-content">
        <!-- Badges Bar -->
        ${(reactBadge || radixBadge || tailwindPill) ? `
          <div class="ib-fw-bar">
            ${reactBadge}
            ${radixBadge}
            ${tailwindPill}
          </div>
        ` : ''}

        <!-- Dimensions & Box Overview -->
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

        <!-- Styling & Colors -->
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

        <!-- Quick Copy Toolbar -->
        <div class="ib-copy-toolbar">
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
      </div>
    `;

    this.bindEvents();
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

    // Quick copy buttons
    const actionBtns = this.card.querySelectorAll('.ib-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (btn.classList.contains('ib-copy-css')) {
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
        } else if (btn.classList.contains('ib-copy-tw-all')) {
          this.copy(d.frameworks.tailwind.matchedClasses.join(' '), 'Tailwind classes copied');
        } else if (btn.classList.contains('ib-copy-color-btn')) {
          const colorVal = d.styling.backgroundColor.hex !== 'transparent'
            ? d.styling.backgroundColor.hex
            : d.typography.color.hex;
          this.copy(colorVal, `Color ${colorVal} copied`);
        } else if (btn.classList.contains('ib-copy-comp-btn') && d.frameworks.react) {
          this.copy(d.frameworks.react.componentName, `Component <${d.frameworks.react.componentName}> copied`);
        }
      });
    });
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

  const isDark = color.alpha > 0.5;
  return `
    <span class="ib-color-wrap" data-copy="${escapeHtml(color.hex)}" title="Click to copy ${escapeHtml(color.hex)}">
      <span class="ib-swatch" style="background:${escapeHtml(color.hex)};"></span>
      <span class="ib-color-hex">${escapeHtml(color.hex)}</span>
      ${color.tailwindClass ? `<span class="ib-tw-mini-tag">${escapeHtml(color.tailwindClass)}</span>` : ''}
    </span>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
