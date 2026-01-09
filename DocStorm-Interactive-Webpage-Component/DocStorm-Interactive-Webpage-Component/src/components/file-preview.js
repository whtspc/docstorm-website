/**
 * DocStorm File Preview Component
 * A standalone preview pane showing the selected file
 * Features Rough.js sketchy borders
 */

export class FilePreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._file = null;
    this._rendered = false;
    this._resizeObserver = null;
  }

  connectedCallback() {
    this._render();
    this._setupResizeObserver();
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      if (this._rendered) {
        this._drawBorders();
      }
    });
    this._resizeObserver.observe(this);
  }

  get file() {
    return this._file;
  }

  set file(value) {
    this._file = value || null;
    this._render();
  }

  _getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      :host {
        display: flex;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 8px;
        width: 280px;
        height: 100%;
        box-sizing: border-box;
      }

      .file-preview {
        position: relative;
        background: #fff;
        overflow: visible;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .file-preview__borders {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2;
        overflow: visible;
      }

      .file-preview__header {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: #fff;
      }

      .file-preview__content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 16px;
        min-height: 200px;
      }

      .file-preview__image {
        max-width: 100%;
        max-height: 220px;
        object-fit: contain;
        border-radius: 2px;
      }

      .file-preview__icon {
        font-size: 72px;
        color: #666;
        margin-bottom: 16px;
      }

      .file-preview__label {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        text-align: center;
        margin-top: 16px;
      }

      .file-preview__filename {
        font-size: 11px;
        color: #888;
        font-family: 'Consolas', monospace;
        text-align: center;
        word-break: break-all;
        margin-top: 6px;
      }

      .file-preview__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 180px;
        color: #ccc;
      }

      .file-preview__placeholder-icon {
        font-size: 56px;
        margin-bottom: 16px;
      }

      .file-preview__placeholder-text {
        font-size: 13px;
      }
    `;
  }

  _getIconClass(type) {
    const icons = {
      image: 'fa-solid fa-image',
      businesscard: 'fa-solid fa-id-card',
      pdf: 'fa-solid fa-file-pdf',
      invoice: 'fa-solid fa-file-invoice',
      order: 'fa-solid fa-clipboard-list',
      email: 'fa-solid fa-envelope',
      text: 'fa-solid fa-file-lines',
      webpage: 'fa-solid fa-globe',
      url: 'fa-solid fa-link',
      default: 'fa-solid fa-file'
    };
    return icons[type] || icons.default;
  }

  _render() {
    // Generate preview HTML
    let contentHTML = '';
    if (this._file) {
      if (this._file.previewSrc) {
        contentHTML = `
          <img class="file-preview__image" src="${this._file.previewSrc}" alt="${this._file.label}" />
          <div class="file-preview__label">${this._file.label}</div>
          <div class="file-preview__filename">${this._file.filename}</div>
        `;
      } else {
        const iconClass = this._getIconClass(this._file.type);
        contentHTML = `
          <i class="file-preview__icon ${iconClass}"></i>
          <div class="file-preview__label">${this._file.label}</div>
          <div class="file-preview__filename">${this._file.filename}</div>
        `;
      }
    } else {
      contentHTML = `
        <div class="file-preview__placeholder">
          <i class="file-preview__placeholder-icon fa-solid fa-file"></i>
          <span class="file-preview__placeholder-text">Select a file</span>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="file-preview">
        <svg class="file-preview__borders" aria-hidden="true"></svg>
        <div class="file-preview__header">
          <i class="fa-solid fa-eye"></i>
          <span>Preview</span>
        </div>
        <div class="file-preview__content">
          ${contentHTML}
        </div>
      </div>
    `;

    this._rendered = true;

    requestAnimationFrame(() => {
      this._drawBorders();
    });
  }

  _drawBorders() {
    const bordersSvg = this.shadowRoot.querySelector('.file-preview__borders');
    const preview = this.shadowRoot.querySelector('.file-preview');

    if (!bordersSvg || !preview || typeof rough === 'undefined') {
      return;
    }

    bordersSvg.innerHTML = '';

    const rect = preview.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const padding = 4;
    const roughness = 1.2;
    const strokeWidth = 2;
    const seed = 42;

    bordersSvg.setAttribute('width', rect.width + padding * 2);
    bordersSvg.setAttribute('height', rect.height + padding * 2);
    bordersSvg.style.left = `-${padding}px`;
    bordersSvg.style.top = `-${padding}px`;

    const rcBorders = rough.svg(bordersSvg);

    const options = {
      roughness,
      bowing: 1,
      stroke: '#000',
      strokeWidth,
      seed,
      disableMultiStroke: true
    };

    // Draw outer border
    const outerBorder = rcBorders.rectangle(padding, padding, rect.width, rect.height, {
      ...options,
      strokeWidth: strokeWidth + 0.5
    });
    bordersSvg.appendChild(outerBorder);

    // Draw header divider line
    const header = this.shadowRoot.querySelector('.file-preview__header');
    if (header) {
      const headerRect = header.getBoundingClientRect();
      const headerBottom = headerRect.top - rect.top + padding + headerRect.height;

      const divider = rcBorders.line(
        padding,
        headerBottom,
        padding + rect.width,
        headerBottom,
        { ...options, strokeWidth: strokeWidth * 0.75 }
      );
      bordersSvg.appendChild(divider);
    }
  }

  // Public methods
  refresh() {
    this._render();
  }
}

// Register the custom element
if (!customElements.get('docstorm-file-preview')) {
  customElements.define('docstorm-file-preview', FilePreview);
}
