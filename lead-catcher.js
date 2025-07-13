(function() {
  'use strict';
  
  console.log('🚀 Lead catcher starting...');
  
  // Prevent double loading
  if (window.__leadCatcherLoaded) {
    console.log('⚠️ Lead catcher already loaded, skipping');
    return;
  }
  window.__leadCatcherLoaded = true;
  
  // Get config from global variable set by loader
  const config = window.__leadPixelConfig || {};
  const ENDPOINT = config.endpoint;
  
  console.log('🔧 Lead catcher config:', config);
  console.log('🎯 Endpoint:', ENDPOINT);
  
  if (!ENDPOINT) {
    console.error('❌ Lead catcher: missing endpoint configuration');
    return;
  }
  
  // Validate endpoint URL
  try {
    new URL(ENDPOINT);
    console.log('✅ Endpoint URL is valid');
  } catch (e) {
    console.error('❌ Lead catcher: invalid endpoint URL:', ENDPOINT, e);
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
  
  console.log('📊 UTM data captured:', utmData);
  
  // Base context for all events
  const baseContext = {
    page_url: location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    utm: utmData,
    user_agent: navigator.userAgent,
    timestamp: Date.now()
  };
  
  console.log('📋 Base context:', baseContext);
  
  // Enhanced beacon function - sendBeacon FIRST since it works
  function sendBeacon(payload) {
    console.log('📤 Attempting to send beacon:', payload);
    
    const body = JSON.stringify(payload);
    console.log('📦 Payload size:', body.length, 'bytes');
    
    // Try sendBeacon FIRST (we know this works!)
    if (navigator.sendBeacon) {
      console.log('🧪 Trying navigator.sendBeacon (priority method)...');
      const beaconResult = navigator.sendBeacon(ENDPOINT, body);
      console.log('📡 Beacon result:', beaconResult);
      
      if (beaconResult) {
        console.log('✅ Beacon sent successfully!');
        return;
      } else {
        console.log('⚠️ Beacon failed, trying fetch fallback...');
      }
    } else {
      console.log('⚠️ sendBeacon not available, using fetch...');
    }
    
    // Fallback to fetch only if sendBeacon fails
    fetch(ENDPOINT, {
      method: 'POST',
      body: body,
      keepalive: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log('📨 Fetch response status:', response.status);
      console.log('📨 Fetch response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ Fetch sent successfully');
        return response.text();
      } else {
        console.warn('⚠️ Fetch failed with status:', response.status, '(but sendBeacon probably worked)');
        return response.text().then(text => {
          console.warn('⚠️ Fetch error response:', text);
        });
      }
    }).then(responseText => {
      if (responseText) {
        console.log('📝 Fetch response body:', responseText);
      }
    }).catch(error => {
      console.warn('⚠️ Fetch request failed (but sendBeacon probably worked):', error.message);
    });
  }
  
  // Form submission handler
  function handleFormSubmit(event) {
    console.log('🎯 Form submit detected!', event.target);
    
    try {
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      console.log('📝 Form data extracted:', data);
      
      // Only send if we have meaningful data
      if (Object.keys(data).length === 0) {
        console.log('⚠️ No form data found, skipping...');
        return;
      }
      
      const payload = {
        type: 'lead',
        context: baseContext,
        form_data: data,
        form_id: form.id || null,
        form_action: form.action || null
      };
      
      sendBeacon(payload);
    } catch (error) {
      console.error('❌ Form submit handling error:', error);
    }
  }
  
  // Attach to existing forms
  function attachToForms() {
    const forms = document.querySelectorAll('form');
    console.log(`🔍 Found ${forms.length} forms on page`);
    
    forms.forEach((form, index) => {
      if (!form.dataset.leadCatcherAttached) {
        console.log(`📎 Attaching to form ${index + 1}:`, form);
        form.addEventListener('submit', handleFormSubmit);
        form.dataset.leadCatcherAttached = 'true';
        console.log(`✅ Attached to form ${index + 1}`);
      } else {
        console.log(`⚠️ Form ${index + 1} already has listener attached`);
      }
    });
  }
  
  // Watch for new forms (SPA compatibility)
  function observeNewForms() {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'FORM') {
                if (!node.dataset.leadCatcherAttached) {
                  console.log('📎 New form detected, attaching listener');
                  node.addEventListener('submit', handleFormSubmit);
                  node.dataset.leadCatcherAttached = 'true';
                }
              }
              // Check for forms within added elements
              if (node.querySelectorAll) {
                node.querySelectorAll('form').forEach(form => {
                  if (!form.dataset.leadCatcherAttached) {
                    console.log('📎 New nested form detected, attaching listener');
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
  
  // Initialize
  function initialize() {
    console.log('🏁 Initializing lead catcher...');
    attachToForms();
    observeNewForms();
    
    // Send page view event
    console.log('📄 Sending pageview event...');
    sendBeacon({
      type: 'pageview',
      context: baseContext
    });
    
    console.log('✅ Lead catcher initialization complete');
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    console.log('✅ DOM already loaded, initializing immediately');
    initialize();
  }
  
})();
