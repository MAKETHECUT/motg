/**
 * Run synchronously in <head> (before paint) so refresh always starts at top.
 * Webflow: Project Settings → Custom Code → Head, before other MOTG scripts.
 */
(function motgScrollHead() {
  if (window.__motgScrollHead) return;
  window.__motgScrollHead = true;
  window.__motgScrollForceTop = true;

  try {
    window.history.scrollRestoration = 'manual';
  } catch (_) {}

  function scrollToTopHard() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    var sm = window.customSmoothScroll;
    if (sm) {
      sm.targetScroll = 0;
      sm.currentScroll = 0;
    }
  }

  scrollToTopHard();

  window.addEventListener('pageshow', function () {
    scrollToTopHard();
  });

  document.addEventListener('DOMContentLoaded', scrollToTopHard, { once: true });
  window.addEventListener('load', function () {
    scrollToTopHard();
    window.__motgScrollForceTop = false;
  }, { once: true });
})();
