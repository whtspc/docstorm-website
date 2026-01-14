/**
 * DocStorm Demo Injection Script
 * Injects the demo component AFTER the "Try it out for yourself" section,
 * as a sibling element (between sections) to avoid Canva's event handlers.
 *
 * Note: We search for text content, not IDs, because Canva generates dynamic IDs
 * that change on re-export.
 */

/**
 * Wait for the "Try it out" section to appear in the DOM
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<Element>} - The section element
 */
function waitForSection(timeout = 15000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function check() {
      // Search for "Try it out" text in the rendered DOM
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim().toLowerCase() || '';
        if (text.includes('try it out yourself') || text.includes('try it out')) {
          console.log('[DocStorm] Found matching text:', text);
          // Walk up to find the parent <section> element
          let parent = node.parentElement;
          while (parent && parent.tagName !== 'SECTION') {
            parent = parent.parentElement;
          }
          if (parent && parent.tagName === 'SECTION') {
            resolve(parent);
            return;
          }
        }
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for "Try it out" section'));
        return;
      }

      requestAnimationFrame(check);
    }

    check();
  });
}

/**
 * Inject the DocStorm demo component
 */
async function injectDemo() {
  try {
    console.log('[DocStorm] Waiting for "Try it out" section...');

    const section = await waitForSection();
    console.log('[DocStorm] Found section:', section.id || section.tagName);

    // Hide the original Canva section since we recreate it in the component
    section.style.display = 'none';

    // Check if demo already exists
    if (document.getElementById('docstorm-demo-wrapper')) {
      console.log('[DocStorm] Demo already injected, skipping');
      return;
    }

    // Create full-width background container
    const bgContainer = document.createElement('div');
    bgContainer.id = 'docstorm-demo-bg';
    bgContainer.style.cssText = `
      width: 100%;
      background: #fff;
      padding: 2rem 0;
    `;

    // Create demo wrapper (centered, max-width)
    const wrapper = document.createElement('div');
    wrapper.id = 'docstorm-demo-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 1rem;
      box-sizing: border-box;
    `;

    // Create the demo element
    const demo = document.createElement('docstorm-demo');
    demo.id = 'injected-demo';
    wrapper.appendChild(demo);
    bgContainer.appendChild(wrapper);

    // Insert the demo AFTER the section (as a sibling)
    // This avoids clipping issues from Canva's fixed-height containers
    section.insertAdjacentElement('afterend', bgContainer);
    console.log('[DocStorm] Demo inserted after section');

    // Initialize with demo files
    const { demoFiles } = await import('./src/data/mock-records.js');
    demo.files = demoFiles;

    console.log('[DocStorm] Demo initialized successfully');
  } catch (error) {
    console.error('[DocStorm] Failed to inject demo:', error);
  }
}

/**
 * Set up mailto links for all CTA buttons using event delegation
 * This catches clicks on buttons regardless of when they're rendered
 */
function injectDemoButtons() {
  const mailto = 'mailto:info@docstorm.eu';
  const buttonTexts = ['request a demo', 'get early access'];

  // Use event delegation on document body to catch all clicks
  document.body.addEventListener('click', (e) => {
    // Check if the click target or any of its parents contains our button text
    let target = e.target;

    while (target && target !== document.body) {
      const text = target.textContent?.trim().toLowerCase() || '';

      // Check if this element contains one of our button texts
      const isCtaButton = buttonTexts.some(btnText => text.includes(btnText));

      if (isCtaButton) {
        // Make sure it's a reasonably sized button (not the whole page)
        const rect = target.getBoundingClientRect();
        if (rect.width < 400 && rect.height < 150) {
          console.log('[DocStorm] CTA button clicked:', target);
          e.preventDefault();
          e.stopPropagation();
          window.location.href = mailto;
          return;
        }
      }

      target = target.parentElement;
    }
  }, true); // Use capture phase to intercept before Canva's handlers

  // Add mouseover handler to show pointer cursor on CTA buttons
  document.body.addEventListener('mouseover', (e) => {
    let target = e.target;

    while (target && target !== document.body) {
      const text = target.textContent?.trim().toLowerCase() || '';
      const isCtaButton = buttonTexts.some(btnText => text.includes(btnText));

      if (isCtaButton) {
        const rect = target.getBoundingClientRect();
        if (rect.width < 400 && rect.height < 150) {
          target.style.cursor = 'pointer';
          return;
        }
      }

      target = target.parentElement;
    }
  }, true);

  console.log('[DocStorm] CTA button click handler installed');
}

/**
 * Start injection when DOM is ready
 */
function init() {
  const delay = 2000; // Delay for Canva to render

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(injectDemo, delay);
      setTimeout(injectDemoButtons, delay);
    });
  } else {
    setTimeout(injectDemo, delay);
    setTimeout(injectDemoButtons, delay);
  }
}

init();
