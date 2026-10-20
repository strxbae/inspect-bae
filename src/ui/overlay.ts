import { InspectedElementData } from '../types';

export class OverlayManager {
  private container: HTMLDivElement;
  private marginEl: HTMLDivElement;
  private borderEl: HTMLDivElement;
  private paddingEl: HTMLDivElement;
  private contentEl: HTMLDivElement;

  constructor(shadowRoot: ShadowRoot) {
    this.container = document.createElement('div');
    this.container.className = 'ib-overlay-container';

    // 4 Box model layers: Margin (Orange), Border (Yellow), Padding (Green), Content (Cyan/Blue)
    this.marginEl = document.createElement('div');
    this.marginEl.className = 'ib-box-model ib-box-margin';

    this.borderEl = document.createElement('div');
    this.borderEl.className = 'ib-box-model ib-box-border';

    this.paddingEl = document.createElement('div');
    this.paddingEl.className = 'ib-box-model ib-box-padding';

    this.contentEl = document.createElement('div');
    this.contentEl.className = 'ib-box-model ib-box-content';

    this.container.appendChild(this.marginEl);
    this.container.appendChild(this.borderEl);
    this.container.appendChild(this.paddingEl);
    this.container.appendChild(this.contentEl);

    shadowRoot.appendChild(this.container);
  }

  public update(element: HTMLElement, data: InspectedElementData): void {
    const rect = element.getBoundingClientRect();
    const { margin, padding, border } = data.boxModel;

    // Viewport relative bounds
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Content box
    const contentTop = rect.top + border.top + padding.top;
    const contentLeft = rect.left + border.left + padding.left;
    const contentWidth = Math.max(0, rect.width - border.left - border.right - padding.left - padding.right);
    const contentHeight = Math.max(0, rect.height - border.top - border.bottom - padding.top - padding.bottom);

    // Padding box
    const paddingTop = rect.top + border.top;
    const paddingLeft = rect.left + border.left;
    const paddingWidth = Math.max(0, rect.width - border.left - border.right);
    const paddingHeight = Math.max(0, rect.height - border.top - border.bottom);

    // Border box (matches getBoundingClientRect)
    const borderTop = rect.top;
    const borderLeft = rect.left;
    const borderWidth = rect.width;
    const borderHeight = rect.height;

    // Margin box
    const marginTop = rect.top - margin.top;
    const marginLeft = rect.left - margin.left;
    const marginWidth = rect.width + margin.left + margin.right;
    const marginHeight = rect.height + margin.top + margin.bottom;

    this.applyBox(this.marginEl, marginTop, marginLeft, marginWidth, marginHeight);
    this.applyBox(this.borderEl, borderTop, borderLeft, borderWidth, borderHeight);
    this.applyBox(this.paddingEl, paddingTop, paddingLeft, paddingWidth, paddingHeight);
    this.applyBox(this.contentEl, contentTop, contentLeft, contentWidth, contentHeight);

    this.container.style.display = 'block';
  }

  private applyBox(el: HTMLDivElement, top: number, left: number, width: number, height: number): void {
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public destroy(): void {
    this.container.remove();
  }
}
