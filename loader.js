// loader.js - All-in-one version (no dynamic script creation)
(function(){
    'use strict';
    if (window._leadCaptureLoaded) return;
    window._leadCaptureLoaded = true;
    console.log('🚀 Lead capture starting...');
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var WEBHOOK_URL = currentScript.getAttribute('data-webhook');
    
    if (!WEBHOOK_URL) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('🚀 Lead capture starting with webhook:', WEBHOOK_URL);
    
    var processed = [];
    
    function capture() {
        console.log('📋 Capturing form data...');
        var data = {};
        var inputs = document.querySelectorAll('input, select, textarea');
        console.log('🔍 Found inputs:', inputs.length);
        
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            console.log('Input ' + i + ':', input.name, input.value, input.type);
            
            if (input.value && input.value.trim() && !input.disabled && input.type !== 'submit' && input.type !== 'button') {
                var key = input.name || input.id || input.type || 'field';
                data[key] = input.value;
                console.log('✅ Captured:', key, input.value);
            }
        }
        
        // Add URL parameters
        var urlParams = new URLSearchParams(window.location.search);
        var tracking = {};
        var trackingParams = ['gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign'];
        for (var i = 0; i < trackingParams.length; i++) {
            var value = urlParams.get(trackingParams[i]);
            if (value) tracking[trackingParams[i]] = value;
        }
        if (Object.keys(tracking).length > 0) data._tracking = tracking;
        
        data._meta = { url: location.href, time: Date.now() };
        console.log('📦 Final data:', data);
        return data;
    }
    
    function send(data, context) {
        console.log('📡 Sending to webhook...', context);
        
        // Check if we have actual form data
        var keys = Object.keys(data);
        var hasFormData = false;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== '_meta' && keys[i] !== '_tracking') {
                hasFormData = true;
                break;
            }
        }
        
        if (!hasFormData) {
            console.log('❌ No form data to send');
            return false;
        }
        
        // Check for duplicates
        var id = JSON.stringify(data) + location.href;
        for (var i = 0; i < processed.length; i++) {
            if (processed[i] === id) {
                console.log('🚫 Duplicate submission blocked');
                return false;
            }
        }
        processed.push(id);
        
        var payload = {
            d: data,
            u: location.href,
            t: Date.now(),
            context: context
        };
        
        console.log('🚀 Sending payload:', payload);
        
        if (navigator.sendBeacon) {
            var result = navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));
            console.log('✅ Webhook sent via beacon:', result);
            return result;
        } else {
            console.log('📡 Using XMLHttpRequest fallback...');
            var xhr = new XMLHttpRequest();
            xhr.open('POST', WEBHOOK_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                console.log('✅ Webhook response:', xhr.status);
            };
            xhr.onerror = function() {
                console.log('❌ Webhook error');
            };
            xhr.send(JSON.stringify(payload));
            return true;
        }
    }
    
    // Handle button clicks
    document.addEventListener('click', function(e) {
        var target = e.target;
        console.log('🖱️ Click detected on:', target.tagName, target.textContent);
        
        var text = target.textContent || target.value || '';
        if (target.tagName === 'BUTTON' && /submit|send|join|sign|register|subscribe|reserve/i.test(text)) {
            console.log('✅ Submit button clicked');
            var data = capture();
            send(data, 'button_click');
        }
    });
    
    // Handle form submissions
    document.addEventListener('submit', function(e) {
        console.log('📋 Form submission detected');
        var data = capture();
        send(data, 'form_submit');
    });
    
    // Manual test function
    window.testLeadCapture = function() {
        console.log('🧪 Manual test triggered');
        var data = capture();
        return send(data, 'manual_test');
    };
    
    console.log('✅ Lead capture ready - testLeadCapture() available');
})();
