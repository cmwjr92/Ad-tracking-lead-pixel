// loader.js - Robust webhook detection
(function(){
    'use strict';
    if (window._leadCaptureLoaded) return;
    window._leadCaptureLoaded = true;
    console.log('🚀 Lead capture starting...');
    
    // Method 1: Find any script tag with data-webhook
    var WEBHOOK_URL = null;
    var scripts = document.querySelectorAll('script[data-webhook]');
    
    if (scripts.length > 0) {
        WEBHOOK_URL = scripts[scripts.length - 1].getAttribute('data-webhook');
        console.log('✅ Method 1: Found webhook via querySelector:', WEBHOOK_URL);
    }
    
    // Method 2: Check all script tags for our CDN URL
    if (!WEBHOOK_URL) {
        var allScripts = document.getElementsByTagName('script');
        for (var i = 0; i < allScripts.length; i++) {
            var script = allScripts[i];
            if (script.src && (
                script.src.includes('Ad-tracking-lead-pixel') || 
                script.src.includes('loader.js')
            )) {
                var webhook = script.getAttribute('data-webhook');
                if (webhook) {
                    WEBHOOK_URL = webhook;
                    console.log('✅ Method 2: Found webhook on loader script:', WEBHOOK_URL);
                    break;
                }
            }
        }
    }
    
    // Method 3: Try document.currentScript (works for inline scripts)
    if (!WEBHOOK_URL && document.currentScript) {
        var webhook = document.currentScript.getAttribute('data-webhook');
        if (webhook) {
            WEBHOOK_URL = webhook;
            console.log('✅ Method 3: Found webhook via currentScript:', WEBHOOK_URL);
        }
    }
    
    // Method 4: Look for the most recently added script
    if (!WEBHOOK_URL) {
        // Wait a tick for DOM to update
        setTimeout(function() {
            var scripts = document.querySelectorAll('script[data-webhook]');
            if (scripts.length > 0) {
                WEBHOOK_URL = scripts[scripts.length - 1].getAttribute('data-webhook');
                console.log('✅ Method 4: Found webhook after delay:', WEBHOOK_URL);
                initializeLeadCapture(WEBHOOK_URL);
            } else {
                console.error('❌ Lead Capture: data-webhook attribute required');
                console.error('Please add data-webhook="YOUR_WEBHOOK_URL" to your script tag');
            }
        }, 10);
        return; // Exit and wait for timeout
    }
    
    if (!WEBHOOK_URL) {
        console.error('❌ Lead Capture: data-webhook attribute required');
        console.error('Please add data-webhook="YOUR_WEBHOOK_URL" to your script tag');
        console.log('Debug: All scripts:', document.getElementsByTagName('script'));
        return;
    }
    
    // Initialize immediately if we found the webhook
    initializeLeadCapture(WEBHOOK_URL);
    
    function initializeLeadCapture(webhookUrl) {
        console.log('🎯 Lead capture initialized with webhook:', webhookUrl);
        
        var processed = [];
        
        function capture() {
            console.log('📋 Capturing form data...');
            var data = {};
            var inputs = document.querySelectorAll('input, select, textarea');
            console.log('🔍 Found inputs:', inputs.length);
            
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                
                if (input.value && input.value.trim() && !input.disabled && input.type !== 'submit' && input.type !== 'button') {
                    var key = input.name || input.id || input.type || 'field_' + i;
                    
                    // Handle checkboxes and radios
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        if (input.checked) {
                            data[key] = input.value || 'checked';
                        }
                    } else {
                        data[key] = input.value;
                    }
                    
                    console.log('✅ Captured:', key, '=', data[key]);
                }
            }
            
            // Add URL parameters for tracking
            var urlParams = new URLSearchParams(window.location.search);
            var tracking = {};
            
            // Comprehensive tracking parameters
            var trackingParams = [
                'gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'msclkid', 'ttclid', 'li_fat_id', 'twclid', 'gbraid', 'wbraid', 'ScCid', 'epik'
            ];
            
            for (var i = 0; i < trackingParams.length; i++) {
                var value = urlParams.get(trackingParams[i]);
                if (value) tracking[trackingParams[i]] = value;
            }
            
            if (Object.keys(tracking).length > 0) {
                data._tracking = tracking;
                console.log('📊 Added tracking params:', tracking);
            }
            
            data._meta = { 
                url: location.href, 
                time: Date.now(),
                referrer: document.referrer || 'direct'
            };
            
            console.log('📦 Final captured data:', data);
            return data;
        }
        
        function send(data, context) {
            console.log('📡 Preparing to send to webhook...', context);
            
            // Check if we have actual form data (not just metadata)
            var hasFormData = false;
            for (var key in data) {
                if (data.hasOwnProperty(key) && key !== '_meta' && key !== '_tracking') {
                    hasFormData = true;
                    break;
                }
            }
            
            if (!hasFormData) {
                console.log('⚠️ No form data to send (only metadata)');
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
            
            // Remove old entries after 5 seconds
            setTimeout(function() {
                var index = processed.indexOf(id);
                if (index > -1) processed.splice(index, 1);
            }, 5000);
            
            var payload = {
                d: data,
                u: location.href,
                t: Date.now(),
                context: context
            };
            
            console.log('🚀 Sending payload:', payload);
            console.log('📡 Webhook URL:', webhookUrl);
            
            try {
                if (navigator.sendBeacon) {
                    var result = navigator.sendBeacon(webhookUrl, JSON.stringify(payload));
                    console.log(result ? '✅ Sent via beacon successfully' : '❌ Beacon failed');
                    if (!result) {
                        // Fallback to fetch if beacon fails
                        sendViaFetch(payload);
                    }
                    return result;
                } else {
                    // Use fetch for older browsers
                    sendViaFetch(payload);
                    return true;
                }
            } catch (error) {
                console.error('❌ Send error:', error);
                return false;
            }
        }
        
        function sendViaFetch(payload) {
            console.log('📡 Using fetch fallback...');
            fetch(webhookUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
                mode: 'no-cors' // Avoid CORS issues
            }).then(function() {
                console.log('✅ Sent via fetch');
            }).catch(function(error) {
                console.error('❌ Fetch error:', error);
            });
        }
        
        // Handle button clicks
        document.addEventListener('click', function(e) {
            var target = e.target;
            
            // Check if it's a submit button
            var isSubmit = false;
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
                var type = target.type || '';
                var text = (target.textContent || target.value || '').toLowerCase();
                
                isSubmit = (
                    type === 'submit' ||
                    (target.tagName === 'BUTTON' && !type) || // Default button type is submit
                    /submit|send|join|sign|register|subscribe|reserve|continue|next|complete/.test(text)
                );
            }
            
            if (isSubmit) {
                console.log('✅ Submit button clicked:', target.textContent || target.value);
                
                // Small delay to allow form values to update
                setTimeout(function() {
                    var data = capture();
                    send(data, 'button_click');
                }, 100);
            }
        });
        
        // Handle form submissions
        document.addEventListener('submit', function(e) {
            console.log('📋 Form submission detected');
            var data = capture();
            send(data, 'form_submit');
        }, true); // Use capture phase to run before other handlers
        
        // Manual test function
        window.testLeadCapture = function() {
            console.log('🧪 Manual test triggered');
            var data = capture();
            data.test_field = 'Manual test at ' + new Date().toISOString();
            return send(data, 'manual_test');
        };
        
        console.log('✅ Lead capture ready!');
        console.log('💡 Test with: testLeadCapture()');
    }
})();
