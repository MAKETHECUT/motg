#!/usr/bin/env node
/**
 * Splits app.monolith.js into ES modules (run after editing monolith).
 * Usage: node scripts/build-modules.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'app.monolith.js'), 'utf8');
const lines = src.split('\n');

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const motgVideos = `${slice(3, 629)}
export function initMotgVimeoBootstrap() {
  if (document.body) motgVimeoEarlyGate();
  else document.addEventListener('DOMContentLoaded', motgVimeoEarlyGate, { once: true });
  MotgVimeoLazy.init();
}

${slice(636, 841)}
export {
  MotgVimeoLazy,
  motgVimeoEarlyGate,
  motgVimeoShouldSkip,
  initVideoScrollPassSystem,
  initVimeoVideos,
  ensureVideoScrollFrames,
};
`;

const motgScroll = `${slice(29, 34)}

${slice(3321, 3622)}

${slice(3884, 3910)}
}

export { initScrollRestoration, initCustomSmoothScrolling, initScrollDelay };
`;

const motgMotion = `${slice(15, 20)}

${slice(857, 965)}

${slice(970, 1289)}

${slice(1295, 1436)}

${slice(1442, 2177)}

${slice(2183, 2203)}

${slice(2221, 2403)}

${slice(2473, 2648)}

${slice(2769, 2891)}
export {
  refreshbreakingpoints,
  initSplitTextAnimations,
  initializeAfterTransition,
  setupSplitTextEventListeners,
  initShowreelToggle,
  initInfinityGallery,
  extraTabs,
  tabsAccordion,
  initSvgAnimations,
  initGridOverlayToggle,
  initImageTrail,
  initImageParallax,
  initGsapAnimations,
};
`;

// registerGsapPlugins alias for lines 15-20
const motgMotionFixed = motgMotion.replace(
  /^\/\/ Register GSAP plugins[\s\S]*?^}\n\n/m,
  `export function registerGsapPlugins() {
  if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(SplitText, ScrollTrigger);
  } else {
    console.error('GSAP plugins not loaded. Make sure GSAP, ScrollTrigger, and SplitText are loaded before app.js');
  }
}

`
);

const motgCore = `${slice(2591, 2762)}

${slice(2899, 3375)}

${slice(3628, 3801)}

${slice(3807, 3878)}

${slice(3921, 4169).replace(/\n    sliderInfinity\(\);\s*\n(?=\/\/ =+)/, '\n')}

export {
  setupLinkClicksEventHandlers,
  pageTransition,
  resetAndReinitialize,
  handlePopState,
  initMegaMenu,
  setupMegaMenuEventListeners,
  initLogosLoop,
  initInteractiveCursor,
  initNavbarShowHide,
  sliderInfinity,
};
`;

fs.writeFileSync(path.join(root, 'motg-videos.js'), motgVideos);
fs.writeFileSync(path.join(root, 'motg-scroll.js'), motgScroll);
fs.writeFileSync(path.join(root, 'motg-motion.js'), motgMotionFixed);
fs.writeFileSync(path.join(root, 'motg-core.js'), motgCore);

console.log('Wrote motg-videos.js, motg-scroll.js, motg-motion.js, motg-core.js');
