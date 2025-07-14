// loader.js - Bulletproof version for all browsers
(function(){
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var webhook = currentScript.getAttribute('data-webhook');
    
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('Loading lead capture with webhook:', webhook);
    
    // Create script with old-school string concatenation (works everywhere)
    var script = document.createElement('script');
    var scriptContent = '';
    
    scriptContent += '(function() {';
    scriptContent += 'console.log("🚀 Lead capture starting...");';
    scriptContent += 'var WEBHOOK_URL = "' + webhook + '";';
    scriptContent += 'var processed = [];';
    scriptContent += 'function capture() {';
    scriptContent += 'console.log("📋 Capturing...");';
    scriptContent += 'var data = {};';
    scriptContent += 'var inputs = document.querySelectorAll("input, select, textarea");';
    scriptContent += 'console.log("Found inputs:", inputs.length);';
    scriptContent += 'for (var i = 0; i < inputs.length; i++) {';
    scriptContent += 'var input = inputs[i];';
    scriptContent += 'console.log("Input " + i + ":", input.name, input.value, input.type);';
    scriptContent += 'if (input.value && input.value.trim() && !input.disabled && input.type !== "submit" && input.type !== "button") {';
    scriptContent += 'var key = input.name || input.id || input.type || "field";';
    scriptContent += 'data[key] = input.value;';
    scriptContent += 'console.log("✅ Captured:", key, input.value);';
    scriptContent += '}';
    scriptContent += '}';
    scriptContent += 'data._meta = { url: location.href, time: Date.now() };';
    scriptContent += 'console.log("📦 Data:", data);';
    scriptContent += 'return data;';
    scriptContent += '}';
    scriptContent += 'function send(data, ctx) {';
    scriptContent += 'console.log("📡 Sending...", ctx);';
    scriptContent += 'var keys = Object.keys(data);';
    scriptContent += 'var hasData = false;';
    scriptContent += 'for (var i = 0; i < keys.length; i++) {';
    scriptContent += 'if (keys[i] !== "_meta") hasData = true;';
    scriptContent += '}';
    scriptContent += 'if (!hasData) {';
    scriptContent += 'console.log("❌ No data");';
    scriptContent += 'return false;';
    scriptContent += '}';
    scriptContent += 'var id = JSON.stringify(data) + location.href;';
    scriptContent += 'for (var i = 0; i < processed.length; i++) {';
    scriptContent += 'if (processed[i] === id) {';
    scriptContent += 'console.log("🚫 Duplicate");';
    scriptContent += 'return false;';
    scriptContent += '}';
    scriptContent += '}';
    scriptContent += 'processed.push(id);';
    scriptContent += 'var payload = { d: data, u: location.href, t: Date.now(), context: ctx };';
    scriptContent += 'console.log("🚀 Payload:", payload);';
    scriptContent += 'if (navigator.sendBeacon) {';
    scriptContent += 'var result = navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(payload));';
    scriptContent += 'console.log("✅ Sent:", result);';
    scriptContent += 'return result;';
    scriptContent += '} else {';
    scriptContent += 'var xhr = new XMLHttpRequest();';
    scriptContent += 'xhr.open("POST", WEBHOOK_URL, true);';
    scriptContent += 'xhr.setRequestHeader("Content-Type", "application/json");';
    scriptContent += 'xhr.onload = function() { console.log("✅ Response:", xhr.status); };';
    scriptContent += 'xhr.onerror = function() { console.log("❌ Error"); };';
    scriptContent += 'xhr.send(JSON.stringify(payload));';
    scriptContent += 'return true;';
    scriptContent += '}';
    scriptContent += '}';
    scriptContent += 'document.addEventListener("click", function(e) {';
    scriptContent += 'console.log("🖱️ Click:", e.target.tagName, e.target.textContent);';
    scriptContent += 'var text = e.target.textContent || e.target.value || "";';
    scriptContent += 'if (e.target.tagName === "BUTTON" && /submit|send|join|sign|register|subscribe|reserve/i.test(text)) {';
    scriptContent += 'console.log("✅ Submit button");';
    scriptContent += 'var data = capture();';
    scriptContent += 'send(data, "click");';
    scriptContent += '}';
    scriptContent += '});';
    scriptContent += 'document.addEventListener("submit", function(e) {';
    scriptContent += 'console.log("📋 Submit");';
    scriptContent += 'var data = capture();';
    scriptContent += 'send(data, "submit");';
    scriptContent += '});';
    scriptContent += 'window.testLeadCapture = function() {';
    scriptContent += 'console.log("🧪 Test");';
    scriptContent += 'var data = capture();';
    scriptContent += 'return send(data, "test");';
    scriptContent += '};';
    scriptContent += 'console.log("✅ Ready");';
    scriptContent += '})();';
    
    script.innerHTML = scriptContent;
    document.head.appendChild(script);
    console.log('🚀 Inline script added');
})();
