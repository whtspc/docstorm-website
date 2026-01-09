/**
 * DocStorm Record Grid Component
 * A Web Component that displays Salesforce-like records with hand-drawn borders
 */

export class RecordGrid extends HTMLElement {
  static get observedAttributes() {
    return ['roughness', 'bowing', 'stroke-width', 'animate', 'seed', 'single-stroke', 'header-fill', 'column-header-fill'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = null;
    this._resizeObserver = null;
    this._rendered = false;
  }

  // Property getter/setter for record data
  get recordData() {
    return this._data;
  }

  set recordData(value) {
    this._data = value;
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

  _getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');

      :host {
        display: block;
        font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 8px;
      }

      .record-grid {
        position: relative;
        background: #ffffff;
        overflow: visible;
      }

      .record-grid__hachures {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: visible;
      }

      .record-grid__content {
        position: relative;
        z-index: 1;
      }

      /* Side-by-side layout for parent-child records */
      .record-grid__content--split {
        display: flex;
        align-items: flex-start;
        gap: 48px;
      }

      .record-grid__content--split .record-grid__section--parent {
        flex: 0 0 auto;
        min-width: 260px;
        margin-bottom: 0;
      }

      .record-grid__content--split .record-grid__section--children {
        flex: 1;
        margin-top: 0;
        margin-bottom: 0;
      }

      .record-grid__borders {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
        overflow: visible;
      }

      /* Section styling */
      .record-grid__section {
        margin-bottom: 24px;
      }

      .record-grid__section:last-child {
        margin-bottom: 0;
      }

      .record-grid__section--children {
        margin-top: 16px;
      }

      .record-grid__header {
        position: relative;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #000;
        margin: 0;
        padding: 12px 16px;
        background: transparent;
      }

      .record-grid__header-text {
        background: #fff;
        padding: 2px 6px;
        margin-left: -6px;
      }

      /* Key-Value Table (for single records and parent sections) */
      .record-grid__table {
        display: grid;
        grid-template-columns: 140px 1fr;
        width: 100%;
      }

      .record-grid__row {
        display: contents;
      }

      .record-grid__cell {
        padding: 12px 16px;
        border: none;
        background: #ffffff;
      }

      .record-grid__cell--label {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #000;
        background: transparent;
      }

      .record-grid__cell--value {
        font-size: 14px;
        color: #666;
      }

      .record-grid__cell--value a {
        color: #666;
        text-decoration: none;
        border-bottom: none;
      }

      .record-grid__cell--value a:hover {
        color: #666;
      }

      /* Child Table (for line items) */
      .record-grid__child-table {
        width: 100%;
        display: table;
        border-collapse: collapse;
      }

      .record-grid__child-header {
        display: table-row;
        background: transparent;
      }

      .record-grid__child-row {
        display: table-row;
        background: transparent;
      }

      .record-grid__child-cell {
        display: table-cell;
        padding: 10px 12px;
        font-size: 13px;
        color: #666;
        vertical-align: middle;
      }

      .record-grid__child-cell--header {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #000;
      }

      .record-grid__child-header-text {
        background: #fff;
        padding: 2px 4px;
      }

      /* Animation styles */
      .record-grid--animate {
        opacity: 0;
        transform: translateY(10px);
      }

      .record-grid--animate-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .record-grid__row--animate {
        opacity: 0;
        transform: translateX(-10px);
      }

      .record-grid__row--animate-in {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .record-grid__child-row--animate {
        opacity: 0;
        transform: translateX(-10px);
      }

      .record-grid__child-row--animate-in {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      /* Empty state */
      .record-grid__empty {
        padding: 32px;
        text-align: center;
        color: #999;
        font-style: italic;
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

  _generateTableHTML(title, fields, sectionType) {
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'record-grid__row--animate' : '';

    const headerHTML = title
      ? `<h3 class="record-grid__header"><span class="record-grid__header-text">${title}</span></h3>`
      : '';

    const rowsHTML = fields.map((field, i) => `
      <div class="record-grid__row ${animateClass}" data-index="${i}" role="row">
        <div class="record-grid__cell record-grid__cell--label" role="rowheader">
          ${field.label}
        </div>
        <div class="record-grid__cell record-grid__cell--value" role="cell">
          ${this._formatValue(field.value, field.type)}
        </div>
      </div>
    `).join('');

    return `
      <div class="record-grid__section record-grid__section--${sectionType}">
        ${headerHTML}
        <div class="record-grid__table" role="table">
          ${rowsHTML}
        </div>
      </div>
    `;
  }

  _generateChildTableHTML(children) {
    const { title, columns, columnTypes, rows } = children;
    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'record-grid__child-row--animate' : '';

    const headerCells = columns.map(col => `
      <div class="record-grid__child-cell record-grid__child-cell--header" role="columnheader">
        <span class="record-grid__child-header-text">${col}</span>
      </div>
    `).join('');

    const dataRows = rows.map((row, rowIndex) => {
      const cells = row.map((cell, colIndex) => `
        <div class="record-grid__child-cell" role="cell">
          ${this._formatValue(cell, columnTypes[colIndex])}
        </div>
      `).join('');

      return `
        <div class="record-grid__child-row ${animateClass}" data-row-index="${rowIndex}" role="row">
          ${cells}
        </div>
      `;
    }).join('');

    return `
      <div class="record-grid__section record-grid__section--children">
        <h3 class="record-grid__header"><span class="record-grid__header-text">${title}</span></h3>
        <div class="record-grid__child-table" role="table">
          <div class="record-grid__child-header" role="row">
            ${headerCells}
          </div>
          ${dataRows}
        </div>
      </div>
    `;
  }

  _generateGridHTML(data) {
    if (!data) {
      return '<div class="record-grid__empty">No data provided</div>';
    }

    const isParentChild = data.type === 'parent-child';
    let contentHTML = '';
    let contentClass = 'record-grid__content';

    if (isParentChild) {
      // Use side-by-side layout for parent-child
      contentClass += ' record-grid__content--split';

      // Parent section
      contentHTML += this._generateTableHTML(
        data.parent.title,
        data.parent.fields,
        'parent'
      );
      // Children section (arrow is drawn via Rough.js in SVG layer)
      contentHTML += this._generateChildTableHTML(data.children);
    } else {
      // Single record
      contentHTML = this._generateTableHTML(
        data.recordType,
        data.fields,
        'single'
      );
    }

    const animate = this.hasAttribute('animate');
    const animateClass = animate ? 'record-grid--animate' : '';

    return `
      <div class="record-grid ${animateClass}" part="grid">
        <svg class="record-grid__hachures" aria-hidden="true"></svg>
        <svg class="record-grid__borders" aria-hidden="true"></svg>
        <div class="${contentClass}">
          ${contentHTML}
        </div>
      </div>
    `;
  }

  _render() {
    const html = this._generateGridHTML(this._data);

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      ${html}
    `;

    this._rendered = true;

    // Draw borders after a frame to ensure layout is calculated
    requestAnimationFrame(() => {
      this._drawBorders();
      this._animateIn();
    });
  }

  _drawBorders() {
    const hachuresSvg = this.shadowRoot.querySelector('.record-grid__hachures');
    const bordersSvg = this.shadowRoot.querySelector('.record-grid__borders');
    const grid = this.shadowRoot.querySelector('.record-grid');

    if (!hachuresSvg || !bordersSvg || !grid || typeof rough === 'undefined') {
      return;
    }

    // Clear existing
    hachuresSvg.innerHTML = '';
    bordersSvg.innerHTML = '';

    // Get dimensions
    const gridRect = grid.getBoundingClientRect();
    if (gridRect.width === 0 || gridRect.height === 0) return;

    // Set SVG dimensions with extra padding for rough strokes
    const padding = 4;

    // Setup hachures SVG
    hachuresSvg.setAttribute('width', gridRect.width + padding * 2);
    hachuresSvg.setAttribute('height', gridRect.height + padding * 2);
    hachuresSvg.style.left = `-${padding}px`;
    hachuresSvg.style.top = `-${padding}px`;

    // Setup borders SVG
    bordersSvg.setAttribute('width', gridRect.width + padding * 2);
    bordersSvg.setAttribute('height', gridRect.height + padding * 2);
    bordersSvg.style.left = `-${padding}px`;
    bordersSvg.style.top = `-${padding}px`;

    // Get Rough.js options from attributes
    const roughness = parseFloat(this.getAttribute('roughness')) || 1.5;
    const bowing = parseFloat(this.getAttribute('bowing')) || 1;
    const strokeWidth = parseFloat(this.getAttribute('stroke-width')) || 2;
    const seed = this.getAttribute('seed')
      ? parseInt(this.getAttribute('seed'))
      : Math.floor(Math.random() * 2147483647);
    // Single-stroke is ON by default (no double lines), set single-stroke="false" to enable sketchy multi-stroke
    const singleStroke = this.getAttribute('single-stroke') !== 'false';

    const rcHachures = rough.svg(hachuresSvg);
    const rcBorders = rough.svg(bordersSvg);
    const options = {
      roughness,
      bowing,
      stroke: '#000',
      strokeWidth,
      seed,
      disableMultiStroke: singleStroke
    };

    // Check if this is a split layout
    const isSplitLayout = this.shadowRoot.querySelector('.record-grid__content--split');

    if (isSplitLayout) {
      // Draw separate borders for parent and child sections
      const parentSection = this.shadowRoot.querySelector('.record-grid__section--parent');
      const childSection = this.shadowRoot.querySelector('.record-grid__section--children');

      if (parentSection) {
        const parentRect = parentSection.getBoundingClientRect();
        const parentLeft = parentRect.left - gridRect.left + padding;
        const parentTop = parentRect.top - gridRect.top + padding;

        const parentBorder = rcBorders.rectangle(
          parentLeft,
          parentTop,
          parentRect.width,
          parentRect.height,
          { ...options, strokeWidth: strokeWidth + 0.5 }
        );
        bordersSvg.appendChild(parentBorder);
      }

      if (childSection) {
        const childRect = childSection.getBoundingClientRect();
        const childLeft = childRect.left - gridRect.left + padding;
        const childTop = childRect.top - gridRect.top + padding;

        const childBorder = rcBorders.rectangle(
          childLeft,
          childTop,
          childRect.width,
          childRect.height,
          { ...options, strokeWidth: strokeWidth + 0.5 }
        );
        bordersSvg.appendChild(childBorder);
      }

      // Draw arrow between sections
      if (parentSection && childSection) {
        const parentRect = parentSection.getBoundingClientRect();
        const childRect = childSection.getBoundingClientRect();

        const arrowStartX = parentRect.right - gridRect.left + padding + 6;
        const arrowEndX = childRect.left - gridRect.left + padding - 6;
        const arrowY = gridRect.height / 2 + padding;

        // Arrow line
        const arrowLine = rcBorders.line(
          arrowStartX,
          arrowY,
          arrowEndX - 8,
          arrowY,
          { ...options, strokeWidth: strokeWidth * 0.9 }
        );
        bordersSvg.appendChild(arrowLine);

        // Arrow head (two short lines)
        const headSize = 8;
        const arrowHead1 = rcBorders.line(
          arrowEndX - 8,
          arrowY - headSize,
          arrowEndX,
          arrowY,
          { ...options, strokeWidth: strokeWidth * 0.9 }
        );
        const arrowHead2 = rcBorders.line(
          arrowEndX - 8,
          arrowY + headSize,
          arrowEndX,
          arrowY,
          { ...options, strokeWidth: strokeWidth * 0.9 }
        );
        bordersSvg.appendChild(arrowHead1);
        bordersSvg.appendChild(arrowHead2);
      }
    } else {
      // Draw single outer border for non-split layouts
      const outerRect = rcBorders.rectangle(
        padding,
        padding,
        gridRect.width,
        gridRect.height,
        { ...options, strokeWidth: strokeWidth + 0.5 }
      );
      bordersSvg.appendChild(outerRect);
    }

    // Get header fill colors
    const fillColors = {
      black: '#000000',
      darkgrey: '#444444',
      grey: '#888888',
      orange: '#FF6B35',
      red: '#E63946',
      blue: '#3A86FF',
      green: '#2D936C',
      none: null
    };
    const headerFillAttr = this.getAttribute('header-fill') || 'black';
    const headerFillColor = fillColors[headerFillAttr] || fillColors.black;

    // Column header fill (defaults to same as header-fill if not specified)
    const columnHeaderFillAttr = this.getAttribute('column-header-fill');
    const columnHeaderFillColor = columnHeaderFillAttr
      ? (fillColors[columnHeaderFillAttr] || fillColors.black)
      : headerFillColor;

    // Draw section borders
    const sections = this.shadowRoot.querySelectorAll('.record-grid__section');
    sections.forEach((section, sectionIndex) => {
      const sectionRect = section.getBoundingClientRect();
      const relativeTop = sectionRect.top - gridRect.top + padding;
      const relativeLeft = sectionRect.left - gridRect.left + padding;

      // Draw header with hachure fill
      const header = section.querySelector('.record-grid__header');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const headerTop = headerRect.top - gridRect.top + padding;
        const headerBottom = headerRect.bottom - gridRect.top + padding;
        const headerLeft = headerRect.left - gridRect.left + padding;
        const headerWidth = headerRect.width;
        const headerHeight = headerRect.height;

        // Draw border line for child sections (to separate from parent) - only for stacked layout
        const isChildSection = section.classList.contains('record-grid__section--children');

        if (isChildSection && !isSplitLayout) {
          // Horizontal top border for stacked layout
          const topLine = rcBorders.line(
            relativeLeft,
            headerTop,
            relativeLeft + sectionRect.width,
            headerTop,
            { ...options, strokeWidth: strokeWidth * 0.75 }
          );
          bordersSvg.appendChild(topLine);
        }

        // Draw hachure fill behind header (in hachures SVG)
        if (headerFillColor) {
          const hachureRect = rcHachures.rectangle(
            headerLeft,
            headerTop,
            headerWidth,
            headerHeight,
            {
              ...options,
              fill: headerFillColor,
              fillStyle: 'hachure',
              fillWeight: 1.5,
              hachureAngle: -41,
              hachureGap: 6,
              stroke: 'none',
              strokeWidth: 0
            }
          );
          hachuresSvg.appendChild(hachureRect);
        }

        // Draw header underline (in borders SVG)
        const line = rcBorders.line(
          relativeLeft,
          headerBottom,
          relativeLeft + sectionRect.width,
          headerBottom,
          { ...options, strokeWidth: strokeWidth * 0.75 }
        );
        bordersSvg.appendChild(line);
      }

      // Draw separator line between sections (except last) - only for stacked layout
      if (sectionIndex < sections.length - 1 && !isSplitLayout) {
        const sectionBottom = relativeTop + sectionRect.height;
        const separator = rcBorders.line(
          padding,
          sectionBottom,
          gridRect.width + padding,
          sectionBottom,
          { ...options, strokeWidth: strokeWidth * 0.75 }
        );
        bordersSvg.appendChild(separator);
      }
    });

    // Draw table row borders for key-value tables (in borders SVG)
    const tables = this.shadowRoot.querySelectorAll('.record-grid__table');
    tables.forEach(table => {
      const tableRect = table.getBoundingClientRect();
      const tableLeft = tableRect.left - gridRect.left + padding;
      const tableRight = tableLeft + tableRect.width;

      // Draw vertical divider between label and value columns
      const firstLabel = table.querySelector('.record-grid__cell--label');
      if (firstLabel) {
        const labelRect = firstLabel.getBoundingClientRect();
        const dividerX = labelRect.right - gridRect.left + padding;
        const tableTop = tableRect.top - gridRect.top + padding;
        const tableBottom = tableTop + tableRect.height;

        const divider = rcBorders.line(
          dividerX,
          tableTop,
          dividerX,
          tableBottom,
          { ...options, strokeWidth: strokeWidth * 0.6, roughness: roughness * 0.8 }
        );
        bordersSvg.appendChild(divider);
      }

      // Draw horizontal row dividers
      const rows = table.querySelectorAll('.record-grid__row');
      rows.forEach((row, rowIndex) => {
        if (rowIndex < rows.length - 1) {
          const cells = row.querySelectorAll('.record-grid__cell');
          if (cells.length > 0) {
            const cellRect = cells[0].getBoundingClientRect();
            const rowBottom = cellRect.bottom - gridRect.top + padding;

            const rowLine = rcBorders.line(
              tableLeft,
              rowBottom,
              tableRight,
              rowBottom,
              { ...options, strokeWidth: strokeWidth * 0.5, roughness: roughness * 0.6 }
            );
            bordersSvg.appendChild(rowLine);
          }
        }
      });
    });

    // Draw child table borders
    const childTables = this.shadowRoot.querySelectorAll('.record-grid__child-table');
    childTables.forEach(table => {
      const tableRect = table.getBoundingClientRect();
      const tableLeft = tableRect.left - gridRect.left + padding;
      const tableTop = tableRect.top - gridRect.top + padding;

      // Draw hachure fill behind child table header row (in hachures SVG)
      // TEMPORARILY DISABLED - uncomment to restore column header hachures
      /*
      const childHeaderRow = table.querySelector('.record-grid__child-header');
      if (childHeaderRow && columnHeaderFillColor) {
        const headerRowRect = childHeaderRow.getBoundingClientRect();
        const headerRowTop = headerRowRect.top - gridRect.top + padding;
        const headerRowLeft = headerRowRect.left - gridRect.left + padding;

        const hachureRect = rcHachures.rectangle(
          headerRowLeft,
          headerRowTop,
          headerRowRect.width,
          headerRowRect.height,
          {
            ...options,
            fill: columnHeaderFillColor,
            fillStyle: 'hachure',
            fillWeight: 1.2,
            hachureAngle: 60,
            hachureGap: 10,
            stroke: 'none',
            strokeWidth: 0
          }
        );
        hachuresSvg.appendChild(hachureRect);
      }
      */

      // Draw column dividers (in borders SVG)
      const headerCells = table.querySelectorAll('.record-grid__child-cell--header');
      headerCells.forEach((cell, index) => {
        if (index < headerCells.length - 1) {
          const cellRect = cell.getBoundingClientRect();
          const dividerX = cellRect.right - gridRect.left + padding;

          const divider = rcBorders.line(
            dividerX,
            tableTop,
            dividerX,
            tableTop + tableRect.height,
            { ...options, strokeWidth: strokeWidth * 0.5, roughness: roughness * 0.7 }
          );
          bordersSvg.appendChild(divider);
        }
      });

      // Draw row dividers (in borders SVG)
      const allRows = table.querySelectorAll('.record-grid__child-header, .record-grid__child-row');
      allRows.forEach((row, index) => {
        if (index < allRows.length - 1) {
          const rowRect = row.getBoundingClientRect();
          const rowBottom = rowRect.bottom - gridRect.top + padding;

          const rowLine = rcBorders.line(
            tableLeft,
            rowBottom,
            tableLeft + tableRect.width,
            rowBottom,
            { ...options, strokeWidth: strokeWidth * 0.5, roughness: roughness * 0.6 }
          );
          bordersSvg.appendChild(rowLine);
        }
      });
    });
  }

  _animateIn() {
    if (!this.hasAttribute('animate')) return;

    const grid = this.shadowRoot.querySelector('.record-grid');
    if (!grid) return;

    // Animate main grid
    requestAnimationFrame(() => {
      grid.classList.add('record-grid--animate-in');
    });

    // Animate key-value rows with stagger
    const rows = this.shadowRoot.querySelectorAll('.record-grid__row--animate');
    rows.forEach((row, i) => {
      setTimeout(() => {
        row.classList.add('record-grid__row--animate-in');
      }, 100 + i * 50);
    });

    // Animate child rows with stagger
    const childRows = this.shadowRoot.querySelectorAll('.record-grid__child-row--animate');
    const rowOffset = rows.length * 50 + 150;
    childRows.forEach((row, i) => {
      setTimeout(() => {
        row.classList.add('record-grid__child-row--animate-in');
      }, rowOffset + i * 40);
    });
  }

  // Public methods
  refresh() {
    this._render();
  }

  setData(data) {
    this.recordData = data;
  }

  redrawBorders() {
    this._drawBorders();
  }

  hide() {
    const grid = this.shadowRoot.querySelector('.record-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(20px)';
    }
  }

  show() {
    const grid = this.shadowRoot.querySelector('.record-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }
  }

  reset() {
    this._data = null;
    this._render();
  }
}
