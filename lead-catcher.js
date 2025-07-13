(function() {
  console.log('Lead catcher starting...');
  
  if (window.__leadCatcherLoaded) {
    console.log('Already loaded, skipping');
    return;
  }
  window.__leadCatcherLoaded = true;
  
  var config = window.__leadPixelConfig || {};
  var ENDPOINT = config.endpoint;
  
  console.log('Config:', config);
  console.log('Endpoint:', ENDPOINT);
  
  if (!ENDPOINT) {
    console.error('Missing endpoint configuration');
    return;
  }
  
  var utmData = {};
  var urlParams = new URLSearchParams(location.search);
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  
  for (var i = 0; i < utmKeys.length; i++) {
    var key = utmKeys[i];
    var value = urlParams.get(key);
    if (value) {
      utmData[key] = value;
    }
  }
  
  console.log('UTM data:', utmData);
  
  var baseContext = {
    page_url: location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    utm: utmData,
    user_agent: navigator.userAgent,
    timestamp: Date.now()
  };
  
  function sendBeacon(payload) {
    console.log('Sending beacon:', payload);
    
    var body = JSON.stringify(payload);
    console.log('Payload size:', body.length, 'bytes');
    
    if (navigator.sendBeacon) {
      console.log('Trying sendBeacon...');
      var result = navigator.sendBeacon(ENDPOINT, body);
      console.log('Beacon result:', result);
      
      if (result) {
        console.log('Beacon sent successfully!');
        return;
      }
    }
    
    console.log('Using fetch fallback...');
    fetch(ENDPOINT, {
      method: 'POST',
      body: body,
      keepalive: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function(response) {
      console.log('Fetch response status:', response.status);
      if (response.ok) {
        console.log('Fetch sent successfully');
      } else {
        console.warn('Fetch failed with status:', response.status);
      }
    }).catch(function(error) {
      console.warn('Fetch failed:', error.message);
    });
  }
  
  function handleFormSubmit(event) {
    console.log('Form submit detected!', event.target);
    
    try {
      var form = event.target;
      var formData = new FormData(form);
      var data = {};
      
      var entries = formData.entries();
      var entry = entries.next();
      while (!entry.done) {
        data[entry.value[0]] = entry.value[1];
        entry = entries.next();
      }
      
      console.log('Form data:', data);
      
      if (Object.keys(data).length === 0) {
        console.log('No form data found, skipping...');
        return;
      }
      
      var payload = {
        type: 'lead',
        context: baseContext,
        form_data: data,
        form_id: form.id || null,
        form_action: form.action || null
      };
      
      sendBeacon(payload);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  }
  
  function attachToForms() {
    var forms = document.querySelectorAll('form');
    console.log('Found ' + forms.length + ' forms');
    
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (!form.dataset.leadCatcherAttached) {
        console.log('Attaching to form ' + (i + 1));
        form.addEventListener('submit', handleFormSubmit);
        form.dataset.leadCatcherAttached = 'true';
        console.log('Attached to form ' + (i + 1));
      }
    }
  }
  
  function initialize() {
    console.log('Initializing lead catcher...');
    attachToForms();
    
    console.log('Sending pageview event...');
    sendBeacon({
      type: 'pageview',
      context: baseContext
    });
    
    console.log('Lead catcher ready!');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
})();
