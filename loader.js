// loader.js - Client-facing script (create this new file in your repo)
(function(){
    var webhook = document.currentScript.getAttribute('data-webhook');
    if (!webhook) {
        console.error('Lead Capture: data-webhook attribute required');
        return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/universal.min.js';
    s.setAttribute('data-webhook', webhook);
    document.head.appendChild(s);
})();
