(function(){
var s=document.currentScript;if(!s){var scripts=document.querySelectorAll('script[data-webhook]');s=scripts[scripts.length-1];}
var w=s?s.dataset.webhook:null;if(!w)return;

function getAdData(){
  var u=new URLSearchParams(location.search);var d={};
  
  // Google Ads (all variations)
  ['gclid','gclsrc','gbraid','wbraid','msclkid','dclid'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Facebook/Meta (all variations)  
  ['fbclid','fbadid','fb_action_ids','fb_action_types','fb_source'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // UTM Parameters (all)
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // TikTok Ads
  ['ttclid','tt_medium','tt_content'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Snapchat Ads
  ['ScCid','snapchat_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Pinterest Ads
  ['epik','pinterest_ct'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // LinkedIn Ads
  ['li_fat_id','linkedin_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Twitter Ads
  ['twclid','twitter_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // YouTube Ads
  ['yclid','youtube_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Amazon Ads
  ['amzn_click_id','amazon_ad_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Microsoft/Bing Ads
  ['msclkid','ms_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Apple Search Ads
  ['asa_click_id','apple_ad_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Taboola
  ['tblci','taboola_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Outbrain
  ['obOrigUrl','ob_click_id'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Affiliate/General tracking
  ['affiliate_id','aff_id','ref','referrer','source','campaign','ad_id','creative_id','keyword','placement','position','network','device','audience'].forEach(function(k){if(u.get(k))d[k]=u.get(k);});
  
  // Custom tracking (common patterns)
  u.forEach(function(v,k){
    if(k.includes('click')||k.includes('track')||k.includes('campaign')||k.includes('source')||k.includes('medium')){
      if(!d[k])d[k]=v;
    }
  });
  
  return d;
}

function c(){
  var i=document.querySelectorAll('input[type="email"],input[name*="email"],input[type="text"],input[name*="name"],input[name*="phone"]');
  var d={};
  i.forEach(function(x){if(x.value&&x.value.trim())d[x.name||x.id||x.placeholder||'field']=(x.value.trim());});
  
  if(Object.keys(d).length>0){
    var payload={
      type:'lead',
      form_data:d,
      ad_data:getAdData(),
      page_url:location.href,
      page_title:document.title,
      referrer:document.referrer,
      user_agent:navigator.userAgent,
      timestamp:Date.now()
    };
    navigator.sendBeacon(w,JSON.stringify(payload));
    return true;
  }
  return false;
}

function a(){
  var b=document.querySelectorAll('button,input[type="submit"],[role="button"],form');
  b.forEach(function(x){
    if(!x.dataset.pixelAttached){
      x.addEventListener('click',function(){setTimeout(c,100);});
      x.addEventListener('submit',function(){setTimeout(c,100);});
      x.dataset.pixelAttached='true';
    }
  });
}

function w(){
  var e=document.querySelectorAll('input[type="email"],input[name*="email"]');
  e.forEach(function(x){
    if(!x.dataset.pixelAttached){
      x.addEventListener('blur',function(){if(x.value&&x.value.includes('@'))setTimeout(c,500);});
      x.dataset.pixelAttached='true';
    }
  });
}

function init(){
  a();w();
  if(typeof MutationObserver!=='undefined'){
    var o=new MutationObserver(function(m){
      m.forEach(function(mu){
        mu.addedNodes.forEach(function(n){
          if(n.nodeType===1){
            if(n.tagName==='FORM'||n.tagName==='BUTTON')a();
            if(n.querySelectorAll){
              var f=n.querySelectorAll('form,button');
              if(f.length>0)a();
            }
          }
        });
      });
    });
    o.observe(document.body,{childList:true,subtree:true});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.manualCapture=c;
window.getAdTracking=getAdData;
})();
