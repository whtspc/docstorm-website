/**
 * DocStorm Drop Zone Component
 * A drop target with processing animation using Rough.js
 */

export class DropZone extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'roughness', 'stroke-width'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._resizeObserver = null;
    this._state = 'idle'; // idle, dragover, processing, complete
    this._processingSteps = [];
    this._currentStep = 0;
    this._progress = 0;
    this._filename = '';
    this._animationFrame = null;
  }

  connectedCallback() {
    this._render();
    this._setupResizeObserver();
    this._setupDropHandlers();
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this._rendered) {
      if (name === 'state') {
        this._state = newVal;
      }
      this._render();
    }
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
    this._render();
  }

  _getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      :host {
        display: block;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .drop-zone {
        position: relative;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: #fff;
        transition: background-color 0.2s;
      }

      .drop-zone--dragover {
        background: #f8f8f8;
      }

      .drop-zone__borders {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: visible;
      }

      .drop-zone__content {
        position: relative;
        z-index: 1;
        text-align: center;
        width: 100%;
      }

      .drop-zone__prompt {
        font-size: 14px;
        color: #666;
        margin-bottom: 6px;
      }

      .drop-zone__hint {
        font-size: 12px;
        color: #999;
      }

      .drop-zone__upload-icon {
        font-size: 40px;
        color: #888;
        margin-bottom: 14px;
      }

      /* Processing state */
      .drop-zone__processing {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
        max-width: 200px;
      }

      .drop-zone__filename {
        font-size: 11px;
        font-family: 'Consolas', monospace;
        color: #666;
        padding: 4px 8px;
        background: #f5f5f5;
        border-radius: 2px;
      }

      .drop-zone__step {
        font-size: 12px;
        color: #333;
        min-height: 18px;
        text-align: center;
      }

      .drop-zone__progress-container {
        position: relative;
        width: 100%;
        height: 20px;
      }

      .drop-zone__progress-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      /* Complete state */
      .drop-zone__complete {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .drop-zone__complete-icon {
        font-size: 32px;
      }

      .drop-zone__complete-text {
        font-size: 14px;
        color: #333;
      }

      /* Hidden state */
      .drop-zone--hidden {
        opacity: 0;
        pointer-events: none;
      }
    `;
  }

  _render() {
    let contentHTML = '';

    switch (this._state) {
      case 'dragover':
        contentHTML = `
          <div class="drop-zone__content">
            <div class="drop-zone__prompt">Drop it here!</div>
          </div>
        `;
        break;

      case 'processing':
        const stepText = this._processingSteps[this._currentStep] || 'Processing...';
        contentHTML = `
          <div class="drop-zone__content">
            <div class="drop-zone__processing">
              <div class="drop-zone__filename">${this._filename}</div>
              <div class="drop-zone__step">${stepText}</div>
              <div class="drop-zone__progress-container">
                <svg class="drop-zone__progress-svg" aria-hidden="true"></svg>
              </div>
            </div>
          </div>
        `;
        break;

      case 'complete':
        contentHTML = `
          <div class="drop-zone__content">
            <div class="drop-zone__complete">
              <i class="drop-zone__complete-icon fa-solid fa-circle-check"></i>
              <div class="drop-zone__complete-text">Record created!</div>
            </div>
          </div>
        `;
        break;

      default: // idle
        contentHTML = `
          <div class="drop-zone__content">
            <div class="drop-zone__prompt">Drop document here</div>
            <div class="drop-zone__hint">to extract data</div>
          </div>
        `;
    }

    const stateClass = this._state === 'dragover' ? 'drop-zone--dragover' : '';

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="drop-zone ${stateClass}">
        <svg class="drop-zone__borders" aria-hidden="true"></svg>
        ${contentHTML}
      </div>
    `;

    this._rendered = true;

    requestAnimationFrame(() => {
      this._drawBorders();
      if (this._state === 'processing') {
        this._drawProgressBar();
      }
    });
  }

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      if (this._rendered) {
        this._drawBorders();
        if (this._state === 'processing') {
          this._drawProgressBar();
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  _setupDropHandlers() {
    this.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (this._state === 'idle') {
        this._state = 'dragover';
        this._render();
      }
    });

    this.addEventListener('dragleave', (e) => {
      // Only trigger if leaving the drop zone entirely
      if (!this.contains(e.relatedTarget)) {
        if (this._state === 'dragover') {
          this._state = 'idle';
          this._render();
        }
      }
    });

    this.addEventListener('drop', (e) => {
      e.preventDefault();

      let documentData;
      try {
        documentData = JSON.parse(e.dataTransfer.getData('application/json'));
      } catch {
        documentData = { filename: 'document', type: 'unknown' };
      }

      this.dispatchEvent(new CustomEvent('document-dropped', {
        bubbles: true,
        composed: true,
        detail: documentData
      }));
    });
  }

  _drawBorders() {
    const svg = this.shadowRoot.querySelector('.drop-zone__borders');
    const zone = this.shadowRoot.querySelector('.drop-zone');

    if (!svg || !zone || typeof rough === 'undefined') {
      return;
    }

    svg.innerHTML = '';

    const rect = zone.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const padding = 4;

    svg.setAttribute('width', rect.width + padding * 2);
    svg.setAttribute('height', rect.height + padding * 2);
    svg.style.left = `-${padding}px`;
    svg.style.top = `-${padding}px`;

    const roughness = parseFloat(this.getAttribute('roughness')) || 1.5;
    const strokeWidth = parseFloat(this.getAttribute('stroke-width')) || 2;

    const rc = rough.svg(svg);

    // Draw dashed border for idle/dragover states
    const isDashed = this._state === 'idle' || this._state === 'dragover';
    const strokeColor = this._state === 'dragover' ? '#333' : '#888';

    const options = {
      roughness,
      bowing: 1,
      stroke: strokeColor,
      strokeWidth: isDashed ? strokeWidth * 0.75 : strokeWidth,
      disableMultiStroke: true
    };

    if (isDashed) {
      // Draw dashed rectangle by drawing individual dashes
      const dashLength = 12;
      const gapLength = 8;
      const w = rect.width;
      const h = rect.height;

      // Top edge
      for (let x = 0; x < w; x += dashLength + gapLength) {
        const endX = Math.min(x + dashLength, w);
        const line = rc.line(padding + x, padding, padding + endX, padding, options);
        svg.appendChild(line);
      }

      // Right edge
      for (let y = 0; y < h; y += dashLength + gapLength) {
        const endY = Math.min(y + dashLength, h);
        const line = rc.line(padding + w, padding + y, padding + w, padding + endY, options);
        svg.appendChild(line);
      }

      // Bottom edge
      for (let x = 0; x < w; x += dashLength + gapLength) {
        const endX = Math.min(x + dashLength, w);
        const line = rc.line(padding + x, padding + h, padding + endX, padding + h, options);
        svg.appendChild(line);
      }

      // Left edge
      for (let y = 0; y < h; y += dashLength + gapLength) {
        const endY = Math.min(y + dashLength, h);
        const line = rc.line(padding, padding + y, padding, padding + endY, options);
        svg.appendChild(line);
      }
    } else {
      // Solid border for processing/complete states
      const border = rc.rectangle(padding, padding, rect.width, rect.height, options);
      svg.appendChild(border);
    }
  }

  _drawProgressBar() {
    const svg = this.shadowRoot.querySelector('.drop-zone__progress-svg');
    if (!svg || typeof rough === 'undefined') return;

    svg.innerHTML = '';

    const container = this.shadowRoot.querySelector('.drop-zone__progress-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;

    const padding = 2;
    const barHeight = 18;
    const barWidth = rect.width - padding * 2;

    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', barHeight + padding * 2);

    const rc = rough.svg(svg);
    const roughness = parseFloat(this.getAttribute('roughness')) || 1.2;

    // Draw background bar
    const bgBar = rc.rectangle(padding, padding, barWidth, barHeight, {
      roughness: roughness * 0.8,
      stroke: '#ccc',
      strokeWidth: 1.5,
      fill: '#f5f5f5',
      fillStyle: 'solid',
      disableMultiStroke: true
    });
    svg.appendChild(bgBar);

    // Draw progress fill
    if (this._progress > 0) {
      const fillWidth = Math.max(4, barWidth * this._progress);
      const fillBar = rc.rectangle(padding, padding, fillWidth, barHeight, {
        roughness: roughness * 0.6,
        stroke: 'none',
        fill: '#000',
        fillStyle: 'hachure',
        fillWeight: 1.5,
        hachureAngle: -41,
        hachureGap: 5,
        disableMultiStroke: true
      });
      svg.appendChild(fillBar);
    }

    // Draw border on top
    const borderBar = rc.rectangle(padding, padding, barWidth, barHeight, {
      roughness: roughness * 0.8,
      stroke: '#000',
      strokeWidth: 2,
      fill: 'none',
      disableMultiStroke: true
    });
    svg.appendChild(borderBar);
  }

  // Public methods
  async startProcessing(filename, steps) {
    this._filename = filename || 'document';
    this._processingSteps = steps || ['Processing...'];
    this._currentStep = 0;
    this._progress = 0;
    this._state = 'processing';
    this._render();

    // Animate through steps
    const stepDuration = 1200;
    const progressIncrement = 1 / this._processingSteps.length;

    for (let i = 0; i < this._processingSteps.length; i++) {
      this._currentStep = i;

      // Animate progress for this step
      const startProgress = this._progress;
      const endProgress = (i + 1) * progressIncrement;
      const startTime = Date.now();

      await new Promise(resolve => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const t = Math.min(elapsed / stepDuration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - t, 3);

          this._progress = startProgress + (endProgress - startProgress) * eased;

          // Update step text
          const stepEl = this.shadowRoot.querySelector('.drop-zone__step');
          if (stepEl) {
            stepEl.textContent = this._processingSteps[i];
          }

          this._drawProgressBar();

          if (t < 1) {
            this._animationFrame = requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    }

    // Brief pause at 100%
    await new Promise(r => setTimeout(r, 300));

    this._state = 'complete';
    this._render();

    // Emit completion event
    this.dispatchEvent(new CustomEvent('processing-complete', {
      bubbles: true,
      composed: true,
      detail: { filename: this._filename }
    }));
  }

  reset() {
    this._state = 'idle';
    this._progress = 0;
    this._currentStep = 0;
    this._filename = '';
    this._render();
  }

  refresh() {
    this._render();
  }
}

// Register the custom element
if (!customElements.get('docstorm-drop-zone')) {
  customElements.define('docstorm-drop-zone', DropZone);
}
