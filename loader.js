// loader.js - Simple working version
(function(){
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var webhook = currentScript.getAttribute('data-webhook');
    
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('Loading lead capture with webhook:', webhook);
    
    // Direct inline script creation
    var script = document.createElement('script');
    
    script.innerHTML = `
(function() {
    console.log('🚀 Lead capture starting...');
    
    var WEBHOOK_URL = '${webhook}';
    var processed = new Set();
    
    function capture() {
        console.log('📋 Capturing...');
        var data = {};
        var inputs = document.querySelectorAll('input, select, textarea');
        console.log('Found inputs:', inputs.length);
        
        inputs.forEach(function(input, i) {
            console.log('Input', i, ':', input.name, input.value, input.type);
            if (input.value && input.value.trim() && !input.disabled && input.type !== 'submit' && input.type !== 'button') {
                var key = input.name || input.id || input.type || 'field';
                data[key] = input.value;
                console.log('✅ Captured:', key, input.value);
            }
        });
        
        data._meta = { url: location.href, time: Date.now() };
        console.log('📦 Data:', data);
        return data;
    }
    
    function send(data, ctx) {
        console.log('📡 Sending...', ctx);
        if (!data || Object.keys(data).filter(k => k !== '_meta').length === 0) {
            console.log('❌ No data');
            return false;
        }
        
        var id = JSON.stringify(data) + location.href;
        if (processed.has(id)) {
            console.log('🚫 Duplicate');
            return false;
        }
        processed.add(id);
        
        var payload = { d: data, u: location.href, t: Date.now(), context: ctx };
        console.log('🚀 Payload:', payload);
        
        if (navigator.sendBeacon) {
            var result = navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));
            console.log('✅ Sent:', result);
            return result;
        } else {
            fetch(WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'}
            }).then(r => console.log('✅ Response:', r.status))
              .catch(e => console.log('❌ Error:', e));
            return true;
        }
    }
    
    document.addEventListener('click', function(e) {
        console.log('🖱️ Click:', e.target.tagName, e.target.textContent);
        if (e.target.tagName === 'BUTTON' && /submit|send|join|sign|register|subscribe|reserve/i.test(e.target.textContent)) {
            console.log('✅ Submit button');
            var data = capture();
            send(data, 'click');
        }
    });
    
    document.addEventListener('submit', function(e) {
        console.log('📋 Submit');
        var data = capture();
        send(data, 'submit');
    });
    
    window.testLeadCapture = function() {
        console.log('🧪 Test');
        var data = capture();
        return send(data, 'test');
    };
    
    console.log('✅ Ready');
})();
    `;
    
    document.head.appendChild(script);
    console.log('🚀 Inline script added');
})();
