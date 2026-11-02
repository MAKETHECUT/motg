import { getMotgPageContext } from './motg-page.js';
import {
  setupLinkClicksEventHandlers,
  setupMegaMenuEventListeners,
  initInteractiveCursor,
  initNavbarShowHide,
  sliderInfinity,
} from './motg-core.js';
import {
  initScrollRestoration,
  initCustomSmoothScrolling,
  initScrollDelay,
} from './motg-scroll.js';

function waitForGsap(maxMs = 8000) {
  return new Promise((resolve) => {
    if (typeof gsap !== 'undefined') {
      resolve(true);
      return;
    }
    const start = Date.now();
    const tick = () => {
      if (typeof gsap !== 'undefined') {
        resolve(true);
        return;
      }
      if (Date.now() - start >= maxMs) {
        console.error('GSAP not loaded. Cannot initialize MOTG scripts.');
        resolve(false);
        return;
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

export async function bootstrapMotg() {
  initScrollRestoration();

  const ctx = getMotgPageContext();
  const gsapReady = await waitForGsap();
  if (!gsapReady) return;

  initScrollDelay();

  let motion = null;
  let videos = null;
  if (ctx.needsMotion) motion = await import('./motg-motion.js');
  if (ctx.needsVimeo) videos = await import('./motg-videos.js');

  if (motion) {
    motion.registerGsapPlugins();
    motion.initGsapAnimations();
    motion.setupSplitTextEventListeners();
    motion.initSplitTextAnimations();
    motion.refreshbreakingpoints();
    motion.initShowreelToggle();
    motion.extraTabs();
    motion.tabsAccordion();
    motion.initGridOverlayToggle();
    motion.initImageParallax();
    motion.initInfinityGallery();
    motion.initSvgAnimations();
    motion.initImageTrail();
  }

  setupLinkClicksEventHandlers();
  initNavbarShowHide();
  setupMegaMenuEventListeners();
  initScrollRestoration();
  initCustomSmoothScrolling();
  initScrollRestoration();
  requestAnimationFrame(() => initScrollRestoration());

  if (videos) {
    videos.initMotgVimeoBootstrap();
    videos.initVideoScrollPassSystem();
  }

  initInteractiveCursor();
  sliderInfinity();

  window.__motgPageContext = ctx;
}
