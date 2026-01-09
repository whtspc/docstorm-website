/**
 * DocStorm Demo Container Component
 * Orchestrates the full document-to-record conversion demo flow
 * Layout: File Browser | Preview/Record | Drop Zone
 */

import { FileBrowser } from './file-browser.js';
import { DocumentCard } from './document-card.js';
import { DropZone } from './drop-zone.js';
import { RecordGrid } from './record-grid.js';
import { SfRecordPage } from './sf-record-page.js';

// Register child components
if (!customElements.get('docstorm-file-browser')) {
  customElements.define('docstorm-file-browser', FileBrowser);
}
if (!customElements.get('docstorm-document-card')) {
  customElements.define('docstorm-document-card', DocumentCard);
}
if (!customElements.get('docstorm-drop-zone')) {
  customElements.define('docstorm-drop-zone', DropZone);
}
if (!customElements.get('docstorm-record-grid')) {
  customElements.define('docstorm-record-grid', RecordGrid);
}
if (!customElements.get('sf-record-page')) {
  customElements.define('sf-record-page', SfRecordPage);
}

export class DemoContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._files = [];
    this._selectedFile = null;
    this._currentRecord = null;
    this._state = 'idle'; // idle, dragging, processing, showing-approval, showing-record-page
    this._draggingFile = null;
    this._rendered = false;
    this._autoResetTimeout = null;
    this._processedFilename = null;
  }

  connectedCallback() {
    this._render();
    this._setupEventListeners();
  }

  disconnectedCallback() {
    if (this._autoResetTimeout) {
      clearTimeout(this._autoResetTimeout);
    }
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

  _getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      :host {
        display: block;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .demo {
        position: relative;
        background: #fff;
        border-radius: 4px;
        overflow: hidden;
        min-height: 420px;
      }

      .demo__content {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 380px;
        padding: 24px;
      }

      /* Input phase: File browser + Drop zone side by side */
      .demo__input-phase {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 40px;
        width: 100%;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .demo__input-phase--hidden {
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
        position: absolute;
      }

      /* File browser wrapper */
      .demo__file-browser-wrapper {
        flex: 0 0 auto;
        min-width: 520px;
      }

      /* Drop zone wrapper */
      .demo__dropzone-wrapper {
        flex: 0 0 220px;
        display: flex;
        align-items: center;
      }

      .demo__dropzone-wrapper docstorm-drop-zone {
        width: 100%;
      }

      /* Approval phase: Record grid with approve button */
      .demo__approval-phase {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 900px;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .demo__approval-phase--hidden {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        position: absolute;
      }

      .demo__approval-record {
        width: 100%;
      }

      .demo__approval-record--revealing {
        animation: reveal-record 0.6s ease-out forwards;
      }

      .demo__approve-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 24px;
        padding: 14px 32px;
        font-family: 'Lexend', -apple-system, sans-serif;
        font-size: 15px;
        font-weight: 500;
        color: #fff;
        background: #0176d3;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.15s ease;
        position: relative;
        overflow: visible;
      }

      .demo__approve-btn:hover {
        background: #014486;
        transform: translateY(-1px);
      }

      .demo__approve-btn:active {
        transform: translateY(0);
      }

      .demo__approve-btn svg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        overflow: visible;
      }

      .demo__approve-btn i {
        font-size: 16px;
      }

      /* Record page phase: SF Record Page view */
      .demo__record-page-phase {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 960px;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .demo__record-page-phase--hidden {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        position: absolute;
      }

      .demo__record-page {
        width: 100%;
      }

      .demo__record-page--revealing {
        animation: reveal-record 0.6s ease-out forwards;
      }

      @keyframes reveal-record {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Close button */
      .demo__close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        z-index: 100;
        background: #000;
        border: 2px solid #000;
        border-radius: 50%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 18px;
        transition: transform 0.15s ease;
      }

      .demo__close-btn:hover {
        transform: scale(1.1);
      }

      .demo__close-btn--pulsing {
        animation: pulse-close 1s ease-in-out infinite;
      }

      @keyframes pulse-close {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.15);
        }
      }

      /* Caption */
      .demo__caption {
        padding: 16px 24px;
        border-top: 1px solid #eee;
        text-align: center;
      }

      .demo__caption-text {
        font-size: 14px;
        color: #666;
        margin: 0;
        min-height: 20px;
        transition: opacity 0.3s ease;
      }
    `;
  }

  _getCaptionText() {
    const filename = this._selectedFile?.filename || this._draggingFile?.filename || this._processedFilename || 'document';

    switch (this._state) {
      case 'idle':
        if (this._selectedFile) {
          return `Drag ${filename} to the drop zone to extract data`;
        }
        return 'Click a file to preview, then drag to extract';
      case 'dragging':
        return 'Drop it!';
      case 'processing':
        return `Extracting data from ${filename}...`;
      case 'showing-approval':
        return `Review extracted data - Click Approve to create in Salesforce`;
      case 'showing-record-page':
        return `Record created successfully in ${this._getAppName()}`;
      default:
        return '';
    }
  }

  _getAppName() {
    const recordType = this._currentRecord?.recordType?.toLowerCase() || '';

    // Sales Cloud records
    if (['lead', 'contact', 'opportunity', 'account', 'order', 'invoice'].includes(recordType)) {
      return 'Sales Cloud';
    }

    // Service Cloud records
    if (['case', 'claim', 'damage claim', 'ticket', 'expense'].includes(recordType)) {
      return 'Service Cloud';
    }

    // Marketing Cloud records
    if (['campaign', 'meeting summary', 'candidate', 'contract'].includes(recordType)) {
      return 'Marketing Cloud';
    }

    return 'Salesforce';
  }

  _render() {
    const isInputPhase = this._state === 'idle' || this._state === 'dragging' || this._state === 'processing';
    const isApprovalPhase = this._state === 'showing-approval';
    const isRecordPagePhase = this._state === 'showing-record-page';

    const inputPhaseClass = isInputPhase ? '' : 'demo__input-phase--hidden';
    const approvalPhaseClass = isApprovalPhase ? '' : 'demo__approval-phase--hidden';
    const recordPagePhaseClass = isRecordPagePhase ? '' : 'demo__record-page-phase--hidden';

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="demo">
        <div class="demo__content">
          <!-- Input Phase: File Browser + Drop Zone side by side -->
          <div class="demo__input-phase ${inputPhaseClass}">
            <!-- File Browser (includes preview pane) -->
            <div class="demo__file-browser-wrapper">
              <docstorm-file-browser></docstorm-file-browser>
            </div>

            <!-- Drop Zone -->
            <div class="demo__dropzone-wrapper">
              <docstorm-drop-zone></docstorm-drop-zone>
            </div>
          </div>

          <!-- Approval Phase: Record grid with approve button -->
          <div class="demo__approval-phase ${approvalPhaseClass}">
            <button class="demo__close-btn" title="Cancel">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="demo__approval-record demo__approval-record--revealing">
              <docstorm-record-grid header-fill="black" animate></docstorm-record-grid>
            </div>
            <button class="demo__approve-btn">
              <i class="fa-solid fa-check"></i>
              <span>Approve & Create Record</span>
            </button>
          </div>

          <!-- Record Page Phase: SF Record Page view -->
          <div class="demo__record-page-phase ${recordPagePhaseClass}">
            <button class="demo__close-btn" title="Close">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="demo__record-page demo__record-page--revealing">
              <sf-record-page animate></sf-record-page>
            </div>
          </div>
        </div>

        <div class="demo__caption">
          <p class="demo__caption-text">${this._getCaptionText()}</p>
        </div>
      </div>
    `;

    this._rendered = true;

    // Set file browser data
    requestAnimationFrame(() => {
      const fileBrowser = this.shadowRoot.querySelector('docstorm-file-browser');
      if (fileBrowser) {
        fileBrowser.files = this._files;
        if (this._selectedFile) {
          fileBrowser.selectedId = this._selectedFile.id;
        }
      }

      // Set record data if showing approval
      if (isApprovalPhase && this._currentRecord) {
        const recordGrid = this.shadowRoot.querySelector('docstorm-record-grid');
        if (recordGrid) {
          recordGrid.recordData = this._currentRecord;
        }
      }

      // Set record data if showing record page
      if (isRecordPagePhase && this._currentRecord) {
        const recordPage = this.shadowRoot.querySelector('sf-record-page');
        if (recordPage) {
          // Extend record with processed filename for the files component
          const extendedRecord = {
            ...this._currentRecord,
            relatedFiles: this._processedFilename ? [{ name: this._processedFilename }] : []
          };
          recordPage.recordData = extendedRecord;
        }

        // Schedule pulse animation after 5 seconds
        this._schedulePulse();
      }
    });
  }

  _setupEventListeners() {
    // File selected - just track internally, file browser handles its own preview
    this.shadowRoot.addEventListener('file-selected', (e) => {
      this._selectedFile = e.detail.file;
      this._updateCaption();
    });

    // File drag start
    this.shadowRoot.addEventListener('file-drag-start', (e) => {
      this._draggingFile = e.detail.file;
      this._state = 'dragging';
      this._updateCaption();
    });

    // File drag end
    this.shadowRoot.addEventListener('file-drag-end', (e) => {
      if (!e.detail.dropped) {
        this._state = 'idle';
        this._draggingFile = null;
        this._updateCaption();
      }
    });

    // Document dropped on drop zone
    this.shadowRoot.addEventListener('document-dropped', async (e) => {
      this._state = 'processing';
      this._updateCaption();

      // Find the file that was dropped
      const droppedData = e.detail;
      const file = this._files.find(f => f.id === droppedData.id) || this._draggingFile || this._selectedFile;

      if (!file) return;

      const dropZone = this.shadowRoot.querySelector('docstorm-drop-zone');

      if (dropZone && file) {
        await dropZone.startProcessing(
          file.filename,
          file.processingSteps || ['Processing...']
        );
      }
    });

    // Processing complete - show approval screen
    this.shadowRoot.addEventListener('processing-complete', () => {
      const file = this._draggingFile || this._selectedFile;

      if (file) {
        // Mark file as processed in file browser
        const fileBrowser = this.shadowRoot.querySelector('docstorm-file-browser');
        if (fileBrowser) {
          fileBrowser.markProcessed(file.id);
        }

        // Store processed filename for later
        this._processedFilename = file.filename;

        // Show the approval screen with record grid
        this._currentRecord = file.record;
        this._state = 'showing-approval';
        this._draggingFile = null;

        this._render();
      }
    });

    // Close button click (delegated)
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.closest('.demo__close-btn')) {
        this._closeRecord();
      }

      // Approve button click - transition to record page
      if (e.target.closest('.demo__approve-btn')) {
        this._approveRecord();
      }
    });
  }

  _approveRecord() {
    // Transition from approval to record page view
    this._state = 'showing-record-page';
    this._render();
  }

  _schedulePulse() {
    // Clear any existing timeout
    if (this._autoResetTimeout) {
      clearTimeout(this._autoResetTimeout);
    }

    // Start pulsing after 5 seconds
    this._autoResetTimeout = setTimeout(() => {
      const closeBtn = this.shadowRoot.querySelector('.demo__close-btn');
      if (closeBtn) {
        closeBtn.classList.add('demo__close-btn--pulsing');
      }
    }, 5000);
  }

  _closeRecord() {
    // Clear pulse timeout
    if (this._autoResetTimeout) {
      clearTimeout(this._autoResetTimeout);
      this._autoResetTimeout = null;
    }

    // Reset drop zone
    const dropZone = this.shadowRoot.querySelector('docstorm-drop-zone');
    if (dropZone) {
      dropZone.reset();
    }

    // Go back to idle state
    this._state = 'idle';
    this._currentRecord = null;
    this._processedFilename = null;

    this._render();
  }

  _updateCaption() {
    const captionEl = this.shadowRoot.querySelector('.demo__caption-text');
    if (captionEl) {
      captionEl.textContent = this._getCaptionText();
    }
  }

  // Public methods
  setFiles(files) {
    this.files = files;
  }

  reset() {
    // Clear auto-reset timer
    if (this._autoResetTimeout) {
      clearTimeout(this._autoResetTimeout);
      this._autoResetTimeout = null;
    }

    this._selectedFile = this._files[0] || null;
    this._currentRecord = null;
    this._state = 'idle';
    this._draggingFile = null;
    this._processedFilename = null;

    const fileBrowser = this.shadowRoot.querySelector('docstorm-file-browser');
    if (fileBrowser) {
      fileBrowser.clearProcessed();
    }

    const dropZone = this.shadowRoot.querySelector('docstorm-drop-zone');
    if (dropZone) {
      dropZone.reset();
    }

    this._render();
  }

  refresh() {
    this._render();
  }
}

// Register the custom element
if (!customElements.get('docstorm-demo')) {
  customElements.define('docstorm-demo', DemoContainer);
}
