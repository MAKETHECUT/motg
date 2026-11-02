(function motgVimeoHeadStart() {
  if (document.querySelector('link[data-motg-vimeo-preconnect]')) return;
  ['https://player.vimeo.com', 'https://i.vimeocdn.com', 'https://f.vimeocdn.com'].forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.setAttribute('data-motg-vimeo-preconnect', '1');
    document.head.appendChild(link);
  });
})();

// Register GSAP plugins only if they're available
if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(SplitText, ScrollTrigger);
} else {
  console.error('GSAP plugins not loaded. Make sure GSAP, ScrollTrigger, and SplitText are loaded before app.js');
}




// ============================================================
// INITIAL SCROLL SETUP
// ============================================================

function initScrollRestoration() {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}





// ============================================================
// VIMEO — auto thumbnail + capped lazy iframes (app.js only)
// ============================================================

function motgVimeoParseVideoId(url) {
  if (!url?.includes('player.vimeo.com')) return null;
  return url.match(/\/video\/(\d+)/)?.[1] || null;
}

function motgVimeoOembedPageUrl(embedUrl) {
  const id = motgVimeoParseVideoId(embedUrl);
  if (!id) return null;
  const h = embedUrl.match(/[?&]h=([a-f0-9]+)/i)?.[1];
  return h ? `https://vimeo.com/${id}/${h}` : `https://vimeo.com/${id}`;
}

function motgVimeoGetUrl(iframe) {
  const live = iframe.getAttribute('src') || '';
  if (live.includes('player.vimeo.com')) return live;
  return iframe.getAttribute('data-vimeo-src') || '';
}

function motgVimeoShouldSkip(iframe) {
  if (!iframe || iframe.id === 'showreel-video') return true;
  if (iframe.closest('.hero .video-visual, .vimeo-wrapper, #showreel-video')) return true;
  return !motgVimeoGetUrl(iframe).includes('player.vimeo.com');
}

function motgVimeoObserveTarget(iframe) {
  return (
    iframe.closest('.image-wrapper, .work-thumbnail, .video-wrapper, .video-scroll-frame') ||
    iframe.parentElement ||
    iframe
  );
}

function motgVimeoDistanceScore(iframe) {
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  if (rect.bottom < 0) return 500000 + Math.abs(rect.bottom);
  if (rect.top > vh) return 500000 + rect.top - vh;
  return Math.abs(rect.top + rect.height * 0.5 - vh * 0.5);
}

function motgVimeoInViewport(iframe) {
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  return rect.bottom > 0 && rect.top < vh;
}

const MOTG_VIMEO_PREFETCH_AHEAD_VH = 2.55;
const MOTG_VIMEO_PREFETCH_BEHIND_VH = 1.05;

function motgVimeoInLoadRange(iframe) {
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  return (
    rect.bottom > -vh * MOTG_VIMEO_PREFETCH_BEHIND_VH &&
    rect.top < vh * (1 + MOTG_VIMEO_PREFETCH_AHEAD_VH)
  );
}

function motgVimeoInWarmZone(iframe) {
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  return rect.top >= -vh * 0.15 && rect.top < vh * (1 + MOTG_VIMEO_PREFETCH_AHEAD_VH);
}

function motgVimeoIsKeepMountedZone(iframe) {
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  return rect.bottom > -vh * 1.5 && rect.top < vh * (2 + MOTG_VIMEO_PREFETCH_AHEAD_VH);
}

function motgVimeoShouldRelease(iframe) {
  if (motgVimeoIsKeepMountedZone(iframe)) return false;
  const vh = window.innerHeight || 800;
  const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
  return rect.top > vh * (2.5 + MOTG_VIMEO_PREFETCH_AHEAD_VH);
}

function motgVimeoUseFacade(iframe) {
  if (motgVimeoShouldSkip(iframe)) return false;
  if (iframe.closest('.hero, .project-cover, .video-visual, .vimeo-wrapper, .page-overlay-video')) {
    return false;
  }
  return !!iframe.closest(
    '.image-wrapper, .work-thumbnail, .home-featured, .featured-projects, .enter-work, .link-saver'
  );
}

