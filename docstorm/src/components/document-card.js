/**
 * DocStorm Document Card Component
 * A draggable document preview with hand-drawn Rough.js border
 */

export class DocumentCard extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'label', 'type', 'filename', 'roughness', 'stroke-width'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._resizeObserver = null;
  }

  connectedCallback() {
    this._render();
    this._setupResizeObserver();
    this._setupDragHandlers();
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this._rendered) {
      this._render();
    }
  }

  _getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      :host {
        display: inline-block;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: grab;
        user-select: none;
      }

      :host(:active) {
        cursor: grabbing;
      }

      .document-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        background: #fff;
      }

      .document-card__preview {
        position: relative;
        width: 180px;
        height: 220px;
        background: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .document-card__image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        pointer-events: none;
      }

      .document-card__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 12px;
        text-align: center;
        padding: 20px;
      }

      .document-card__placeholder-icon {
        font-size: 56px;
        margin-bottom: 12px;
        color: #666;
      }

      .document-card__label {
        margin-top: 12px;
        font-size: 13px;
        font-weight: 500;
        color: #333;
        text-align: center;
      }

      .document-card__filename {
        margin-top: 4px;
        font-size: 11px;
        color: #888;
        text-align: center;
        font-family: 'Consolas', monospace;
      }

      .document-card__borders {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: visible;
      }

      /* Drag states */
      :host(.dragging) .document-card {
        opacity: 0.5;
        transform: scale(0.95);
        transition: opacity 0.2s, transform 0.2s;
      }

      /* Hover state */
      :host(:hover) .document-card__preview {
        background: #f5f5f5;
      }
    `;
  }

  _getPlaceholderIcon(type) {
    // Font Awesome icon classes for each document type
    const icons = {
      businesscard: 'fa-solid fa-id-card',
      image: 'fa-solid fa-image',
      invoice: 'fa-solid fa-file-invoice',
      order: 'fa-solid fa-clipboard-list',
      receipt: 'fa-solid fa-receipt',
      pdf: 'fa-solid fa-file-pdf',
      email: 'fa-solid fa-envelope',
      text: 'fa-solid fa-file-lines',
      webpage: 'fa-solid fa-globe',
      url: 'fa-solid fa-link',
      default: 'fa-solid fa-file'
    };
    return icons[type] || icons.default;
  }

  _render() {
    const src = this.getAttribute('src');
    const label = this.getAttribute('label') || 'Document';
    const type = this.getAttribute('type') || 'default';
    const filename = this.getAttribute('filename') || '';

    const imageHTML = src
      ? `<img class="document-card__image" src="${src}" alt="${label}" draggable="false" />`
      : `<div class="document-card__placeholder">
           <i class="document-card__placeholder-icon ${this._getPlaceholderIcon(type)}"></i>
           <span>${label}</span>
         </div>`;

    const filenameHTML = filename
      ? `<div class="document-card__filename">${filename}</div>`
      : '';

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="document-card" draggable="true">
        <div class="document-card__preview">
          ${imageHTML}
        </div>
        <svg class="document-card__borders" aria-hidden="true"></svg>
        <div class="document-card__label">${label}</div>
        ${filenameHTML}
      </div>
    `;

    this._rendered = true;

    requestAnimationFrame(() => {
      this._drawBorders();
    });
  }

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      if (this._rendered) {
        this._drawBorders();
      }
    });
    this._resizeObserver.observe(this);
  }

  _setupDragHandlers() {
    this.setAttribute('draggable', 'true');

    this.addEventListener('dragstart', (e) => {
      this.classList.add('dragging');

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: this.getAttribute('type'),
        label: this.getAttribute('label'),
        filename: this.getAttribute('filename'),
        src: this.getAttribute('src')
      }));

      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('document-drag-start', {
        bubbles: true,
        composed: true,
        detail: {
          type: this.getAttribute('type'),
          label: this.getAttribute('label'),
          filename: this.getAttribute('filename')
        }
      }));
    });

    this.addEventListener('dragend', (e) => {
      this.classList.remove('dragging');

      this.dispatchEvent(new CustomEvent('document-drag-end', {
        bubbles: true,
        composed: true,
        detail: {
          type: this.getAttribute('type'),
          dropped: e.dataTransfer.dropEffect !== 'none'
        }
      }));
    });
  }

  _drawBorders() {
    const svg = this.shadowRoot.querySelector('.document-card__borders');
    const preview = this.shadowRoot.querySelector('.document-card__preview');
    const card = this.shadowRoot.querySelector('.document-card');

    if (!svg || !preview || !card || typeof rough === 'undefined') {
      return;
    }

    svg.innerHTML = '';

    const cardRect = card.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();

    if (cardRect.width === 0 || cardRect.height === 0) return;

    const padding = 4;

    svg.setAttribute('width', cardRect.width + padding * 2);
    svg.setAttribute('height', cardRect.height + padding * 2);
    svg.style.left = `-${padding}px`;
    svg.style.top = `-${padding}px`;

    const roughness = parseFloat(this.getAttribute('roughness')) || 1.5;
    const strokeWidth = parseFloat(this.getAttribute('stroke-width')) || 2;

    const rc = rough.svg(svg);
    const options = {
      roughness,
      bowing: 1,
      stroke: '#000',
      strokeWidth,
      disableMultiStroke: true
    };

    // Draw border around the preview area
    const previewLeft = previewRect.left - cardRect.left + padding;
    const previewTop = previewRect.top - cardRect.top + padding;

    const border = rc.rectangle(
      previewLeft,
      previewTop,
      previewRect.width,
      previewRect.height,
      options
    );
    svg.appendChild(border);
  }

  // Public methods
  refresh() {
    this._render();
  }

  redrawBorders() {
    this._drawBorders();
  }
}

// Register the custom element
if (!customElements.get('docstorm-document-card')) {
  customElements.define('docstorm-document-card', DocumentCard);
}
