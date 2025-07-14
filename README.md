# Ad Tracking Lead Pixel

Universal lead capture with comprehensive ad tracking for any website.

## 🚀 Quick Start

Add this **ONE line** to your website header:

```html
<script src="https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/loader.js" 
        data-webhook="YOUR_WEBHOOK_URL"></script>
```

## ✨ What it captures

- ✅ **All form data** (email, name, phone, etc.)
- ✅ **Google Ads** tracking (gclid, gclsrc, gbraid, wbraid)
- ✅ **Facebook** tracking (fbclid, fbadid)
- ✅ **UTM parameters** (utm_source, utm_medium, utm_campaign)
- ✅ **20+ ad platforms** (TikTok, Snapchat, Pinterest, LinkedIn, etc.)
- ✅ **Page metadata** (URL, timestamp, referrer)

## 🎯 Works with

- ✅ GoHighLevel
- ✅ WordPress  
- ✅ Shopify
- ✅ ClickFunnels
- ✅ Any website with forms

## 📝 Example Usage

### Basic Setup
```html
<script src="https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/loader.js" 
        data-webhook="https://n8n.domain.com/webhook/abc123"></script>
```

### Multi-Tenant (Different clients)
```html
<!-- Client A -->
<script src="https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/loader.js" 
        data-webhook="https://n8n.domain.com/webhook/client-a"></script>

<!-- Client B -->
<script src="https://cdn.jsdelivr.net/gh/cmwjr92/Ad-tracking-lead-pixel@main/loader.js" 
        data-webhook="https://n8n.domain.com/webhook/client-b"></script>
```

## 📊 Data Structure

Your webhook receives this JSON:

```json
{
  "d": {
    "email": "user@example.com",
    "first_name": "John",
    "_tracking": {
      "gclid": "abc123",
      "utm_source": "google",
      "utm_campaign": "summer_sale"
    },
    "_meta": {
      "page_url": "https://example.com/landing",
      "timestamp": 1234567890
    }
  },
  "u": "https://example.com/landing",
  "t": 1234567890,
  "context": "form_submit"
}
```

## 🛡️ Features

- **Zero Setup** - No configuration needed
- **Duplicate Prevention** - Smart deduplication prevents multiple submissions  
- **Cross-Platform** - Works with any form implementation
- **Ad Attribution** - Complete tracking parameter capture
- **Lightweight** - Under 5KB total
- **Reliable** - Uses sendBeacon for guaranteed delivery

## 🔧 Testing

After installation, open browser console and run:
```javascript
testLeadCapture()
```

This will manually trigger the capture system for testing.

## 📞 Support

- Report issues: [GitHub Issues](https://github.com/cmwjr92/Ad-tracking-lead-pixel/issues)
- Questions? Open an issue or contact support

---

**That's it!** No complex setup, no API keys, no configuration files. Just one line of code and you're tracking leads with full ad attribution.
