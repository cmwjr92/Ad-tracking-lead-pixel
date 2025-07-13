(function() {
  'use strict';
  
  // Prevent double loading
  if (window.__leadCatcherLoaded) return;
  window.__leadCatcherLoaded = true;
  
  // Get config from global variable set by loader
  const config = window.__leadPixelConfig || {};
  const ENDPOINT = config.endpoint;
  
  if (!ENDPOINT) {
    console.warn('lead-catcher: missing endpoint configuration');
    return;
  }
  
  // Validate endpoint URL
  try {
    new URL(ENDPOINT);
  } catch (e) {
    console.error('lead-catcher: invalid endpoint URL:', ENDPOINT);
    return;
  }
  
  // Capture UTM parameters and tracking IDs
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  const utmData = {};
  const urlParams = new URLSearchParams(location.search);
  
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) utmData[key] = value;
  });
  
  // Base context for all events
  const baseContext = {
    page_url: location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    utm: utmData,
    user_agent: navigator.userAgent,
    timestamp: Date.now()
  };
  
  // Deduplication set
  const sentEvents = new Set();
  
  // Enhanced beacon function with retry logic
  function sendBeacon(payload) {
    const body = JSON.stringify(payload);
    const eventHash = btoa(body).slice(0, 16); // Simple hash for deduplication
    
    if (sentEvents.has(eventHash)) {
      console.log('lead-catcher: duplicate event prevented');
      return;
    }
    
    sentEvents.add(eventHash);
    
    // Try sendBeacon first (non-blocking)
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) {
      console.log('lead-catcher: beacon sent successfully');
      return;
    }
    
    // Fallback to fetch with keepalive
    fetch(ENDPOINT, {
      method: 'POST',
      body: body,
      keepalive: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        console.log('lead-catcher: fetch sent successfully');
      } else {
        console.warn('lead-catcher: server returned', response.status);
      }
    }).catch(error => {
      console.error('lead-catcher: failed to send data:', error);
    });
  }
  
  // Form submission handler
  function handleFormSubmit(event) {
    try {
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Only send if we have meaningful data
      if (Object.keys(data).length === 0) return;
      
      sendBeacon({
        type: 'lead',
        context: baseContext,
        form_data: data,
        form_id: form.id || null,
        form_action: form.action || null
      });
    } catch (error) {
      console.error('lead-catcher: form submit error:', error);
    }
  }
  
  // Attach to existing forms
  function attachToForms() {
    document.querySelectorAll('form').forEach(form => {
      if (!form.dataset.leadCatcherAttached) {
        form.addEventListener('submit', handleFormSubmit);
        form.dataset.leadCatcherAttached = 'true';
      }
    });
  }
  
  // Watch for new forms being added (SPA compatibility)
  function observeNewForms() {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'FORM') {
                if (!node.dataset.leadCatcherAttached) {
                  node.addEventListener('submit', handleFormSubmit);
                  node.dataset.leadCatcherAttached = 'true';
                }
              }
              // Check for forms within added elements
              if (node.querySelectorAll) {
                node.querySelectorAll('form').forEach(form => {
                  if (!form.dataset.leadCatcherAttached) {
                    form.addEventListener('submit', handleFormSubmit);
                    form.dataset.leadCatcherAttached = 'true';
                  }
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // E-commerce checkout detection
  function detectCheckouts() {
    // Shopify checkout detection
    if (window.Shopify && window.Shopify.checkout) {
      sendBeacon({
        type: 'checkout',
        context: baseContext,
        platform: 'shopify',
        checkout_data: {
          total_price: window.Shopify.checkout.total_price,
          currency: window.Shopify.checkout.currency,
          line_items: window.Shopify.checkout.line_items
        }
      });
    }
    
    // ClickFunnels detection
    if (window.CFPageData) {
      sendBeacon({
        type: 'checkout',
        context: baseContext,
        platform: 'clickfunnels',
        checkout_data: window.CFPageData
      });
    }
    
    // GoHighLevel detection
    if (window.ghl_checkout_data) {
      sendBeacon({
        type: 'checkout',
        context: baseContext,
        platform: 'gohighlevel',
        checkout_data: window.ghl_checkout_data
      });
    }
  }
  
  // Initialize when DOM is ready
  function initialize() {
    attachToForms();
    observeNewForms();
    detectCheckouts();
    
    // Send page view event
    sendBeacon({
      type: 'pageview',
      context: baseContext
    });
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    sentEvents.clear();
  });
  
})();
