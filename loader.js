// loader.js - Fixed to use raw GitHub URL
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
    // Use raw GitHub URL instead of CDN (which is cached)
    s.src = 'https://raw.githubusercontent.com/cmwjr92/Ad-tracking-lead-pixel/main/universal.min.js';
    s.setAttribute('data-webhook', webhook);
    s.onload = function() {
        console.log('Lead capture script loaded successfully');
    };
    s.onerror = function() {
        console.error('Failed to load lead capture script');
    };
    document.head.appendChild(s);
})();
