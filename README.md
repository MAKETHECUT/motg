# MOTG — custom scripts & styles

Hosted via [jsDelivr](https://www.jsdelivr.com/) from this repo.

**Webflow Footer**
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@main/app.js"></script>
```

**Webflow Head (recommended)**
```html
<script src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@main/motg-scroll-head.js"></script>
<script src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@main/motg-vimeo-head.js"></script>
```

Upload `motg.css` to the site (or host from your CDN) and link it in the embed block.

Load GSAP, ScrollTrigger, and SplitText before `app.js`.