function motgVimeoHasRealPoster(wrapper) {
  const img = wrapper.querySelector('img.work-img, img.motg-vimeo-poster');
  if (!img || img.closest('.logo, .header, .footer')) return false;
  if (img.classList.contains('w-condition-invisible') || img.classList.contains('w-dyn-bind-empty')) {
    return false;
  }
  const src = img.getAttribute('src') || '';
  if (!src.trim()) return false;
  if (/uy0daa7gcucdvyr2vdvd/i.test(src)) return false;
  return true;
}

function motgVimeoEnsureAutoThumbnail(iframe, embedUrl) {
  if (!embedUrl?.includes('player.vimeo.com') || !motgVimeoUseFacade(iframe)) return;
  const wrapper = motgVimeoObserveTarget(iframe);
  if (motgVimeoHasRealPoster(wrapper)) return;

  const id = motgVimeoParseVideoId(embedUrl);
  if (!id) return;

  let thumb = wrapper.querySelector('img.motg-vimeo-auto-thumb');
  if (!thumb) {
    thumb = document.createElement('img');
    thumb.className = 'motg-vimeo-auto-thumb motg-vimeo-poster';
    thumb.alt = '';
    thumb.decoding = 'async';
    thumb.setAttribute('fetchpriority', 'high');
    wrapper.insertBefore(thumb, wrapper.firstChild);
  }

  if (thumb.dataset.motgThumbFor === embedUrl) return;
  thumb.dataset.motgThumbFor = embedUrl;
  thumb.src = `https://vumbnail.com/${id}.jpg`;
  thumb.onerror = () => {
    const page = motgVimeoOembedPageUrl(embedUrl);
    if (!page || thumb.dataset.motgOembedTried === '1') return;
    thumb.dataset.motgOembedTried = '1';
    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(page)}&width=960`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.thumbnail_url) thumb.src = data.thumbnail_url;
      })
      .catch(() => {});
  };
}

function motgVimeoEarlyGate() {
  const vh = window.innerHeight || 800;
  document.querySelectorAll('iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]').forEach((iframe) => {
    if (iframe.id === 'showreel-video') return;
    if (iframe.closest('.hero .video-visual, .vimeo-wrapper, #showreel-video')) return;

    const embedUrl = motgVimeoGetUrl(iframe);
    if (!embedUrl.includes('player.vimeo.com')) return;

    const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
    const inImmediateBand = rect.bottom > 0 && rect.top < vh * 2.1;
    motgVimeoEnsureAutoThumbnail(iframe, embedUrl);

    if (iframe.getAttribute('src')?.includes('player.vimeo.com')) {
      iframe.setAttribute('data-vimeo-src', embedUrl);
      if (!inImmediateBand) iframe.removeAttribute('src');
    } else if (!iframe.getAttribute('data-vimeo-src')) {
      iframe.setAttribute('data-vimeo-src', embedUrl);
    }
  });
}

function injectVimeoFacadeStyles() {
  /* All facade / home-featured / more-work media rules live in motg.css */
}

function motgSyncComingSoonOverlayForWrapper(wrapper) {
  const linkSaver = wrapper.closest('.link-saver');
  if (!linkSaver?.closest('.home-featured, .more-work')) return;

  const clickDisable = linkSaver.querySelector(':scope > .click-disable');
  if (!clickDisable || clickDisable.classList.contains('w-condition-invisible')) return;

  const saverRect = linkSaver.getBoundingClientRect();
  const mediaRect = wrapper.getBoundingClientRect();
  clickDisable.style.position = 'absolute';
  clickDisable.style.left = `${mediaRect.left - saverRect.left}px`;
  clickDisable.style.top = `${mediaRect.top - saverRect.top}px`;
  clickDisable.style.width = `${mediaRect.width}px`;
  clickDisable.style.height = `${mediaRect.height}px`;
}

function motgSyncComingSoonOverlay(iframe) {
  motgSyncComingSoonOverlayForWrapper(motgVimeoObserveTarget(iframe));
}

function motgInitHomeFeaturedStaticThumbs() {
  document
    .querySelectorAll('.home-featured .featured-projects .image-wrapper, .more-work .featured-projects .image-wrapper')
    .forEach((wrapper) => {
    const iframe = wrapper.querySelector('iframe');
    if (iframe && !motgVimeoShouldSkip(iframe)) {
      motgSyncComingSoonOverlayForWrapper(wrapper);
      return;
    }

    if (!motgVimeoHasRealPoster(wrapper)) {
      motgSyncComingSoonOverlayForWrapper(wrapper);
      return;
    }

    if (wrapper.dataset.motgStaticThumb !== '1') {
      wrapper.dataset.motgStaticThumb = '1';
      wrapper.classList.add('motg-vimeo-facade');
      const poster = wrapper.querySelector('img.work-img, img.motg-vimeo-poster');
      if (poster) {
        poster.classList.add('motg-vimeo-poster');
        poster.style.visibility = 'visible';
      }
    }

    motgSyncComingSoonOverlayForWrapper(wrapper);
  });
}

function initVimeoPreconnect() {
  if (document.querySelector('link[data-motg-vimeo-preconnect]')) return;
  ['https://player.vimeo.com', 'https://i.vimeocdn.com'].forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.setAttribute('data-motg-vimeo-preconnect', '1');
    document.head.appendChild(link);
  });
}

function motgVimeoIsFacadePoster(img) {
  if (!img || img.closest('.logo, .header, .footer')) return false;
  if (img.classList.contains('w-condition-invisible') || img.classList.contains('w-dyn-bind-empty')) {
    return false;
  }
  return true;
}

const MOTG_VIMEO_EMBED_FADE_MS = 460;
const MOTG_VIMEO_FIRST_FRAME_MS = 380;

function motgVimeoHideFacadePosters(wrapper) {
  if (!wrapper || wrapper.dataset.motgStaticThumb === '1') return;
  wrapper.dataset.motgPosterHidden = '1';
  wrapper
    .querySelectorAll('.motg-vimeo-poster, .work-img, .motg-vimeo-auto-thumb')
    .forEach((img) => {
      if (!motgVimeoIsFacadePoster(img)) return;
      img.classList.add('motg-vimeo-poster--hidden');
      img.style.visibility = 'hidden';
      img.style.opacity = '0';
      img.style.display = 'none';
    });
}

function motgVimeoResetFacadePosters(wrapper) {
  if (!wrapper) return;
  delete wrapper.dataset.motgPosterHidden;
  delete wrapper.dataset.motgPosterHideScheduled;
  wrapper.classList.remove('motg-vimeo-facade--revealed');
  wrapper.querySelectorAll('.motg-vimeo-poster, .work-img, .motg-vimeo-auto-thumb').forEach((img) => {
    img.classList.remove('motg-vimeo-poster--hidden');
    img.style.visibility = '';
    img.style.opacity = '';
    img.style.display = '';
  });
}

function motgVimeoSchedulePosterHide(wrapper) {
  if (!wrapper || wrapper.dataset.motgStaticThumb === '1') return;
  if (wrapper.dataset.motgPosterHidden === '1') return;
  if (wrapper.dataset.motgPosterHideScheduled === '1') return;
  wrapper.dataset.motgPosterHideScheduled = '1';

  const beginPosterFade = () => {
    if (wrapper.dataset.motgPosterHidden === '1') return;
    wrapper.classList.add('motg-vimeo-facade--revealed');

    wrapper
      .querySelectorAll('.motg-vimeo-poster, .work-img, .motg-vimeo-auto-thumb')
      .forEach((img) => {
        if (!motgVimeoIsFacadePoster(img)) return;
        const finalizeHide = () => {
          motgVimeoHideFacadePosters(wrapper);
          delete wrapper.dataset.motgPosterHideScheduled;
        };
        img.addEventListener(
          'transitionend',
          (e) => {
            if (e.propertyName === 'opacity') finalizeHide();
          },
          { once: true }
        );
        setTimeout(finalizeHide, MOTG_VIMEO_EMBED_FADE_MS + 80);
      });
  };

  const embed = wrapper.querySelector('.w-embed, [class*="code-embed"]');
  let started = false;
  const kick = () => {
    if (started) return;
    started = true;
    setTimeout(beginPosterFade, MOTG_VIMEO_FIRST_FRAME_MS);
  };

  if (embed) {
    embed.addEventListener(
      'transitionend',
      (e) => {
        if (e.propertyName === 'opacity') kick();
      },
      { once: true }
    );
  }
  setTimeout(kick, MOTG_VIMEO_EMBED_FADE_MS + MOTG_VIMEO_FIRST_FRAME_MS + 120);
}

const MotgVimeoLazy = (() => {
  const MAX_LIVE_EMBEDS = 10;
  let ready = false;
  let observer = null;
  const tracked = new WeakSet();
  let lastScrollY = -1;
  let scrollDirection = 1;
  let scanScheduled = false;

  function prefetchRank(iframe) {
    let score = motgVimeoDistanceScore(iframe);
    const vh = window.innerHeight || 800;
    const rect = motgVimeoObserveTarget(iframe).getBoundingClientRect();
    if (scrollDirection >= 0 && rect.top > vh * 0.5) score -= vh * 2;
    if (scrollDirection < 0 && rect.bottom < vh * 0.5) score -= vh * 2;
    return score;
  }

  function captureVimeoSrc(iframe) {
    const src = iframe.getAttribute('src');
    if (src?.includes('player.vimeo.com')) {
      iframe.setAttribute('data-vimeo-src', src);
    }
  }

  function motgVimeoResetPosterVisibility(wrapper) {
    motgVimeoResetFacadePosters(wrapper);
  }

  function stashVimeoSrc(iframe) {
    if (motgVimeoIsKeepMountedZone(iframe)) return;
    const src = iframe.getAttribute('src');
    if (!src?.includes('player.vimeo.com')) return;
    iframe.setAttribute('data-vimeo-src', src);
    iframe.removeAttribute('src');
    const wrapper = iframe.closest('.motg-vimeo-facade');
    wrapper?.classList.remove('motg-vimeo-facade--ready', 'motg-vimeo-facade--revealed');
    motgVimeoResetPosterVisibility(wrapper);
  }

  function activateSrc(iframe) {
    const saved = iframe.getAttribute('data-vimeo-src');
    if (!saved?.includes('player.vimeo.com')) return false;
    if (iframe.getAttribute('src')?.includes('player.vimeo.com')) return true;
    iframe.setAttribute('src', saved);
    return true;
  }

  function markFacadeReady(iframe) {
    const wrapper = iframe.closest('.motg-vimeo-facade');
    if (!wrapper || wrapper.dataset.motgStaticThumb === '1') return;

    iframe.dataset.motgVimeoWasReady = '1';
    wrapper.classList.add('motg-vimeo-facade--ready');

    if (wrapper.dataset.motgPosterHidden === '1') {
      motgVimeoHideFacadePosters(wrapper);
      return;
    }

    motgVimeoSchedulePosterHide(wrapper);
  }

  function crossfadeToVideo(iframe) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => markFacadeReady(iframe), 80);
      });
    });
  }

  function setupFacadeUI(iframe) {
    if (!motgVimeoUseFacade(iframe)) return;
    const wrapper = motgVimeoObserveTarget(iframe);
    if (wrapper.dataset.motgFacade !== '1') {
      wrapper.dataset.motgFacade = '1';
      wrapper.classList.add('motg-vimeo-facade');
    }

    if (motgVimeoHasRealPoster(wrapper)) {
      const poster = wrapper.querySelector('img.work-img, img.motg-vimeo-poster');
      if (poster) {
        poster.classList.remove('w-condition-invisible');
        poster.classList.add('motg-vimeo-poster');
        if (wrapper.dataset.motgPosterHidden === '1') {
          motgVimeoHideFacadePosters(wrapper);
        } else {
          poster.classList.remove('motg-vimeo-poster--hidden');
          poster.style.visibility = 'visible';
          poster.style.display = '';
          poster.style.opacity = '';
        }
      }
    }

    motgVimeoEnsureAutoThumbnail(iframe, motgVimeoGetUrl(iframe));
  }

  function bindLoadHandler(iframe) {
    if (iframe.dataset.motgVimeoLoadBound === '1') return;
    iframe.dataset.motgVimeoLoadBound = '1';
    const reveal = () => {
      crossfadeToVideo(iframe);
      scheduleScan();
    };
    iframe.addEventListener('load', reveal, { once: true });
    if (iframe.dataset.motgVimeoRevealFallback !== '1') {
      iframe.dataset.motgVimeoRevealFallback = '1';
      setTimeout(() => {
        if (iframe.dataset.motgVimeoWasReady !== '1' && iframe.getAttribute('src')?.includes('player.vimeo.com')) {
          reveal();
        }
      }, 2200);
    }
  }

  function countLiveSrc(managed) {
    return managed.filter((iframe) => iframe.getAttribute('src')?.includes('player.vimeo.com')).length;
  }

  function mountEmbed(iframe, { priority = false } = {}) {
    captureVimeoSrc(iframe);
    const hadSrc = iframe.getAttribute('src')?.includes('player.vimeo.com');
    if (!activateSrc(iframe)) return;
    const wrapper = iframe.closest('.motg-vimeo-facade');
    if (!hadSrc) {
      wrapper?.classList.remove('motg-vimeo-facade--ready', 'motg-vimeo-facade--revealed');
      delete wrapper?.dataset.motgPosterHideScheduled;
    }
    bindLoadHandler(iframe);
    if (priority && iframe.dataset.motgVimeoWasReady !== '1') {
      iframe.setAttribute('fetchpriority', 'high');
    }
    if (iframe.dataset.motgVimeoWasReady === '1' && hadSrc) {
      crossfadeToVideo(iframe);
    }
  }

  function releaseEmbed(iframe) {
    stashVimeoSrc(iframe);
  }

  function collectManagedIframes() {
    return Array.from(
      document.querySelectorAll('iframe[data-vimeo-src], iframe[src*="player.vimeo.com"]')
    ).filter((iframe) => !motgVimeoShouldSkip(iframe));
  }

  function motgSyncAllComingSoonOverlays() {
    document
      .querySelectorAll(
        '.home-featured .featured-projects .image-wrapper, .more-work .featured-projects .image-wrapper'
      )
      .forEach(motgSyncComingSoonOverlayForWrapper);
  }

  function scan() {
    scanScheduled = false;
    motgInitHomeFeaturedStaticThumbs();
    motgSyncAllComingSoonOverlays();
    const managed = collectManagedIframes();
    managed.forEach((iframe) => {
      captureVimeoSrc(iframe);
      setupFacadeUI(iframe);
      motgSyncComingSoonOverlay(iframe);
    });

    const ranked = managed
      .filter((iframe) => motgVimeoInLoadRange(iframe))
      .sort((a, b) => prefetchRank(a) - prefetchRank(b));

    ranked.forEach((iframe) => {
      const hasSrc = iframe.getAttribute('src')?.includes('player.vimeo.com');
      if (hasSrc) {
        bindLoadHandler(iframe);
        if (iframe.dataset.motgVimeoWasReady === '1') crossfadeToVideo(iframe);
        return;
      }

      const inView = motgVimeoInViewport(iframe);
      const warm = motgVimeoInWarmZone(iframe);
      const wasReady = iframe.dataset.motgVimeoWasReady === '1';
      if (!inView && !warm && !wasReady && countLiveSrc(managed) >= MAX_LIVE_EMBEDS) return;

      mountEmbed(iframe, { priority: inView || warm });
    });

    managed.forEach((iframe) => {
      if (motgVimeoShouldRelease(iframe)) releaseEmbed(iframe);
    });
  }

  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    requestAnimationFrame(scan);
  }

  function watch(iframe) {
    if (tracked.has(iframe) || !observer) return;
    tracked.add(iframe);
    observer.observe(motgVimeoObserveTarget(iframe));
  }

  function bindObservers() {
    collectManagedIframes().forEach(watch);
  }

  function onIntersect() {
    scheduleScan();
  }

  function startScrollPoll() {
    let frame = 0;
    const tick = () => {
      frame++;
      const y = window.customSmoothScroll?.currentScroll ?? window.scrollY ?? 0;
      if (Math.abs(y - lastScrollY) > 1 || frame % 30 === 0) {
        if (y > lastScrollY + 0.5) scrollDirection = 1;
        else if (y < lastScrollY - 0.5) scrollDirection = -1;
        lastScrollY = y;
        scheduleScan();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function init() {
    initVimeoPreconnect();
    injectVimeoFacadeStyles();
    motgVimeoEarlyGate();
    if (!ready) {
      ready = true;
      observer = new IntersectionObserver(onIntersect, {
        root: null,
        rootMargin: '100% 0px 420% 0px',
        threshold: 0,
      });
      bindObservers();
      scan();
      startScrollPoll();
      window.addEventListener('load', scan, { once: true });
      window.addEventListener('resize', scheduleScan);
    } else {
      bindObservers();
      scan();
    }
  }

  return { init, scan, scheduleScan };
})();

export function initMotgVimeoBootstrap() {
  if (document.body) motgVimeoEarlyGate();
  else document.addEventListener('DOMContentLoaded', motgVimeoEarlyGate, { once: true });
  MotgVimeoLazy.init();
}

function initVimeoVideos() {
  const vimeoIframes = document.querySelectorAll(
    'iframe[src*="player.vimeo.com"]:not(#showreel-video), iframe[data-vimeo-src]:not(#showreel-video)'
  );

  vimeoIframes.forEach((iframe) => {
    if (motgVimeoShouldSkip(iframe)) return;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('tabindex', '-1');
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    iframe.style.border = 'none';
    iframe.style.pointerEvents = 'none';
  });
}

function ensureVideoScrollFrames() {
  const scrollFrameSelectors = '.image-wrapper, .video-wrapper, .video-scroll-frame';
  const embedSelectors = '.w-embed, .code-embed, [class*="code-embed"]';
  const boundFrames = window.__motgVideoScrollBoundFrames || (window.__motgVideoScrollBoundFrames = new WeakSet());

  const shouldSkipIframe = (iframe) => motgVimeoShouldSkip(iframe);

  const normalizeVideoEmbedStructure = (iframe) => {
    const embed = iframe.closest(embedSelectors);
    if (!embed) return;

    const clickDisable = embed.parentElement;
    if (!clickDisable?.classList.contains('click-disable')) return;

    const frame = clickDisable.closest(scrollFrameSelectors);
    if (!frame || clickDisable.parentElement !== frame) return;

    frame.insertBefore(embed, clickDisable.nextSibling);
  };

  const getOrCreateScrollFrame = (iframe) => {
    const existingFrame = iframe.closest(scrollFrameSelectors);
    if (existingFrame) return existingFrame;

    const embed = iframe.closest(embedSelectors);
    if (embed) {
      const embedParent = embed.parentElement;
      if (embedParent && embedParent.matches(scrollFrameSelectors)) {
        return embedParent;
      }

      const frame = document.createElement('div');
      frame.className = 'video-scroll-frame';
      embed.parentNode.insertBefore(frame, embed);
      frame.appendChild(embed);
      return frame;
    }

    const frame = document.createElement('div');
    frame.className = 'video-scroll-frame';
    iframe.parentNode.insertBefore(frame, iframe);
    frame.appendChild(iframe);
    return frame;
  };

  const bindScrollFrame = (frame) => {
    if (!frame || boundFrames.has(frame)) return;
    boundFrames.add(frame);

    frame.classList.add('has-video-embed');

    frame.querySelectorAll('iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]').forEach((iframe) => {
      iframe.setAttribute('tabindex', '-1');
      iframe.style.pointerEvents = 'none';
    });

    frame.querySelectorAll(embedSelectors).forEach((embed) => {
      embed.style.pointerEvents = 'none';
    });

    const forwardScroll = (event) => {
      const scroller = window.customSmoothScroll;
      if (!scroller || !scroller.scrollEnabled) return;

      if (event.type === 'wheel') {
        scroller.onScroll(event.deltaY * scroller.wheelMultiplier);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.type === 'touchmove' && event.touches.length === 1) {
        const currentY = event.touches[0].clientY;
        const delta = (frame._touchStartY - currentY) * scroller.touchMultiplier;
        scroller.onScroll(delta);
        frame._touchStartY = currentY;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    frame.addEventListener('wheel', forwardScroll, { passive: false, capture: true });
    frame.addEventListener('touchstart', (event) => {
      frame._touchStartY = event.touches[0].clientY;
    }, { passive: true, capture: true });
    frame.addEventListener('touchmove', forwardScroll, { passive: false, capture: true });
  };

  document.querySelectorAll('iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]').forEach((iframe) => {
    if (shouldSkipIframe(iframe)) return;
    normalizeVideoEmbedStructure(iframe);
    bindScrollFrame(getOrCreateScrollFrame(iframe));
  });
}

function initVideoScrollPassSystem() {
  MotgVimeoLazy.init();

  if (window.__motgVideoScrollPassReady) {
    window.__motgVideoScrollPassRescan?.();
    return;
  }
  window.__motgVideoScrollPassReady = true;

  let retryCount = 0;
  const maxRetries = 60;
  let retryTimer = null;
  let observerStarted = false;

  const run = () => {
    MotgVimeoLazy.scan();
    initVimeoVideos();
    ensureVideoScrollFrames();
  };

  window.__motgVideoScrollPassRescan = () => {
    retryCount = 0;
    scheduleRetry();
  };

  const allVideoIframesHandled = () => {
    const iframes = document.querySelectorAll(
      'iframe[src*="player.vimeo.com"]:not(#showreel-video), iframe[data-vimeo-src]:not(#showreel-video)'
    );
    if (!iframes.length) return true;

    return Array.from(iframes).every((iframe) => {
      if (motgVimeoShouldSkip(iframe)) return true;
      return !!iframe.closest('.has-video-embed, .video-scroll-frame, .image-wrapper, .work-thumbnail');
    });
  };

  const scheduleRetry = () => {
    if (retryTimer) return;

    const attempt = () => {
      run();
      retryCount++;

      const scrollerReady = window.customSmoothScroll?.scrollEnabled;
      const framesReady = allVideoIframesHandled();

      if ((scrollerReady && framesReady) || retryCount >= maxRetries) {
        retryTimer = null;
        retryCount = 0;
        return;
      }

      retryTimer = setTimeout(() => {
        retryTimer = null;
        attempt();
      }, 100);
    };

    attempt();
  };

  const startObserver = () => {
    if (observerStarted || !document.body) return;
    observerStarted = true;

    const observer = new MutationObserver((mutations) => {
      const hasNewVideo = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== 1) return false;
          const hit =
            node.matches?.('iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]') ||
            !!node.querySelector?.('iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]');
          return hit;
        })
      );

      if (hasNewVideo) scheduleRetry();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  document.addEventListener('load', (event) => {
    if (event.target?.matches?.('iframe[src*="player.vimeo.com"]:not(#showreel-video)')) {
      scheduleRetry();
    }
  }, true);

  window.addEventListener('load', scheduleRetry);
  startObserver();
  scheduleRetry();
}
export {
  MotgVimeoLazy,
  motgVimeoEarlyGate,
  motgVimeoShouldSkip,
  initVideoScrollPassSystem,
  initVimeoVideos,
  ensureVideoScrollFrames,
};
