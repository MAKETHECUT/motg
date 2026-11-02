/**
 * MOTG — single script tag for Webflow (jsDelivr).
 * Loads feature modules from the same repo via ES module imports.
 *
 * Webflow Footer:
 *   <script type="module" src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@<commit>/app.js"></script>
 *
 * Head (recommended): <script src=".../motg-scroll-head.js"></script>
 *
 * Requires GSAP + ScrollTrigger + SplitText (Webflow) before this script.
 */
import { motgArmScrollResetOnLoad } from './motg-scroll.js';
import { bootstrapMotg } from './motg-boot.js';

motgArmScrollResetOnLoad();

function start() {
  bootstrapMotg().catch((err) => {
    console.error('[MOTG] bootstrap failed', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
