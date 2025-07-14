// loader.js - Fixed version
(function(){
    // Find the script tag that loaded this file
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var webhook = currentScript.getAttribute('data-webhook');
    
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    
    console.log('Loading lead capture with webhook:', webhook);
    
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/universal.min.js';
    s.setAttribute('data-webhook', webhook);
    s.onload = function() {
        console.log('Lead capture script loaded successfully');
    };
    s.onerror = function() {
        console.error('Failed to load lead capture script');
    };
    document.head.appendChild(s);
})();
