(function() {
  'use strict';
  
  console.log('🚀 Lead catcher starting...');
  
  if (window.__leadCatcherLoaded) {
    console.log('⚠️ Lead catcher already loaded, skipping');
    return;
  }
  window.__leadCatcherLoaded = true;
  
  const config = window.__leadPixelConfig || {};
  const ENDPOINT = config.endpoint;
  
  console.log('🔧 Lead catcher config:', config);
  console.log('🎯 Endpoint:', ENDPOINT);
  
  if (!ENDPOINT) {
    console.error('❌ Lead catcher: missing endpoint configuration');
    return;
  }
  
  try {
    new URL(ENDPOINT);
    console.log('✅ Endpoint URL is valid');
  } catch (e) {
    console.error('❌ Lead catcher: invalid endpoint URL:', ENDPOINT, e);
    return;
  }
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  const utmData = {};
  const urlParams = new URLSearchParams(location.search);
  
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) utmData[key] = value;
  });
  
  console.log('📊 UTM data captured:', utmData);
  
  const baseContext = {
    page_url: location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    utm: utmData,
    user_agent: navigator.userAgent,
    timestamp: Date.now()
  };
  
  console.log('📋 Base context:', baseContext);
  
  function sendBeacon(payload) {
    console.log('📤 Attempting to send beacon:', payload);
    
    const body = JSON.stringify(payload);
    console.log('📦 Payload size:', body.length, 'bytes');
    
    if (navigator.sendBeacon) {
      console.log('🧪 Trying navigator.sendBeacon...');
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
      } else {
        console.warn('⚠️ Fetch failed with status:', response.status);
      }
    }).catch(error => {
      console.warn('⚠️ Fetch request failed:', error.message);
    });
  }
  
  function handleFormSubmit(event) {
    console.log('🎯 Form submit detected!', event.target);
    
    try {
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      console.log('📝 Form data extracted:', data);
      
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
  
  function attachToForms() {
    const forms = document.querySelectorAll('form');
    console.log('🔍 Found ' + forms.length + ' forms on page');
    
    forms.forEach(function(form, index) {
      if (!form.dataset.leadCatcherAttached) {
        console.log('📎 Attaching to form ' + (index + 1));
        form.addEventListener('submit', handleFormSubmit);
        form.dataset.leadCatcherAttached = 'true';
        console.log('✅ Attached to form ' + (index + 1));
      } else {
        console.log('⚠️ Form ' + (index + 1) + ' already has listener attached');
      }
    });
  }
  
  function observeNewForms() {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.tagName === 'FORM') {
                if (!node.dataset.leadCatcherAttached) {
                  console.log('📎 New form detected, attaching listener');
                  node.addEventListener('submit', handleFormSubmit);
                  node.dataset.leadCatcherAttached = 'true';
                }
              }
              if (node.querySelectorAll) {
                node.querySelectorAll('form').forEach(function(form) {
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
  
  function initialize() {
    console.log('🏁 Initializing lead catcher...');
    attachToForms();
    observeNewForms();
    
    console.log('📄 Sending pageview event...');
    sendBeacon({
      type: 'pageview',
      context: baseContext
    });
    
    console.log('✅ Lead catcher initialization complete');
  }
  
  if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    console.log('✅ DOM already loaded, initializing immediately');
    initialize();
  }
  
})();
