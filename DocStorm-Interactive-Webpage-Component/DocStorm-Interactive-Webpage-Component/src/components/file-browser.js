/**
 * DocStorm File Browser Component
 * A file explorer-style component with preview pane and file grid
 * Features Rough.js sketchy borders
 */

export class FileBrowser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._files = [];
    this._selectedFile = null;
    this._processedIds = new Set();
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

  get files() {
    return this._files;
  }

  set files(value) {
    this._files = value || [];
    if (this._files.length > 0 && !this._selectedFile) {
      this._selectedFile = this._files[0];
    }
    this._render();
  }

  get selectedFile() {
    return this._selectedFile;
  }

  get selectedId() {
    return this._selectedFile?.id || null;
  }

  set selectedId(value) {
    this._selectedFile = this._files.find(f => f.id === value) || null;
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
        height: 100%;
        box-sizing: border-box;
      }

      .file-browser {
        position: relative;
        background: #fff;
        overflow: visible;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .file-browser__borders {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2;
        overflow: visible;
      }

      .file-browser__header {
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

      .file-browser__content {
        position: relative;
        z-index: 1;
        padding: 16px;
      }

      /* File grid - 3 files per row */
      .file-browser__grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-content: start;
        max-width: 268px; /* 3 files (3×84px with padding) + 2 gaps (2×8px) */
      }

      .file-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 6px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.15s ease;
        position: relative;
        width: 72px;
        height: 72px;
        border-radius: 4px;
      }

      .file-item:hover {
        background: #f0f0f0;
      }

      .file-item--selected {
        background: #e3e3e3;
      }

      .file-item--selected:hover {
        background: #d8d8d8;
      }

      .file-item--dragging {
        opacity: 0.5;
      }

      .file-item__icon {
        font-size: 32px;
        color: #555;
        margin-bottom: 8px;
        pointer-events: none;
      }

      .file-item__name {
        font-size: 11px;
        color: #444;
        text-align: center;
        word-break: break-all;
        line-height: 1.3;
        max-width: 100%;
        pointer-events: none;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .file-item__badge {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 14px;
        color: #2d936c;
      }

      /* Drag feedback */
      .file-item[draggable="true"] {
        cursor: grab;
      }

      .file-item[draggable="true"]:active {
        cursor: grabbing;
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
    // Generate files grid HTML
    const filesHTML = this._files.map(file => {
      const isSelected = file.id === this._selectedFile?.id;
      const isProcessed = this._processedIds.has(file.id);
      const selectedClass = isSelected ? 'file-item--selected' : '';
      const badgeHTML = isProcessed
        ? '<i class="file-item__badge fa-solid fa-circle-check"></i>'
        : '';

      return `
        <div class="file-item ${selectedClass}"
             data-file-id="${file.id}"
             draggable="true"
             title="${file.filename}">
          ${badgeHTML}
          <i class="file-item__icon ${this._getIconClass(file.type)}"></i>
          <span class="file-item__name">${file.filename}</span>
        </div>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="file-browser">
        <svg class="file-browser__borders" aria-hidden="true"></svg>
        <div class="file-browser__header">
          <i class="fa-solid fa-folder"></i>
          <span>File Explorer</span>
        </div>
        <div class="file-browser__content">
          <div class="file-browser__grid">
            ${filesHTML || '<div class="file-browser__empty">No files</div>'}
          </div>
        </div>
      </div>
    `;

    this._rendered = true;
    this._setupEventListeners();

    requestAnimationFrame(() => {
      this._drawBorders();
    });
  }

  _setupEventListeners() {
    const items = this.shadowRoot.querySelectorAll('.file-item');

    items.forEach(item => {
      // Click to select
      item.addEventListener('click', () => {
        const fileId = item.dataset.fileId;
        const file = this._files.find(f => f.id === fileId);

        this._selectedFile = file;
        this._render();

        this.dispatchEvent(new CustomEvent('file-selected', {
          bubbles: true,
          composed: true,
          detail: { file }
        }));
      });

      // Drag start
      item.addEventListener('dragstart', (e) => {
        const fileId = item.dataset.fileId;
        const file = this._files.find(f => f.id === fileId);

        item.classList.add('file-item--dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({
          id: file.id,
          type: file.type,
          filename: file.filename,
          label: file.label
        }));

        this.dispatchEvent(new CustomEvent('file-drag-start', {
          bubbles: true,
          composed: true,
          detail: { file }
        }));
      });

      // Drag end
      item.addEventListener('dragend', (e) => {
        item.classList.remove('file-item--dragging');

        const fileId = item.dataset.fileId;
        const file = this._files.find(f => f.id === fileId);

        this.dispatchEvent(new CustomEvent('file-drag-end', {
          bubbles: true,
          composed: true,
          detail: {
            file,
            dropped: e.dataTransfer.dropEffect !== 'none'
          }
        }));
      });
    });
  }

  _drawBorders() {
    const bordersSvg = this.shadowRoot.querySelector('.file-browser__borders');
    const browser = this.shadowRoot.querySelector('.file-browser');

    if (!bordersSvg || !browser || typeof rough === 'undefined') {
      return;
    }

    bordersSvg.innerHTML = '';

    const rect = browser.getBoundingClientRect();
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
    const header = this.shadowRoot.querySelector('.file-browser__header');
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
  markProcessed(fileId) {
    this._processedIds.add(fileId);
    this._render();
  }

  clearProcessed() {
    this._processedIds.clear();
    this._render();
  }

  isProcessed(fileId) {
    return this._processedIds.has(fileId);
  }

  getFile(fileId) {
    return this._files.find(f => f.id === fileId);
  }

  refresh() {
    this._render();
  }
}

// Register the custom element
if (!customElements.get('docstorm-file-browser')) {
  customElements.define('docstorm-file-browser', FileBrowser);
}
