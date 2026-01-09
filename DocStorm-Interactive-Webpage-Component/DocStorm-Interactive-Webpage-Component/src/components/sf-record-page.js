/**
 * Salesforce Record Page Component
 * A Web Component that displays records in a Salesforce Lightning Experience layout
 * with hand-drawn Rough.js styling
 */

export class SfRecordPage extends HTMLElement {
  static get observedAttributes() {
    return ['roughness', 'bowing', 'stroke-width', 'animate', 'seed'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = null;
    this._appContext = 'sales';
    this._themeColors = null;
    this._resizeObserver = null;
    this._rendered = false;
  }

  get recordData() {
    return this._data;
  }

  set recordData(value) {
    this._data = value;
    this._appContext = this._determineAppContext(value);
    this._themeColors = this._getThemeColors(this._appContext);
    this._render();
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

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this._rendered) {
      this._drawBorders();
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

  _determineAppContext(data) {
    const recordType = data?.recordType?.toLowerCase() || '';

    // Sales Cloud records
    if (['lead', 'contact', 'opportunity', 'account', 'order'].includes(recordType)) {
      return 'sales';
    }

    // Service Cloud records
    if (['case', 'claim', 'damage claim', 'ticket', 'expense'].includes(recordType)) {
      return 'service';
    }

    // Marketing Cloud records
    if (['campaign', 'meeting summary', 'candidate', 'contract'].includes(recordType)) {
      return 'marketing';
    }

    // Invoice goes to sales (accounts payable)
    if (recordType === 'invoice') {
      return 'sales';
    }

    return 'sales';
  }

  _getThemeColors(context) {
    const themes = {
      sales: {
        primary: '#0176d3',
        headerBg: '#032d60',
        accent: '#1b96ff',
        hachure: '#0176d3',
        name: 'Sales'
      },
      service: {
        primary: '#2e844a',
        headerBg: '#194e31',
        accent: '#45c65a',
        hachure: '#2e844a',
        name: 'Service'
      },
      marketing: {
        primary: '#f38303',
        headerBg: '#8c4b02',
        accent: '#ffa929',
        hachure: '#f38303',
        name: 'Marketing'
      }
    };
    return themes[context] || themes.sales;
  }

  _getIconClass(recordType) {
    const iconMap = {
      'lead': 'fa-user-plus',
      'contact': 'fa-user',
      'account': 'fa-building',
      'opportunity': 'fa-chart-line',
      'order': 'fa-shopping-cart',
      'invoice': 'fa-file-invoice-dollar',
      'case': 'fa-life-ring',
      'claim': 'fa-exclamation-triangle',
      'damage claim': 'fa-box-open',
      'ticket': 'fa-ticket',
      'expense': 'fa-receipt',
      'campaign': 'fa-bullhorn',
      'meeting summary': 'fa-calendar-check',
      'candidate': 'fa-user-tie',
      'contract': 'fa-file-contract'
    };
    return iconMap[recordType?.toLowerCase()] || 'fa-file';
  }

  _getActivityIcon(type) {
    const iconMap = {
      'email': 'fa-envelope',
      'task': 'fa-check-circle',
      'event': 'fa-calendar',
      'call': 'fa-phone',
      'note': 'fa-sticky-note',
      'meeting': 'fa-users'
    };
    return iconMap[type] || 'fa-circle';
  }

  _getStyles() {
    const theme = this._themeColors || this._getThemeColors('sales');

    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

      :host {
        display: block;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .sf-page {
        position: relative;
        background: #f3f3f3;
        min-height: 500px;
        overflow: visible;
      }

      .sf-page__hachures {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: visible;
      }

      .sf-page__borders {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        overflow: visible;
      }

      /* App Header */
      .sf-app-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 44px;
        padding: 0 16px;
        background: transparent;
        z-index: 1;
      }

      .sf-app-header__left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .sf-app-header__logo {
        width: 28px;
        height: 20px;
        fill: #fff;
      }

      .sf-app-header__app-name {
        font-size: 15px;
        font-weight: 500;
        color: #fff;
        letter-spacing: 0.3px;
      }

      .sf-app-header__right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sf-app-header__icon-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      /* Record Header */
      .sf-record-header {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        background: #fff;
        z-index: 1;
      }

      .sf-record-header__icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: ${theme.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
      }

      .sf-record-header__info {
        flex: 1;
      }

      .sf-record-header__type {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
        margin-bottom: 2px;
      }

      .sf-record-header__name {
        font-size: 20px;
        font-weight: 600;
        color: #000;
        margin: 0;
      }

      .sf-record-header__status {
        display: flex;
        align-items: center;
      }

      .sf-status-badge {
        display: inline-block;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 500;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .sf-status-badge--info {
        background: #e5f2ff;
        color: #0176d3;
      }

      .sf-status-badge--success {
        background: #e6f7e9;
        color: #2e844a;
      }

      .sf-status-badge--warning {
        background: #fef3e0;
        color: #b86e00;
      }

      .sf-status-badge--error {
        background: #fce4e4;
        color: #c23934;
      }

      /* Main Content Area */
      .sf-page__main {
        position: relative;
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
        padding: 16px 24px;
        z-index: 1;
      }

      /* Left Column */
      .sf-page__left-column {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Right Column / Sidebar */
      .sf-page__sidebar {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Cards */
      .sf-card {
        position: relative;
        background: #fff;
        padding: 16px;
      }

      .sf-card__header {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #333;
        margin: 0 0 12px 0;
        padding-bottom: 8px;
      }

      /* Highlights Panel */
      .sf-highlights {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .sf-highlights__item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sf-highlights__label {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
      }

      .sf-highlights__value {
        font-size: 14px;
        color: #333;
      }

      .sf-highlights__value a {
        color: ${theme.primary};
        text-decoration: none;
      }

      /* Details Section */
      .sf-details {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 0;
      }

      .sf-details__row {
        display: contents;
      }

      .sf-details__label {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
        padding: 10px 12px 10px 0;
      }

      .sf-details__value {
        font-size: 14px;
        color: #333;
        padding: 10px 0;
      }

      .sf-details__value a {
        color: ${theme.primary};
        text-decoration: none;
      }

      /* File Upload Placeholder */
      .sf-upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        border: 2px dashed #ccc;
        border-radius: 4px;
        color: #888;
        gap: 8px;
      }

      .sf-upload-placeholder i {
        font-size: 24px;
        color: #aaa;
      }

      .sf-upload-placeholder span {
        font-size: 12px;
      }

      .sf-upload__file {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        font-size: 13px;
        color: #333;
      }

      .sf-upload__file i {
        color: ${theme.primary};
      }

      /* Activity Feed */
      .sf-activity-feed {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .sf-activity-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
      }

      .sf-activity-item:last-child {
        border-bottom: none;
      }

      .sf-activity-item__icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 12px;
        flex-shrink: 0;
      }

      .sf-activity-item__content {
        flex: 1;
        min-width: 0;
      }

      .sf-activity-item__text {
        font-size: 13px;
        color: #333;
        margin: 0;
        line-height: 1.4;
      }

      .sf-activity-item__date {
        font-size: 11px;
        color: #888;
        margin-top: 2px;
      }

      /* Related List */
      .sf-page__related-list {
        position: relative;
        padding: 0 24px 24px;
        z-index: 1;
      }

      .sf-related-list {
        background: #fff;
        padding: 16px;
      }

      .sf-related-list__table {
        width: 100%;
        display: table;
        border-collapse: collapse;
      }

      .sf-related-list__header {
        display: table-row;
      }

      .sf-related-list__row {
        display: table-row;
      }

      .sf-related-list__cell {
        display: table-cell;
        padding: 10px 12px;
        font-size: 13px;
        color: #333;
        vertical-align: middle;
      }

      .sf-related-list__cell--header {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
      }

      /* Animation */
      .sf-page--animate {
        opacity: 0;
        transform: translateY(10px);
      }

      .sf-page--animate-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .sf-card--animate {
        opacity: 0;
        transform: translateY(8px);
      }

      .sf-card--animate-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
    `;
  }

  _formatValue(value, type) {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);

      case 'date':
        try {
          return new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return value;
        }

      case 'email':
        return `<a href="mailto:${value}">${value}</a>`;

      case 'phone':
        return `<a href="tel:${value}">${value}</a>`;

      case 'number':
        return new Intl.NumberFormat('en-US').format(value);

      default:
        return String(value);
    }
  }

  _getRecordName(data) {
    if (data?.recordPageMeta?.recordName) {
      return data.recordPageMeta.recordName;
    }

    // Try to find a name field
    const fields = data?.fields || data?.parent?.fields || [];
    const nameField = fields.find(f =>
      ['name', 'full name', 'first name', 'subject', 'contract name', 'merchant'].includes(f.label.toLowerCase())
    );

    if (nameField) {
      // If we have first name, try to find last name
      if (nameField.label.toLowerCase() === 'first name') {
        const lastNameField = fields.find(f => f.label.toLowerCase() === 'last name');
        if (lastNameField) {
          return `${nameField.value} ${lastNameField.value}`;
        }
      }
      return nameField.value;
    }

    // Fallback to record type + ID field
    const idField = fields.find(f =>
      f.label.toLowerCase().includes('number') || f.label.toLowerCase().includes('id')
    );
    return idField?.value || data?.recordType || 'Record';
  }

  _getStatus(data) {
    if (data?.recordPageMeta?.status) {
      return {
        text: data.recordPageMeta.status,
        variant: data.recordPageMeta.statusVariant || 'info'
      };
    }

    const fields = data?.fields || data?.parent?.fields || [];
    const statusField = fields.find(f => f.label.toLowerCase() === 'status');

    if (statusField) {
      const statusText = statusField.value?.toLowerCase() || '';
      let variant = 'info';

      if (statusText.includes('complete') || statusText.includes('approved') || statusText.includes('closed')) {
        variant = 'success';
      } else if (statusText.includes('pending') || statusText.includes('processing')) {
        variant = 'warning';
      } else if (statusText.includes('rejected') || statusText.includes('error')) {
        variant = 'error';
      }

      return { text: statusField.value, variant };
    }

    return { text: 'New', variant: 'info' };
  }

  _getHighlights(data) {
    if (data?.highlights && data.highlights.length > 0) {
      return data.highlights.slice(0, 4);
    }

    // Auto-generate highlights from first 4 fields
    const fields = data?.fields || data?.parent?.fields || [];
    return fields.slice(0, 4);
  }

  _getActivities(data) {
    if (data?.activities && data.activities.length > 0) {
      return data.activities;
    }

    // Generate contextual activities based on record type
    const recordType = data?.recordType?.toLowerCase() || '';

    const activitySets = {
      'lead': [
        { type: 'email', text: 'Welcome email sent', date: 'Today' },
        { type: 'task', text: 'Follow-up call scheduled', date: 'Tomorrow' },
        { type: 'event', text: 'Demo meeting', date: 'Dec 23' }
      ],
      'contact': [
        { type: 'email', text: 'Introduction email sent', date: 'Today' },
        { type: 'call', text: 'Discovery call completed', date: 'Yesterday' }
      ],
      'invoice': [
        { type: 'email', text: 'Invoice sent to vendor', date: 'Today' },
        { type: 'task', text: 'Payment reminder scheduled', date: 'Jan 5' },
        { type: 'note', text: 'Approved by finance team', date: 'Dec 10' }
      ],
      'order': [
        { type: 'email', text: 'Order confirmation sent', date: 'Today' },
        { type: 'task', text: 'Shipping notification pending', date: 'Tomorrow' },
        { type: 'note', text: 'Customer confirmed quantities', date: 'Dec 14' }
      ],
      'damage claim': [
        { type: 'task', text: 'Claim assigned to agent', date: 'Today' },
        { type: 'email', text: 'Customer notified', date: 'Today' },
        { type: 'note', text: 'Photos uploaded', date: 'Today' }
      ],
      'case': [
        { type: 'task', text: 'Case assigned', date: 'Today' },
        { type: 'email', text: 'Customer contacted', date: 'Today' },
        { type: 'note', text: 'Initial assessment complete', date: 'Today' }
      ],
      'expense': [
        { type: 'task', text: 'Submitted for approval', date: 'Today' },
        { type: 'note', text: 'Receipt attached', date: 'Today' }
      ],
      'meeting summary': [
        { type: 'email', text: 'Summary shared with attendees', date: 'Today' },
        { type: 'task', text: 'Action items assigned', date: 'Today' }
      ],
      'candidate': [
        { type: 'email', text: 'Application received', date: 'Today' },
        { type: 'task', text: 'Phone screen scheduled', date: 'Tomorrow' },
        { type: 'note', text: 'Resume reviewed', date: 'Today' }
      ],
      'contract': [
        { type: 'email', text: 'Contract sent for signature', date: 'Today' },
        { type: 'task', text: 'Follow up on signature', date: 'Dec 28' }
      ]
    };

    return activitySets[recordType] || [
      { type: 'task', text: 'Record created', date: 'Today' }
    ];
  }

  _getRelatedFile(data) {
    // Return the filename that was processed
    return data?.relatedFiles?.[0]?.name || null;
  }

  _renderAppHeader() {
    const theme = this._themeColors;

    return `
      <header class="sf-app-header">
        <div class="sf-app-header__left">
          <svg class="sf-app-header__logo" viewBox="0 0 50 35" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.5,17.5c0-6.9-5.6-12.5-12.5-12.5c-4.5,0-8.4,2.4-10.6,5.9C18.1,9.6,16.2,9,14.2,9C8.7,9,4.2,13.5,4.2,19c0,0.4,0,0.8,0.1,1.2C1.7,21.5,0,24.1,0,27.1C0,31.5,3.5,35,7.9,35h33.2c4.9,0,8.9-4,8.9-8.9C50,21.9,46.8,18.2,42.5,17.5z" fill="currentColor"/>
          </svg>
          <span class="sf-app-header__app-name">${theme.name}</span>
        </div>
        <div class="sf-app-header__right">
          <button class="sf-app-header__icon-btn" title="Setup">
            <i class="fa-solid fa-gear"></i>
          </button>
          <button class="sf-app-header__icon-btn" title="User">
            <i class="fa-solid fa-user"></i>
          </button>
        </div>
      </header>
    `;
  }

  _renderRecordHeader(data) {
    const recordType = data?.recordType || 'Record';
    const recordName = this._getRecordName(data);
    const status = this._getStatus(data);
    const iconClass = this._getIconClass(recordType);

    return `
      <div class="sf-record-header">
        <div class="sf-record-header__icon">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="sf-record-header__info">
          <div class="sf-record-header__type">${recordType}</div>
          <h1 class="sf-record-header__name">${recordName}</h1>
        </div>
        <div class="sf-record-header__status">
          <span class="sf-status-badge sf-status-badge--${status.variant}">${status.text}</span>
        </div>
      </div>
    `;
  }

  _renderHighlightsPanel(data) {
    const highlights = this._getHighlights(data);
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'sf-card--animate' : '';

    const itemsHTML = highlights.map(field => `
      <div class="sf-highlights__item">
        <span class="sf-highlights__label">${field.label}</span>
        <span class="sf-highlights__value">${this._formatValue(field.value, field.type)}</span>
      </div>
    `).join('');

    return `
      <div class="sf-card sf-card--highlights ${animateClass}" data-card="highlights">
        <h2 class="sf-card__header">Highlights</h2>
        <div class="sf-highlights">
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  _renderDetailsSection(data) {
    const fields = data?.fields || data?.parent?.fields || [];
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'sf-card--animate' : '';

    const rowsHTML = fields.map(field => `
      <div class="sf-details__row">
        <div class="sf-details__label">${field.label}</div>
        <div class="sf-details__value">${this._formatValue(field.value, field.type)}</div>
      </div>
    `).join('');

    return `
      <div class="sf-card sf-card--details ${animateClass}" data-card="details">
        <h2 class="sf-card__header">Details</h2>
        <div class="sf-details">
          ${rowsHTML}
        </div>
      </div>
    `;
  }

  _renderSidebar(data) {
    const activities = this._getActivities(data);
    const relatedFile = this._getRelatedFile(data);
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'sf-card--animate' : '';

    // File upload card
    const fileContent = relatedFile
      ? `<div class="sf-upload__file"><i class="fa-solid fa-file-circle-check"></i> ${relatedFile}</div>`
      : `<div class="sf-upload-placeholder">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <span>Drop files here</span>
        </div>`;

    const filesCardHTML = `
      <div class="sf-card sf-card--files ${animateClass}" data-card="files">
        <h2 class="sf-card__header">Files</h2>
        ${fileContent}
      </div>
    `;

    // Activity feed card
    const activityItemsHTML = activities.map(activity => `
      <div class="sf-activity-item">
        <div class="sf-activity-item__icon">
          <i class="fa-solid ${this._getActivityIcon(activity.type)}"></i>
        </div>
        <div class="sf-activity-item__content">
          <p class="sf-activity-item__text">${activity.text}</p>
          <div class="sf-activity-item__date">${activity.date}</div>
        </div>
      </div>
    `).join('');

    const activityCardHTML = `
      <div class="sf-card sf-card--activity ${animateClass}" data-card="activity">
        <h2 class="sf-card__header">Activity</h2>
        <div class="sf-activity-feed">
          ${activityItemsHTML}
        </div>
      </div>
    `;

    return `
      <div class="sf-page__sidebar">
        ${filesCardHTML}
        ${activityCardHTML}
      </div>
    `;
  }

  _renderRelatedList(data) {
    // Only render if we have children (parent-child record)
    if (data?.type !== 'parent-child' || !data?.children) {
      return '';
    }

    const { title, columns, columnTypes, rows } = data.children;
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'sf-card--animate' : '';

    const headerCells = columns.map(col => `
      <div class="sf-related-list__cell sf-related-list__cell--header">${col}</div>
    `).join('');

    const dataRows = rows.map(row => {
      const cells = row.map((cell, idx) => `
        <div class="sf-related-list__cell">${this._formatValue(cell, columnTypes[idx])}</div>
      `).join('');
      return `<div class="sf-related-list__row">${cells}</div>`;
    }).join('');

    return `
      <div class="sf-page__related-list">
        <div class="sf-card sf-related-list ${animateClass}" data-card="related">
          <h2 class="sf-card__header">${title}</h2>
          <div class="sf-related-list__table">
            <div class="sf-related-list__header">${headerCells}</div>
            ${dataRows}
          </div>
        </div>
      </div>
    `;
  }

  _render() {
    if (!this._data) {
      this.shadowRoot.innerHTML = `
        <style>${this._getStyles()}</style>
        <div class="sf-page">
          <div style="padding: 48px; text-align: center; color: #999;">
            No record data provided
          </div>
        </div>
      `;
      return;
    }

    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'sf-page--animate' : '';

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="sf-page ${animateClass}">
        <svg class="sf-page__hachures" aria-hidden="true"></svg>
        <svg class="sf-page__borders" aria-hidden="true"></svg>

        ${this._renderAppHeader()}
        ${this._renderRecordHeader(this._data)}

        <div class="sf-page__main">
          <div class="sf-page__left-column">
            ${this._renderHighlightsPanel(this._data)}
            ${this._renderDetailsSection(this._data)}
          </div>
          ${this._renderSidebar(this._data)}
        </div>

        ${this._renderRelatedList(this._data)}
      </div>
    `;

    this._rendered = true;

    requestAnimationFrame(() => {
      this._drawBorders();
      this._animateIn();
    });
  }

  _drawBorders() {
    const hachuresSvg = this.shadowRoot.querySelector('.sf-page__hachures');
    const bordersSvg = this.shadowRoot.querySelector('.sf-page__borders');
    const page = this.shadowRoot.querySelector('.sf-page');

    if (!hachuresSvg || !bordersSvg || !page || typeof rough === 'undefined') {
      return;
    }

    hachuresSvg.innerHTML = '';
    bordersSvg.innerHTML = '';

    const pageRect = page.getBoundingClientRect();
    if (pageRect.width === 0 || pageRect.height === 0) return;

    const padding = 4;

    // Setup SVGs
    hachuresSvg.setAttribute('width', pageRect.width + padding * 2);
    hachuresSvg.setAttribute('height', pageRect.height + padding * 2);
    hachuresSvg.style.left = `-${padding}px`;
    hachuresSvg.style.top = `-${padding}px`;

    bordersSvg.setAttribute('width', pageRect.width + padding * 2);
    bordersSvg.setAttribute('height', pageRect.height + padding * 2);
    bordersSvg.style.left = `-${padding}px`;
    bordersSvg.style.top = `-${padding}px`;

    const roughness = parseFloat(this.getAttribute('roughness')) || 1.2;
    const bowing = parseFloat(this.getAttribute('bowing')) || 1;
    const strokeWidth = parseFloat(this.getAttribute('stroke-width')) || 2;
    const seed = this.getAttribute('seed')
      ? parseInt(this.getAttribute('seed'))
      : 42;

    const rcHachures = rough.svg(hachuresSvg);
    const rcBorders = rough.svg(bordersSvg);

    const options = {
      roughness,
      bowing,
      stroke: '#000',
      strokeWidth,
      seed,
      disableMultiStroke: true
    };

    // Draw outer page border
    const outerBorder = rcBorders.rectangle(
      padding,
      padding,
      pageRect.width,
      pageRect.height,
      { ...options, strokeWidth: strokeWidth + 0.5 }
    );
    bordersSvg.appendChild(outerBorder);

    // Draw app header hachure
    const appHeader = this.shadowRoot.querySelector('.sf-app-header');
    if (appHeader) {
      const headerRect = appHeader.getBoundingClientRect();
      const headerHachure = rcHachures.rectangle(
        headerRect.left - pageRect.left + padding,
        headerRect.top - pageRect.top + padding,
        headerRect.width,
        headerRect.height,
        {
          ...options,
          fill: this._themeColors.hachure,
          fillStyle: 'hachure',
          fillWeight: 1.5,
          hachureAngle: -41,
          hachureGap: 6,
          stroke: 'none',
          strokeWidth: 0
        }
      );
      hachuresSvg.appendChild(headerHachure);

      // Header bottom line
      const headerLine = rcBorders.line(
        padding,
        headerRect.bottom - pageRect.top + padding,
        pageRect.width + padding,
        headerRect.bottom - pageRect.top + padding,
        { ...options, strokeWidth: strokeWidth * 0.75 }
      );
      bordersSvg.appendChild(headerLine);
    }

    // Draw record header border
    const recordHeader = this.shadowRoot.querySelector('.sf-record-header');
    if (recordHeader) {
      const rhRect = recordHeader.getBoundingClientRect();
      const rhLine = rcBorders.line(
        padding,
        rhRect.bottom - pageRect.top + padding,
        pageRect.width + padding,
        rhRect.bottom - pageRect.top + padding,
        { ...options, strokeWidth: strokeWidth * 0.75 }
      );
      bordersSvg.appendChild(rhLine);
    }

    // Draw card borders
    const cards = this.shadowRoot.querySelectorAll('.sf-card');
    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardBorder = rcBorders.rectangle(
        cardRect.left - pageRect.left + padding,
        cardRect.top - pageRect.top + padding,
        cardRect.width,
        cardRect.height,
        { ...options, strokeWidth: strokeWidth * 0.8 }
      );
      bordersSvg.appendChild(cardBorder);

      // Draw header underline for cards
      const header = card.querySelector('.sf-card__header');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const headerLine = rcBorders.line(
          cardRect.left - pageRect.left + padding,
          headerRect.bottom - pageRect.top + padding,
          cardRect.right - pageRect.left + padding,
          headerRect.bottom - pageRect.top + padding,
          { ...options, strokeWidth: strokeWidth * 0.5, roughness: roughness * 0.6 }
        );
        bordersSvg.appendChild(headerLine);
      }
    });

    // Draw details section dividers
    const detailsRows = this.shadowRoot.querySelectorAll('.sf-details__row');
    if (detailsRows.length > 0) {
      const detailsCard = this.shadowRoot.querySelector('.sf-card--details');
      if (detailsCard) {
        const detailsRect = detailsCard.getBoundingClientRect();

        detailsRows.forEach((row, idx) => {
          if (idx < detailsRows.length - 1) {
            const label = row.querySelector('.sf-details__label');
            if (label) {
              const labelRect = label.getBoundingClientRect();
              const rowLine = rcBorders.line(
                detailsRect.left - pageRect.left + padding + 16,
                labelRect.bottom - pageRect.top + padding,
                detailsRect.right - pageRect.left + padding - 16,
                labelRect.bottom - pageRect.top + padding,
                { ...options, strokeWidth: strokeWidth * 0.3, roughness: roughness * 0.4 }
              );
              bordersSvg.appendChild(rowLine);
            }
          }
        });
      }
    }

    // Draw related list table borders
    const relatedTable = this.shadowRoot.querySelector('.sf-related-list__table');
    if (relatedTable) {
      const tableRect = relatedTable.getBoundingClientRect();
      const tableLeft = tableRect.left - pageRect.left + padding;
      const tableTop = tableRect.top - pageRect.top + padding;

      // Column dividers
      const headerCells = relatedTable.querySelectorAll('.sf-related-list__cell--header');
      headerCells.forEach((cell, idx) => {
        if (idx < headerCells.length - 1) {
          const cellRect = cell.getBoundingClientRect();
          const divider = rcBorders.line(
            cellRect.right - pageRect.left + padding,
            tableTop,
            cellRect.right - pageRect.left + padding,
            tableTop + tableRect.height,
            { ...options, strokeWidth: strokeWidth * 0.4, roughness: roughness * 0.5 }
          );
          bordersSvg.appendChild(divider);
        }
      });

      // Row dividers
      const allRows = relatedTable.querySelectorAll('.sf-related-list__header, .sf-related-list__row');
      allRows.forEach((row, idx) => {
        if (idx < allRows.length - 1) {
          const rowRect = row.getBoundingClientRect();
          const rowLine = rcBorders.line(
            tableLeft,
            rowRect.bottom - pageRect.top + padding,
            tableLeft + tableRect.width,
            rowRect.bottom - pageRect.top + padding,
            { ...options, strokeWidth: strokeWidth * 0.4, roughness: roughness * 0.5 }
          );
          bordersSvg.appendChild(rowLine);
        }
      });
    }
  }

  _animateIn() {
    if (!this.hasAttribute('animate')) return;

    const page = this.shadowRoot.querySelector('.sf-page');
    if (!page) return;

    requestAnimationFrame(() => {
      page.classList.add('sf-page--animate-in');
    });

    // Animate cards with stagger
    const cards = this.shadowRoot.querySelectorAll('.sf-card--animate');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('sf-card--animate-in');
      }, 150 + i * 100);
    });
  }

  // Public methods
  refresh() {
    this._render();
  }

  setData(data) {
    this.recordData = data;
  }

  hide() {
    const page = this.shadowRoot.querySelector('.sf-page');
    if (page) {
      page.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      page.style.opacity = '0';
      page.style.transform = 'translateY(20px)';
    }
  }

  show() {
    const page = this.shadowRoot.querySelector('.sf-page');
    if (page) {
      page.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      page.style.opacity = '1';
      page.style.transform = 'translateY(0)';
    }
  }

  reset() {
    this._data = null;
    this._render();
  }
}

// Register the custom element
if (!customElements.get('sf-record-page')) {
  customElements.define('sf-record-page', SfRecordPage);
}
