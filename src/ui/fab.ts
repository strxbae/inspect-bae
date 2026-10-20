export class FABManager {
  private fab: HTMLDivElement;
  private isInspectionActive = false;
  private isDragging = false;
  private hasMoved = false;
  private startX = 0;
  private startY = 0;
  private initialLeft = 0;
  private initialTop = 0;
  private onToggleCallback: (active: boolean) => void;

  constructor(shadowRoot: ShadowRoot, onToggle: (active: boolean) => void) {
    this.onToggleCallback = onToggle;

    this.fab = document.createElement('div');
    this.fab.className = 'ib-fab';
    this.fab.title = 'InspectBae: Click to Toggle Inspection, Drag to reposition';
    this.fab.innerHTML = `
      <div class="ib-fab-inner">
        <div class="ib-fab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
          </svg>
        </div>
        <div class="ib-fab-pulse"></div>
      </div>
    `;

    shadowRoot.appendChild(this.fab);
    this.initEvents();
  }

  public setActive(active: boolean): void {
    this.isInspectionActive = active;
    this.fab.classList.toggle('ib-fab-active', active);
  }

  private initEvents(): void {
    const onPointerDown = (e: PointerEvent) => {
      // Only primary mouse button or touch
      if (e.button !== 0) return;
      this.isDragging = true;
      this.hasMoved = false;
      this.startX = e.clientX;
      this.startY = e.clientY;

      const rect = this.fab.getBoundingClientRect();
      this.initialLeft = rect.left;
      this.initialTop = rect.top;

      // Listen on document/window with capture so pointer events outside Shadow DOM are captured
      document.addEventListener('pointermove', onPointerMove, { capture: true });
      document.addEventListener('pointerup', onPointerUp, { capture: true });
      window.addEventListener('pointermove', onPointerMove, { capture: true });
      window.addEventListener('pointerup', onPointerUp, { capture: true });
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this.hasMoved = true;
      }

      let newLeft = this.initialLeft + dx;
      let newTop = this.initialTop + dy;

      // Clamp inside screen viewport
      const pad = 12;
      const maxX = (window.innerWidth || 1000) - (this.fab.offsetWidth || 52) - pad;
      const maxY = (window.innerHeight || 800) - (this.fab.offsetHeight || 52) - pad;

      newLeft = Math.max(pad, Math.min(maxX, newLeft));
      newTop = Math.max(pad, Math.min(maxY, newTop));

      this.fab.style.left = `${newLeft}px`;
      this.fab.style.top = `${newTop}px`;
      this.fab.style.right = 'auto';
      this.fab.style.bottom = 'auto';
    };

    const onPointerUp = (e?: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      document.removeEventListener('pointermove', onPointerMove, { capture: true });
      document.removeEventListener('pointerup', onPointerUp, { capture: true });
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });

      // If moved, snap to nearest corner!
      if (this.hasMoved) {
        this.snapToCorner();
      } else {
        this.toggle();
      }
    };

    this.fab.addEventListener('pointerdown', onPointerDown);
    this.fab.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.hasMoved) {
        // Handled in pointerup, or direct fallback
      }
    });
  }

  private snapToCorner(): void {
    const pad = 24;
    const rect = this.fab.getBoundingClientRect();
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    const isRight = (rect.left + rect.width / 2) >= midX;
    const isBottom = (rect.top + rect.height / 2) >= midY;

    const targetX = isRight ? (window.innerWidth - (this.fab.offsetWidth || 52) - pad) : pad;
    const targetY = isBottom ? (window.innerHeight - (this.fab.offsetHeight || 52) - pad) : pad;

    this.fab.style.transition = 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    this.fab.style.left = `${targetX}px`;
    this.fab.style.top = `${targetY}px`;
    setTimeout(() => {
      this.fab.style.transition = '';
    }, 260);
  }

  private toggle(): void {
    this.isInspectionActive = !this.isInspectionActive;
    this.setActive(this.isInspectionActive);
    this.onToggleCallback(this.isInspectionActive);
  }

  public destroy(): void {
    this.fab.remove();
  }
}
