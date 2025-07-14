// loader.js - Robust version with fallbacks
(function(){
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var webhook = currentScript.getAttribute('data-webhook');
    
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('Loading lead capture with webhook:', webhook);
    
    // Try multiple loading methods
    function loadUniversalScript() {
        var s = document.createElement('script');
        s.setAttribute('data-webhook', webhook);
        
        // Method 1: Try raw GitHub
        s.src = 'https://raw.githubusercontent.com/cmwjr92/Ad-tracking-lead-pixel/main/universal.min.js';
        
        s.onload = function() {
            console.log('Lead capture script loaded successfully');
        };
        
        s.onerror = function() {
            console.log('Raw GitHub failed, trying CDN...');
            
            // Method 2: Try jsDelivr CDN as fallback
            var s2 = document.createElement('script');
            s2.src = 'https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/universal.min.js';
            s2.setAttribute('data-webhook', webhook);
            
            s2.onload = function() {
                console.log('Lead capture script loaded via CDN');
            };
            
            s2.onerror = function() {
                console.log('CDN failed, loading inline fallback...');
                loadInlineFallback();
            };
            
            document.head.appendChild(s2);
        };
        
        document.head.appendChild(s);
    }
    
    // Method 3: Inline fallback if external loading fails
    function loadInlineFallback() {
        console.log('Loading inline fallback script...');
        
        var inlineScript = document.createElement('script');
        inlineScript.textContent = `
(function() {
    console.log('🚀 Inline fallback script starting...');
    
    var WEBHOOK_URL = '${webhook}';
    var processedSubmissions = new Set();
    
    function captureFormData() {
        var data = {};
        var inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(function(input) {
            if (input.value && input.value.trim() !== '' && !input.disabled && input.type !== 'submit' && input.type !== 'button') {
                var key = input.name || input.id || input.type || 'field';
                data[key] = input.value;
            }
        });
        
        // Add tracking params
        var urlParams = new URLSearchParams(window.location.search);
        var tracking = {};
        ['gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(function(param) {
            var value = urlParams.get(param);
            if (value) tracking[param] = value;
        });
        if (Object.keys(tracking).length > 0) data._tracking = tracking;
        
        data._meta = { page_url: location.href, timestamp: Date.now() };
        return data;
    }
    
    function sendToWebhook(data, context) {
        if (!data || Object.keys(data).filter(k => k !== '_meta' && k !== '_tracking').length === 0) return false;
        
        var submissionId = JSON.stringify(data) + location.href;
        if (processedSubmissions.has(submissionId)) return false;
        processedSubmissions.add(submissionId);
        
        var payload = { d: data, u: location.href, t: Date.now(), context: context };
        
        if (navigator.sendBeacon) {
            return navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));
        } else {
            fetch(WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'}
            }).catch(function() {});
            return true;
        }
    }
    
    document.addEventListener('click', function(e) {
        var target = e.target;
        if (target.tagName === 'BUTTON' && /submit|send|join|sign|register|subscribe|reserve/i.test(target.textContent || target.value)) {
            var data = captureFormData();
            sendToWebhook(data, 'button_click');
        }
    });
    
    document.addEventListener('submit', function(e) {
        var data = captureFormData();
        sendToWebhook(data, 'form_submit');
    });
    
    window.testLeadCapture = function() {
        var data = captureFormData();
        return sendToWebhook(data, 'manual_test');
    };
    
    console.log('✅ Inline lead capture ready');
})();
        `;
        
        document.head.appendChild(inlineScript);
    }
    
    // Start loading
    loadUniversalScript();
})();
