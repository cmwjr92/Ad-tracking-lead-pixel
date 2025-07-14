// loader.js - Working version that actually triggers fallback
(function(){
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var webhook = currentScript.getAttribute('data-webhook');
    
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('Loading lead capture with webhook:', webhook);
    
    // Method 3: Inline fallback (use this directly since external loading fails)
    function loadInlineFallback() {
        console.log('🚀 Loading inline lead capture...');
        
        var inlineScript = document.createElement('script');
        inlineScript.textContent = '(function() {' +
            'console.log("🚀 Inline lead capture starting...");' +
            'var WEBHOOK_URL = "' + webhook + '";' +
            'var processedSubmissions = new Set();' +
            'function captureFormData() {' +
                'console.log("📋 Capturing form data...");' +
                'var data = {};' +
                'var inputs = document.querySelectorAll("input, select, textarea");' +
                'console.log("🔍 Found inputs:", inputs.length);' +
                'inputs.forEach(function(input, i) {' +
                    'console.log("Input " + i + ":", input.name, input.value, input.type);' +
                    'if (input.value && input.value.trim() !== "" && !input.disabled && input.type !== "submit" && input.type !== "button") {' +
                        'var key = input.name || input.id || input.type || "field";' +
                        'data[key] = input.value;' +
                        'console.log("✅ Captured:", key, input.value);' +
                    '}' +
                '});' +
                'var urlParams = new URLSearchParams(window.location.search);' +
                'var tracking = {};' +
                '["gclid", "fbclid", "utm_source", "utm_medium", "utm_campaign"].forEach(function(param) {' +
                    'var value = urlParams.get(param);' +
                    'if (value) tracking[param] = value;' +
                '});' +
                'if (Object.keys(tracking).length > 0) data._tracking = tracking;' +
                'data._meta = { page_url: location.href, timestamp: Date.now() };' +
                'console.log("📦 Final data:", data);' +
                'return data;' +
            '}' +
            'function sendToWebhook(data, context) {' +
                'console.log("📡 Sending to webhook...", context);' +
                'if (!data || Object.keys(data).filter(function(k) { return k !== "_meta" && k !== "_tracking"; }).length === 0) {' +
                    'console.log("❌ No form data to send");' +
                    'return false;' +
                '}' +
                'var submissionId = JSON.stringify(data) + location.href;' +
                'if (processedSubmissions.has(submissionId)) {' +
                    'console.log("🚫 Duplicate blocked");' +
                    'return false;' +
                '}' +
                'processedSubmissions.add(submissionId);' +
                'var payload = { d: data, u: location.href, t: Date.now(), context: context };' +
                'console.log("🚀 Payload:", payload);' +
                'if (navigator.sendBeacon) {' +
                    'var result = navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));' +
                    'console.log("✅ Webhook sent:", result);' +
                    'return result;' +
                '} else {' +
                    'fetch(WEBHOOK_URL, {' +
                        'method: "POST",' +
                        'body: JSON.stringify(payload),' +
                        'headers: {"Content-Type": "application/json"}' +
                    '}).then(function(r) {' +
                        'console.log("✅ Webhook response:", r.status);' +
                    '}).catch(function(e) {' +
                        'console.log("❌ Webhook error:", e);' +
                    '});' +
                    'return true;' +
                '}' +
            '}' +
            'document.addEventListener("click", function(e) {' +
                'var target = e.target;' +
                'console.log("🖱️ Click on:", target.tagName, target.textContent);' +
                'if (target.tagName === "BUTTON" && /submit|send|join|sign|register|subscribe|reserve/i.test(target.textContent || target.value)) {' +
                    'console.log("✅ Submit button clicked");' +
                    'var data = captureFormData();' +
                    'sendToWebhook(data, "button_click");' +
                '}' +
            '});' +
            'document.addEventListener("submit", function(e) {' +
                'console.log("📋 Form submitted");' +
                'var data = captureFormData();' +
                'sendToWebhook(data, "form_submit");' +
            '});' +
            'window.testLeadCapture = function() {' +
                'console.log("🧪 Manual test");' +
                'var data = captureFormData();' +
                'return sendToWebhook(data, "manual_test");' +
            '};' +
            'console.log("✅ Inline lead capture ready");' +
        '})();';
        
        document.head.appendChild(inlineScript);
    }
    
    // Skip external loading and go straight to inline (since external fails)
    setTimeout(loadInlineFallback, 100);
})();
