
gsap.registerPlugin(SplitText, ScrollTrigger);




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
// VIMEO IFRAME RESTORATION
// ============================================================

function initVimeoVideos() {
  // Simple Vimeo iframe initialization - no complex wrappers
  const vimeoIframes = document.querySelectorAll('iframe[src*="player.vimeo.com"]:not(#showreel-video)');
  
  vimeoIframes.forEach(iframe => {
    // Basic iframe optimization
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    
    // Ensure iframe is visible
    iframe.style.display = 'block';
    iframe.style.visibility = 'visible';
    iframe.style.border = 'none';
    
    // Add basic error handling
    iframe.addEventListener('error', () => {
      console.log('Vimeo iframe failed to load:', iframe.src);
    });
    
    iframe.addEventListener('load', () => {
      console.log('Vimeo iframe loaded successfully:', iframe.src);
    });
  });
}

function extractVimeoId(url) {
  const match = url.match(/vimeo\.com\/video\/(\d+)/);
  return match ? match[1] : null;
}

// Simple debug function
function debugVimeoIframes() {
  const vimeoIframes = document.querySelectorAll('iframe[src*="player.vimeo.com"]:not(#showreel-video)');
  console.log(`Found ${vimeoIframes.length} Vimeo iframes`);
}

// Call debug function after a short delay
setTimeout(debugVimeoIframes, 2000);






// ============================================================
// BREAKPOINT REFRESH HANDLER
// ============================================================

function refreshbreakingpoints() {
  let wasMobile = window.innerWidth < 650;

  window.addEventListener("resize", () => {
    const isMobile = window.innerWidth < 650;
    if (isMobile !== wasMobile) {
      wasMobile = isMobile;
      window.location.reload();
    }
  });
}


// ============================================================
// SPLIT TEXT ANIMATIONS
// ============================================================

function initSplitTextAnimations() {
    // Kill all existing ScrollTrigger instances first
    if (gsap.ScrollTrigger) {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    // Force a full page reflow to ensure all heights are calculated
    document.body.offsetHeight;

const elements = Array.from(document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, .btn, .nav, .footer a, .name, .role, .link-box"
)).filter(el => !el.matches(".about-page section:nth-of-type(12) .center h1"));

    elements.forEach((element) => {
        // First hide the original element
        gsap.set(element, { visibility: "hidden" });

        const split = new SplitText(element, { type: "lines", linesClass: "line" });

        split.lines.forEach((line) => {
            line.style.display = "inline-block";
            line.style.width = "100%";
            line.style.lineHeight = "unset";
            line.style.visibility = "hidden";
            line.style.opacity = "0";
        });

        // Force a reflow for this specific element
        element.offsetHeight;
        split.lines.forEach((line) => line.offsetHeight);

        // Set initial state
        gsap.set(split.lines, {
            visibility: "visible",
            yPercent: 100,
            clipPath: "inset(0% 0% 100% 0%)",
            opacity: 0,
        });

        // Create the animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: "top 90%",
                end: "bottom top",
                once: true,
                onEnter: () => {
                    // Force a reflow
                    element.offsetHeight;
                    // Show the original element
                    gsap.set(element, { visibility: "visible" });
                },
                onRefresh: () => {
                    // Recalculate heights when ScrollTrigger refreshes
                    element.offsetHeight;
                    split.lines.forEach((line) => line.offsetHeight);
                },
                onUpdate: (self) => {
                    // Recalculate during scroll
                    element.offsetHeight;
                    split.lines.forEach((line) => line.offsetHeight);
                },
                onScrubComplete: () => {
                    // Final recalculation after scroll
                    element.offsetHeight;
                    split.lines.forEach((line) => line.offsetHeight);
                }
            }
        });

        tl.to(split.lines, {
            yPercent: 0,
            clipPath: "inset(-20% -10% -30% 0%)",
            opacity: 1,
            stagger: 0.12,
            duration: 1.5,
            delay: element.closest(".hero, .hero-wait") ? 0 : 0,
            ease: "power4.out"
        });
    });

    // Force ScrollTrigger to recalculate all measurements
    ScrollTrigger.refresh(true);
}


// ============================================================
// POST-TRANSITION INITIALIZATION
// ============================================================

function initializeAfterTransition() {
    // Kill all existing ScrollTrigger instances first
    if (gsap.ScrollTrigger) {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    // First hide all text elements that will be animated
    const elements = Array.from(document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, .btn, .nav, .footer a, .name, .role, .link-box"
    )).filter(el => !el.matches(".about-page section:nth-of-type(12) .center h1"));
  
    gsap.set(elements, { visibility: "hidden" });

    // Force a full page reflow
    document.body.offsetHeight;
    
    // Note: Split text animations are initialized by setupWindowLoadHandler 
    // after fonts are loaded - no need to duplicate here
}


// ============================================================
// SPLIT TEXT EVENT LISTENERS SETUP
// ============================================================

function setupSplitTextEventListeners() {
  // Add event listener for page transitions
  document.addEventListener('DOMContentLoaded', () => {
      // Initial load
      initializeAfterTransition();
      
      // Listen for page transitions
      window.addEventListener('popstate', handlePopState);

      // Listen for window resize to recalculate heights
      window.addEventListener('resize', () => {
          ScrollTrigger.refresh(true);
      });

      // Add scroll event listener for continuous height updates
      let scrollTimeout;
      window.addEventListener('scroll', () => {
          // Clear the previous timeout
          clearTimeout(scrollTimeout);
          
          // Set a new timeout to refresh after scrolling stops
          scrollTimeout = setTimeout(() => {
              ScrollTrigger.refresh(true);
          }, 100);
      }, { passive: true });
  });
}





// ============================================================
// SHOWREEL TOGGLE
// ============================================================

function initShowreelToggle() {
  const video = document.getElementById('showreel-video');
  const overlay = document.getElementById('showreel-overlay');
  if (!video || !overlay) return;

  let isMuted = true;

  overlay.addEventListener('click', () => {
    video.muted = !isMuted;
    isMuted = !isMuted;
  });
}


// ============================================================
// INFINITY GALLERY
// ============================================================

function initInfinityGallery() {
    class DragScroll {
      constructor(obj) {
          this.el = typeof obj.el === 'string' ? document.querySelector(obj.el) : obj.el;
          this.wrap = this.el.querySelector(obj.wrap);
          this.items = this.el.querySelectorAll(obj.item);
          this.dragThreshold = 5;
          this.isDragging = false;
          this.isMouseDown = false;
          this.startX = 0;
          this.startY = 0;
          this.isHorizontalDrag = false;
          this.startTime = 0;
          this.scrollProgress = 0;
          this.manualDragOffset = 0;
          this.isManualDrag = false;
          this.init();
      }
  
      init() {
          this.progress = 0;
          this.x = 0;
          this.bindEvents();
          this.calculate();
          this.raf();
      }
  
      bindEvents() {
          window.addEventListener("resize", this.calculate.bind(this));
          window.addEventListener("scroll", this.handleScroll.bind(this));
          this.el.addEventListener("mousedown", (e) => this.handleStart(e));
          window.addEventListener("mousemove", (e) => this.handleMove(e));
          window.addEventListener("mouseup", (e) => this.handleEnd(e));
          this.el.addEventListener("touchstart", (e) => this.handleStart(e));
          window.addEventListener("touchmove", (e) => this.handleMove(e));
          window.addEventListener("touchend", (e) => this.handleEnd(e));
          this.el.addEventListener("dragstart", (e) => this.preventDragOnLinks(e));
      }
  
      calculate() {
          this.wrapWidth = this.wrap.scrollWidth;
          this.containerWidth = this.el.clientWidth;
          const lastItem = this.items[this.items.length - 1];
          const lastItemRight = lastItem.offsetLeft + lastItem.offsetWidth;
          this.maxScroll = lastItemRight - this.el.clientWidth;
          
          // Calculate gallery position relative to viewport
          const rect = this.el.getBoundingClientRect();
          this.galleryTop = rect.top + window.scrollY;
          this.galleryHeight = rect.height;
          
          // Preserve current scroll progress instead of resetting
          // This prevents the gallery from jumping back to start when page is scrolled
      }
  
      handleScroll() {
          if (this.isDragging || this.isManualDrag) return; // Don't scroll when dragging or after manual drag
          
          const scrollY = window.scrollY;
          const galleryRect = this.el.getBoundingClientRect();
          
          // Check if gallery is in viewport
          if (galleryRect.bottom < 0 || galleryRect.top > window.innerHeight) {
              this.scrollProgress = 0;
              return;
          }
          
          // Calculate scroll progress through the gallery
          // Start from when gallery enters viewport (top of gallery reaches top of viewport)
          const galleryStart = this.galleryTop;
          const galleryEnd = this.galleryTop + this.galleryHeight + window.innerHeight;
          const scrollProgress = Math.max(0, Math.min(1, (scrollY - galleryStart + window.innerHeight) / (galleryEnd - galleryStart)));
          
          // Map scroll progress to gallery position
          this.scrollProgress = scrollProgress * this.maxScroll;
      }
  
      handleStart(e) {
          this.isDragging = false;
          this.isMouseDown = true;
          this.isHorizontalDrag = false;
          this.startX = e.clientX || e.touches[0].clientX;
          this.startY = e.clientY || e.touches[0].clientY;
          this.startTime = Date.now();
          // Store current position when starting manual drag
          // Use the current scroll progress as the starting point for manual drag
          this.manualDragOffset = this.isManualDrag ? this.progress : this.scrollProgress;
          this.progress = this.manualDragOffset;
      }
  
      handleMove(e) {
          if (!this.isMouseDown) return;
  
          const currentX = e.clientX || e.touches[0].clientX;
          const currentY = e.clientY || e.touches[0].clientY;
  
          const deltaX = currentX - this.startX;
          const deltaY = currentY - this.startY;
  
          if (!this.isHorizontalDrag) {
              if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.dragThreshold) {
                  this.isHorizontalDrag = true;
              } else if (Math.abs(deltaY) > this.dragThreshold) {
                  return;
              }
          }
  
          if (this.isHorizontalDrag) {
              e.preventDefault();
              this.isDragging = true;
              this.isManualDrag = true;
              this.progress += -deltaX * (window.innerWidth <= 650 ? 8 : 3.819);
              this.startX = currentX;
              this.startY = currentY;
              this.move();
          }
      }
  
      handleEnd(e) {
          this.isMouseDown = false;
          if (this.isDragging) {
              this.isDragging = false;
              // Keep manual drag state active to prevent scroll from overriding
              return;
          }
      }
  
      preventDragOnLinks(e) {
          if (e.target.tagName === "A") {
              e.preventDefault();
          }
      }
  
      move() {
          this.progress = Math.max(0, Math.min(this.progress, this.maxScroll));
      }
  
      raf() {
          // Use manual drag position if user has manually dragged, otherwise use scroll progress
          let targetProgress;
          if (this.isManualDrag) {
              targetProgress = this.progress;
          } else {
              targetProgress = this.scrollProgress;
          }
          
          // For scroll, stick directly to scroll position (no easing)
          // For manual drag, use easing for smooth interaction
          if (this.isManualDrag) {
              this.x += (targetProgress - this.x) * 0.1;
          } else {
              this.x = targetProgress;
          }
          
          this.wrap.style.transform = `translateX(${-this.x}px)`;
          requestAnimationFrame(this.raf.bind(this));
      }
  }
  
  // Initialize galleries with individual triggers
  const galleries = document.querySelectorAll('.gallery');
  galleries.forEach((gallery, index) => {
      // Check if gallery is already visible on page load
      const rect = gallery.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
          // Initialize immediately if gallery is already visible
          const slider = new DragScroll({
              el: gallery,
              wrap: ".gallery-wrapper",
              item: ".gallery-item",
          });
          slider.calculate();
          gallery.setAttribute('data-gallery-initialized', 'true');
      } else {
          // Create individual trigger for each gallery
          const trigger = ScrollTrigger.create({
              trigger: gallery,
              start: "top 80%", // Trigger when gallery is 80% from top of viewport
              onEnter: () => {
                  // Only initialize if not already initialized
                  if (!gallery.hasAttribute('data-gallery-initialized')) {
                      const slider = new DragScroll({
                          el: gallery,
                          wrap: ".gallery-wrapper",
                          item: ".gallery-item",
                      });
                      slider.calculate();
                      gallery.setAttribute('data-gallery-initialized', 'true');
                  }
              },
              onLeave: () => {
                  // Optional: cleanup when leaving gallery
              },
              onEnterBack: () => {
                  // Re-initialize when scrolling back up
                  if (gallery.hasAttribute('data-gallery-initialized')) {
                      const slider = new DragScroll({
                          el: gallery,
                          wrap: ".gallery-wrapper",
                          item: ".gallery-item",
                      });
                      slider.calculate();
                  }
              }
          });
      }
  });
  
  }
  


// ============================================================
// EXTRA TABS
// ============================================================

function extraTabs() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const plus = card.querySelector('.plus img');
    const extra = card.querySelector('.extra');

    gsap.set(extra, {
      height: 0,
      minHeight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      overflow: 'hidden',
      opacity: 1
    });
    gsap.set(plus, { rotate: 0 });

    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');

      cards.forEach(otherCard => {
        if (otherCard !== card) {
          const otherExtra = otherCard.querySelector('.extra');
          const otherPlus = otherCard.querySelector('.plus img');
          otherCard.classList.remove('open');
          gsap.to(otherExtra, {
            height: 0,
            minHeight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.4,
            ease: 'power2.inOut'
          });
          gsap.to(otherPlus, { rotate: 0, duration: 0.3 });
        }
      });

      if (!isOpen) {
        card.classList.add('open');
        const fullHeight = extra.scrollHeight;
        gsap.to(extra, {
          height: fullHeight,
          minHeight: 'fit-content',
          paddingTop: '3vw',
          paddingBottom: '3vw',
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            extra.style.height = 'auto';
            extra.style.minHeight = 'fit-content';
          }
        });
        gsap.to(plus, { rotate: 45, duration: 0.3 });
      } else {
        card.classList.remove('open');
        gsap.to(extra, {
          height: 0,
          minHeight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        });
        gsap.to(plus, { rotate: 0, duration: 0.3 });
      }
    });
  });
}


// ============================================================
// TABS ACCORDION
// ============================================================

function tabsAccordion() {
  const ANIMATION_DURATION = 0.4;
  const ANIMATION_EASE = 'ease';
  let isAnimating = false;
  document.querySelectorAll('.step.clickable').forEach(step => {
    const plus = step.querySelector('.tab-plus');
    const content = step.querySelector('.step-content');
    // Set initial state for open tab
    if (step.classList.contains('open')) {
      gsap.set(plus, { rotate: 45, color: '#ff3c1b' });
      gsap.set(content, { height: 'auto', opacity: 1, overflow: 'visible' });
      content.style.height = 'auto';
      content.style.opacity = 1;
      content.style.overflow = 'visible';
    } else {
      gsap.set(plus, { rotate: 0, color: '#3a1818' });
      gsap.set(content, { height: 0, opacity: 0, overflow: 'hidden' });
      content.style.height = '0px';
      content.style.opacity = 0;
      content.style.overflow = 'hidden';
    }
    step.addEventListener('click', function(e) {
      if (e.target.closest('.step-content')) return;
      if (isAnimating) return;
      const isOpen = step.classList.contains('open');
      isAnimating = true;
      // Close all others
      document.querySelectorAll('.step.clickable.open').forEach(openStep => {
        if (openStep !== step) {
          openStep.classList.remove('open');
          const openPlus = openStep.querySelector('.tab-plus');
          const openContent = openStep.querySelector('.step-content');
          gsap.to(openPlus, { rotate: 0, duration: ANIMATION_DURATION, color: '#3a1818', ease: ANIMATION_EASE });
          gsap.to(openContent, { height: 0, opacity: 0, overflow: 'hidden', ease: ANIMATION_EASE, duration: ANIMATION_DURATION, onUpdate: () => {
            openContent.style.overflow = 'hidden';
          }, onComplete: () => {
            openContent.style.height = '0px';
            openContent.style.opacity = 0;
            openContent.style.overflow = 'hidden';
          }});
        }
      });
      if (!isOpen) {
        step.classList.add('open');
        content.style.overflow = 'hidden';
        const h = content.scrollHeight;
        gsap.to(plus, { rotate: 45, duration: ANIMATION_DURATION, color: '#ff3c1b', ease: ANIMATION_EASE });
        gsap.fromTo(content, { height: 0, opacity: 0, overflow: 'hidden' }, { height: h, opacity: 1, overflow: 'visible', ease: ANIMATION_EASE, duration: ANIMATION_DURATION, onComplete: () => {
          content.style.height = 'auto';
          content.style.opacity = 1;
          content.style.overflow = 'visible';
        }});
      } else {
        step.classList.remove('open');
        gsap.to(plus, { rotate: 0, duration: ANIMATION_DURATION, color: '#3a1818', ease: ANIMATION_EASE });
        gsap.to(content, { height: 0, opacity: 0, overflow: 'hidden', ease: ANIMATION_EASE, duration: ANIMATION_DURATION, onUpdate: () => {
          content.style.overflow = 'hidden';
        }, onComplete: () => {
          content.style.height = '0px';
          content.style.opacity = 0;
          content.style.overflow = 'hidden';
        }});
      }
      gsap.delayedCall(ANIMATION_DURATION, () => { isAnimating = false; });
    });
  });
}


// ============================================================
// SVG ANIMATIONS
// ============================================================

function initSvgAnimations() {
    // ========================================
    // ROAD CONTAINER ANIMATIONS
    // ========================================

    const container = document.querySelector('.road-container');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 439 378');
    svg.setAttribute('fill', 'none');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    const paths = {
        center: "M258.74 0L59 377.271H177.868L377.68 0H258.74Z",
        side1: "M83.8558 110L0 268.388H49.9037L133.79 110H83.8558Z",
        side2: "M388.856 110L305 268.388H354.904L438.79 110H388.856Z",
        side3: "M297.884 293L264 357H284.165L318.061 293H297.884Z",
        side4: "M159.884 20L126 84H146.165L180.061 20H159.884Z"
    };

    function createGroup(id, pathsToInclude) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = id;
        pathsToInclude.forEach(pathKey => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', paths[pathKey]);
            path.setAttribute('fill', '#FF1600');
            group.appendChild(path);
        });
        return group;
    }

    const markings1 = createGroup('markings1', ['side1', 'side2', 'side3', 'side4']);
    const markings2 = createGroup('markings2', ['side1', 'side2', 'side3', 'side4']);
    const center1 = createGroup('center1', ['center']);
    const center2 = createGroup('center2', ['center']);

    svg.appendChild(markings1);
    svg.appendChild(markings2);
    svg.appendChild(center1);
    svg.appendChild(center2);
    container.appendChild(svg);

    // ========================================
    // MEDIA WINDOW ANIMATIONS
    // ========================================

    const mediaContainer = document.querySelector('.media-window');
    const mediaSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mediaSvg.setAttribute('viewBox', '0 0 488 441');
    mediaSvg.setAttribute('fill', 'none');
    mediaSvg.style.width = '100%';
    mediaSvg.style.height = '100%';
    mediaSvg.style.display = 'block';

    const windowBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    windowBg.setAttribute('d', 'M0 63H488V440.66H0V63Z');
    windowBg.setAttribute('fill', '#FF1600');
    windowBg.id = 'windowBg';

    const errorIcon = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    errorIcon.id = 'errorIcon';

    const errorBar = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    errorBar.setAttribute('d', 'M261 183.42L256.839 272.198H229.096L225.859 183.42L261 183.42Z');
    errorBar.setAttribute('fill', '#2D0200');

    const errorDot = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    errorDot.setAttribute('d', 'M259.618 288.844V320.487H226.326L226.326 288.844H259.618Z');
    errorDot.setAttribute('fill', '#2D0200');

    const titleBar = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    titleBar.setAttribute('d', 'M0 0H96V30H0V0');
    titleBar.setAttribute('fill', '#FF1600');
    titleBar.id = 'titleBar';

    errorIcon.appendChild(errorBar);
    errorIcon.appendChild(errorDot);
    mediaSvg.appendChild(windowBg);
    mediaSvg.appendChild(errorIcon);
    mediaSvg.appendChild(titleBar);
    mediaContainer.appendChild(mediaSvg);

    // ========================================
    // ALIGNMENT VISUAL ANIMATIONS
    // ========================================

    const alignmentContainer = document.querySelector('.alignment-visual');
    const alignmentSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    alignmentSvg.setAttribute('viewBox', '0 0 1047 1047');
    alignmentSvg.setAttribute('fill', 'none');
    alignmentSvg.style.width = '100%';
    alignmentSvg.style.height = '100%';
    alignmentSvg.style.display = 'block';

    const featherPaths = [
        "M16.917 456.261L317.324 572.315L312.52 531.881L12.1066 415.774L16.917 456.261Z",
        "M46.3429 340.501L311.726 522.943L316.412 482.496L51.0355 300L46.3429 340.501Z",
        "M101.768 234.697L317.709 473.616L331.631 435.353L115.709 196.382L101.768 234.697Z",
        "M180.18 144.597L334.948 427.014L357.35 393.013L202.611 110.55L180.18 144.597Z",
        "M277.318 75.096L362.506 385.67L392.17 357.778L307.021 47.1668L277.318 75.096Z",
        "M387.907 29.9685L398.887 351.826L434.202 331.559L423.268 9.6739L387.907 29.9685Z",
        "M505.938 11.6677L442.114 327.325L481.162 315.783L545.038 0.110098L505.938 11.6677Z",
        "M624.999 21.1873L489.838 313.496L530.496 311.306L665.712 18.9946L624.999 21.1873Z",
        "M738.624 58.0085L539.468 311.089L579.529 318.371L778.738 65.2999L738.624 58.0085Z",
        "M840.636 120.133L588.304 320.238L625.592 336.595L877.973 136.513L840.636 120.133Z",
        "M925.496 204.184L633.696 340.442L666.184 364.986L958.027 228.762L925.496 204.184Z",
        "M988.594 305.596L673.178 370.604L699.101 402.002L1014.55 337.036L988.594 305.596Z",
        "M1026.5 418.859L704.606 409.086L722.557 445.633L1044.48 455.454L1026.5 418.859Z",
        "M1037.16 537.821L726.272 453.799L735.275 493.508L1046.18 577.584L1037.16 537.821Z",
        "M1020 656.021L737.001 502.313L736.567 543.028L1019.56 696.79L1020 656.021Z",
        "M975.934 767.036L736.206 551.992L726.359 591.501L966.074 806.597L975.934 767.036Z",
        "M907.37 864.834L723.934 600.138L705.209 636.294L888.62 901.039L907.37 864.834Z",
        "M818.028 944.106L700.848 644.135L674.262 674.975L791.406 974.986L818.028 944.106Z",
        "M712.765 1000.54L668.208 681.594L635.204 705.441L679.718 1024.42L712.765 1000.54Z",
        "M597.293 1031.08L627.779 710.479L590.152 726.039L559.616 1046.66L597.293 1031.08Z",
        "M477.89 1034.06L581.763 729.221L541.556 735.648L437.63 1040.49L477.89 1034.06Z",
        "M361.043 1009.31L532.66 736.802L492.057 733.747L320.387 1006.25L361.043 1009.31Z",
        "M253.098 958.19L483.135 732.81L444.342 720.439L214.253 945.802L253.098 958.19Z",
        "M159.92 883.469L435.881 717.462L401.006 696.447L124.998 862.426L159.92 883.469Z",
        "M86.5692 789.208L393.464 691.593L364.401 663.075L57.4674 760.653L86.5692 789.208Z",
        "M37.0305 680.529L358.186 656.607L336.514 622.136L15.3295 646.012L37.0305 680.529Z",
        "M13.9934 563.333L331.963 614.404L318.859 575.853L0.872025 524.73L13.9934 563.333Z"
    ];

    featherPaths.forEach((pathData, index) => {
        const feather = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        feather.setAttribute('d', pathData);
        feather.setAttribute('fill', '#FF1600');
        feather.id = `feather${index}`;
        feather.style.transformOrigin = 'center center';
        alignmentSvg.appendChild(feather);
    });

    alignmentContainer.appendChild(alignmentSvg);

    // ========================================
    // GLOBE VISUAL ANIMATIONS
    // ========================================

    const globeContainer = document.querySelector('.globe-visual');
    const globeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    globeSvg.setAttribute('viewBox', '0 0 473 473');
    globeSvg.setAttribute('fill', 'none');
    globeSvg.style.width = '100%';
    globeSvg.style.height = '100%';
    globeSvg.style.display = 'block';

    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '236.387');
    circle1.setAttribute('cy', '236.387');
    circle1.setAttribute('r', '177.828');
    circle1.setAttribute('transform', 'rotate(-17.8951 236.387 236.387)');
    circle1.setAttribute('stroke', '#FF1600');
    circle1.setAttribute('stroke-width', '19.8912');
    circle1.id = 'globe-circle1';

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M236.5 58.9453C260.121 58.9453 283.58 76.239 301.705 108.76C319.646 140.95 331.055 186.093 331.055 236.5C331.055 286.907 319.646 332.05 301.705 364.24C283.58 396.761 260.121 414.055 236.5 414.055C212.879 414.055 189.42 396.761 171.295 364.24C153.354 332.05 141.945 286.907 141.945 236.5C141.945 186.093 153.354 140.95 171.295 108.76C189.42 76.239 212.879 58.9453 236.5 58.9453Z');
    path1.setAttribute('stroke', '#FF1600');
    path1.setAttribute('stroke-width', '19.8912');
    path1.id = 'globe-path1';

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M414.055 236.5C414.055 260.121 396.761 283.58 364.24 301.705C332.05 319.646 286.907 331.055 236.5 331.055C186.093 331.055 140.95 319.646 108.76 301.705C76.239 283.58 58.9453 260.121 58.9453 236.5C58.9453 212.879 76.239 189.42 108.76 171.295C140.95 153.354 186.093 141.945 236.5 141.945C286.907 141.945 332.05 153.354 364.24 171.295C396.761 189.42 414.055 212.879 414.055 236.5Z');
    path2.setAttribute('stroke', '#FF1600');
    path2.setAttribute('stroke-width', '19.8912');
    path2.id = 'globe-path2';

    const spark = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    spark.setAttribute('d', 'M236.5 211L240.359 232.641L262 236.5L240.359 240.359L236.5 262L232.641 240.359L211 236.5L232.641 232.641L236.5 211Z');
    spark.setAttribute('fill', '#FF1600');
    spark.id = 'globe-spark';

    globeSvg.appendChild(circle1);
    globeSvg.appendChild(path1);
    globeSvg.appendChild(path2);
    globeSvg.appendChild(spark);

    globeContainer.appendChild(globeSvg);

    // ========================================
    // LINE VISUAL ANIMATIONS
    // ========================================

    const lineContainer = document.querySelector('.line-visual');
    const lineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lineSvg.setAttribute('viewBox', '0 0 1731 695');
    lineSvg.setAttribute('fill', 'none');
    lineSvg.style.width = '100%';
    lineSvg.style.height = '100%';
    lineSvg.style.display = 'block';

    const lineDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const lineClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    lineClipPath.id = 'clip0_2196_409';
    const lineClipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    lineClipRect.setAttribute('width', '1731');
    lineClipRect.setAttribute('height', '695');
    lineClipRect.setAttribute('fill', 'white');
    lineClipPath.appendChild(lineClipRect);
    lineDefs.appendChild(lineClipPath);
    lineSvg.appendChild(lineDefs);

    const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    lineGroup.setAttribute('clip-path', 'url(#clip0_2196_409)');

    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', 'M1000.16 0L632 695.388H731.483L1099.78 0H1000.16Z');
    linePath.setAttribute('fill', '#FF1600');
    linePath.id = 'line-path';

    lineGroup.appendChild(linePath);
    lineSvg.appendChild(lineGroup);
    lineContainer.appendChild(lineSvg);

    // ========================================
    // SQUARE BOX ANIMATIONS
    // ========================================

    const squareContainer = document.querySelector('.square-box');
    const squareSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    squareSvg.setAttribute('viewBox', '0 0 324 324');
    squareSvg.setAttribute('fill', 'none');
    squareSvg.style.width = '100%';
    squareSvg.style.height = '100%';
    squareSvg.style.display = 'block';

    const outerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outerRect.setAttribute('x', '4.9858');
    outerRect.setAttribute('y', '4.9858');
    outerRect.setAttribute('width', '313.722');
    outerRect.setAttribute('height', '313.722');
    outerRect.setAttribute('stroke', '#FF1600');
    outerRect.setAttribute('stroke-width', '9.97159');

    const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    innerRect.setAttribute('x', '108.348');
    innerRect.setAttribute('y', '108');
    innerRect.setAttribute('width', '107');
    innerRect.setAttribute('height', '107');
    innerRect.setAttribute('fill', '#FF1600');
    innerRect.id = 'inner-square';

    squareSvg.appendChild(outerRect);
    squareSvg.appendChild(innerRect);
    squareContainer.appendChild(squareSvg);

    // ========================================
    // MOTG BOX ANIMATIONS
    // ========================================

    const motgContainer = document.querySelector('.motg-box');
    const motgSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    motgSvg.setAttribute('viewBox', '0 0 325 324');
    motgSvg.setAttribute('fill', 'none');
    motgSvg.style.width = '100%';
    motgSvg.style.height = '100%';
    motgSvg.style.display = 'block';

    const motgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const motgClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    motgClipPath.id = 'clip0_2196_414';
    const motgClipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    motgClipRect.setAttribute('width', '323.693');
    motgClipRect.setAttribute('height', '323.693');
    motgClipRect.setAttribute('fill', 'white');
    motgClipRect.setAttribute('transform', 'translate(0.488281 0.150391)');
    motgClipPath.appendChild(motgClipRect);
    motgDefs.appendChild(motgClipPath);
    motgSvg.appendChild(motgDefs);

    const motgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    motgGroup.setAttribute('clip-path', 'url(#clip0_2196_414)');

    const motgOuterRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    motgOuterRect.setAttribute('x', '5.47408');
    motgOuterRect.setAttribute('y', '5.13619');
    motgOuterRect.setAttribute('width', '313.722');
    motgOuterRect.setAttribute('height', '313.722');
    motgOuterRect.setAttribute('stroke', '#FF1600');
    motgOuterRect.setAttribute('stroke-width', '9.97159');

    const innerDiamond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    innerDiamond.setAttribute('d', 'M152.335 108L172.335 108L172.335 215.354L152.335 215.354Z');
    innerDiamond.setAttribute('fill', '#FF1600');
    innerDiamond.id = 'inner-diamond';

    motgGroup.appendChild(motgOuterRect);
    motgGroup.appendChild(innerDiamond);
    motgSvg.appendChild(motgGroup);
    motgContainer.appendChild(motgSvg);

    // ========================================
    // COMPANY VISUAL ANIMATIONS
    // ========================================

    const companyContainer = document.querySelector('.company-visual');
    const companySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    companySvg.setAttribute('viewBox', '0 0 800 407');
    companySvg.setAttribute('width', '800');
    companySvg.setAttribute('height', '407');
    companySvg.setAttribute('fill', 'none');

    const mainClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    mainClipPath.id = 'clip0_2208_426';
    const mainClipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mainClipRect.setAttribute('width', '640');
    mainClipRect.setAttribute('height', '266.6');
    mainClipRect.setAttribute('fill', 'white');
    mainClipRect.setAttribute('transform', 'translate(80 70)');

    const diagonalClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    diagonalClipPath.id = 'clip1_2208_426';
    const diagonalClipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    diagonalClipRect.setAttribute('width', '159.664');
    diagonalClipRect.setAttribute('height', '0');
    diagonalClipRect.setAttribute('fill', 'white');
    diagonalClipRect.setAttribute('transform', 'translate(587.4736 322.354)');

    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('clip-path', 'url(#clip0_2208_426)');

    const block1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block1.setAttribute('x', '88.5756');
    block1.setAttribute('y', '78.5765');
    block1.setAttribute('width', '124.7245');
    block1.setAttribute('height', '249.449');
    block1.setAttribute('stroke', '#FF1600');
    block1.setAttribute('stroke-width', '17.1511');
    block1.setAttribute('fill', 'none');

    const block2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block2.setAttribute('x', '213.3001');
    block2.setAttribute('y', '78.5765');
    block2.setAttribute('width', '124.7245');
    block2.setAttribute('height', '249.449');
    block2.setAttribute('stroke', '#FF1600');
    block2.setAttribute('stroke-width', '17.1511');
    block2.setAttribute('fill', 'none');

    const block3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block3.setAttribute('x', '338.0246');
    block3.setAttribute('y', '78.5765');
    block3.setAttribute('width', '124.7245');
    block3.setAttribute('height', '249.449');
    block3.setAttribute('stroke', '#FF1600');
    block3.setAttribute('stroke-width', '17.1511');
    block3.setAttribute('fill', 'none');

    const block4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block4.setAttribute('x', '462.7491');
    block4.setAttribute('y', '78.5765');
    block4.setAttribute('width', '124.7245');
    block4.setAttribute('height', '249.449');
    block4.setAttribute('stroke', '#FF1600');
    block4.setAttribute('stroke-width', '17.1511');
    block4.setAttribute('fill', 'none');

    const block5 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    block5.setAttribute('x', '587.4736');
    block5.setAttribute('y', '78.5765');
    block5.setAttribute('width', '124.7245');
    block5.setAttribute('height', '249.449');
    block5.setAttribute('stroke', '#FF1600');
    block5.setAttribute('stroke-width', '17.1511');
    block5.setAttribute('fill', 'none');

    const diagonalGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    diagonalGroup.setAttribute('clip-path', 'url(#clip1_2208_426)');

    const diagonalLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    diagonalLine.setAttribute('d', 'M713.137 85L587.4736 322.354H612.7656L738.4736 85L713.137 85Z');
    diagonalLine.setAttribute('fill', '#FF1600');

    mainClipPath.appendChild(mainClipRect);
    diagonalClipPath.appendChild(diagonalClipRect);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.appendChild(mainClipPath);
    defs.appendChild(diagonalClipPath);

    diagonalGroup.appendChild(diagonalLine);

    mainGroup.appendChild(block1);
    mainGroup.appendChild(block2);
    mainGroup.appendChild(block3);
    mainGroup.appendChild(block4);
    mainGroup.appendChild(block5);
    mainGroup.appendChild(diagonalGroup);

    companySvg.appendChild(defs);
    companySvg.appendChild(mainGroup);
    companyContainer.appendChild(companySvg);

    // ========================================
    // INITIALIZE ALL ANIMATIONS
    // ========================================

    function initializeAllAnimations() {
        // Road Container Animations
        gsap.set("#markings1", { x: 263, y: -378 });
        gsap.set("#markings2", { x: 263, y: -378 });
        gsap.set("#center1", { x: -263, y: 756 });
        gsap.set("#center2", { x: -263, y: 756 });

        gsap.to("#markings1", { x: -263, y: 756, duration: 2, ease: "none", repeat: -1 });
        gsap.to("#markings2", { x: -263, y: 756, duration: 2, ease: "none", repeat: -1, delay: 1 });
        gsap.to("#center1", { x: 263, y: -378, duration: 2, ease: "none", repeat: -1 });
        gsap.to("#center2", { x: 263, y: -378, duration: 2, ease: "none", repeat: -1, delay: 1 });

        // Media Window Animations
        gsap.set("#titleBar", { x: 200, opacity: 0 });
        gsap.set("#windowBg", { scaleX: 0, scaleY: 0, transformOrigin: "center center" });
        gsap.set("#errorIcon", { scale: 0, rotation: 0, y: 0 });
        
        function randomWindowOpen() {
            gsap.to("#titleBar", {
                x: 0, opacity: 1, duration: 0.6, ease: "power2.inOut",
                onComplete: () => {
                    gsap.to("#windowBg", {
                        scaleX: 1, scaleY: 1, duration: 0.8, ease: "power3.inOut",
                        onComplete: () => {
                            setTimeout(() => {
                                gsap.to("#errorIcon", {
                                    scale: 1, duration: 0.4, ease: "power2.inOut",
                                    onComplete: () => {
                                        gsap.to("#errorIcon", {
                                            rotation: gsap.utils.random(-15, 15),
                                            duration: 0.25, ease: "power2.inOut",
                                            yoyo: true, repeat: 3
                                        });
                                    }
                                });
                            }, gsap.utils.random(300, 700));
                        }
                    });
                }
            });
        }

        function closeWindow() {
            gsap.to("#errorIcon", { scale: 0, rotation: gsap.utils.random(-45, 45), duration: 0.4, ease: "power2.inOut" });
            gsap.to("#windowBg", { scaleX: 0, scaleY: 0, duration: 0.6, ease: "power3.inOut", delay: 0.2 });
            gsap.to("#titleBar", { x: -200, opacity: 0, duration: 0.4, ease: "power2.inOut", delay: 0.3 });
        }

        function startWindowCycle() {
            const cycleTime = gsap.utils.random(3000, 6000);
            setTimeout(() => {
                closeWindow();
                setTimeout(() => {
                    randomWindowOpen();
                    startWindowCycle();
                }, 1200);
            }, cycleTime);
        }

        randomWindowOpen();
        startWindowCycle();

        // Peacock Wing Animations
        featherPaths.forEach((_, index) => {
            gsap.set(`#feather${index}`, {
                scaleY: 0,
                scaleX: 0,
                opacity: 1,
                transformOrigin: "center center"
            });
        });
        
        gsap.to(alignmentSvg, {
            rotation: 360,
            duration: 6,
            ease: "none",
            repeat: -1
        });
        
        const peacockTimeline = gsap.timeline({ repeat: -1 });
        
        peacockTimeline.to(featherPaths.map((_, i) => `#feather${i}`), {
            scaleY: 1,
            scaleX: 1,
            duration: 0.4,
            stagger: {
                each: 0.06,
                from: "start"
            },
            ease: "power2.out"
        })
        .to({}, { duration: 1 })
        .to(featherPaths.map((_, i) => `#feather${i}`), {
            scaleY: 0,
            scaleX: 0,
            duration: 0.4,
            stagger: {
                each: 0.06,
                from: "start"
            },
            ease: "power2.in"
        })
        .to({}, { duration: 0.5 });

        // Globe Animations
        const globeElements = ['#globe-circle1', '#globe-path1', '#globe-path2', '#globe-spark'];
        
        globeElements.forEach(element => {
            gsap.set(element, {
                scale: 0,
                opacity: 1,
                transformOrigin: "center center"
            });
        });
        
        gsap.set(globeSvg, {
            scale: 1,
            rotation: 0,
            transformOrigin: "center center"
        });
        
        gsap.to(globeSvg, {
            rotation: 360,
            duration: 6,
            ease: "none",
            repeat: -1
        });
        
        const globeTimeline = gsap.timeline({ repeat: -1 });
        
        globeTimeline.to('#globe-circle1', { 
            scale: 1, 
            duration: 0.8, 
            ease: "power4.out" 
        })
        .to('#globe-path1', { 
            scale: 1, 
            duration: 0.8, 
            ease: "power4.out" 
        }, "-=0.7")
        .to('#globe-path2', { 
            scale: 1, 
            duration: 0.8, 
            ease: "power4.out" 
        }, "-=0.7")
        .to('#globe-spark', { 
            scale: 1, 
            duration: 0.8, 
            ease: "power4.out" 
        }, "-=0.7")
        .to({}, { duration: 1.7 })
        .to(globeSvg, {
            scale: 0,
            opacity: 0,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                globeElements.forEach(element => {
                    gsap.set(element, { scale: 0, opacity: 1 });
                });
                gsap.set(globeSvg, { scale: 1, opacity: 1 });
            }
        })
        .to({}, { duration: 0.4 });

        // Line Animations
        gsap.set(lineSvg, {
            scale: 0.5,
            x: 0,
            transformOrigin: "center center"
        });
        
        const lineTimeline = gsap.timeline({ repeat: -1 });
        
        lineTimeline.to(lineSvg, {
            scale: 1.2,
            duration: 1,
            ease: "power2.inOut"
        })
        .to({}, { duration: 0.5 })
        .to(lineSvg, {
            x: -200,
            duration: 1,
            ease: "power2.inOut"
        })
        .to(lineSvg, {
            x: 200,
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to(lineSvg, {
            x: 0,
            scale: 0.5,
            duration: 1,
            ease: "power2.inOut"
        })
        .to({}, { duration: 0.3 });

        // Square Animations
        gsap.set('#inner-square', {
            transformOrigin: "center center"
        });
        
        const squareTimeline = gsap.timeline({ repeat: -1 });
        
        squareTimeline.to('#inner-square', {
            rotation: 90,
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to('#inner-square', {
            rotation: 180,
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to('#inner-square', {
            rotation: 270,
            duration: 1.5,
            ease: "power2.inOut"
        })
        .to('#inner-square', {
            rotation: 360,
            duration: 1.5,
            ease: "power2.inOut"
        });

        // MOTG Animations
        const motgTimeline = gsap.timeline({ repeat: -1 });
        
        motgTimeline.to({}, { duration: 0.3 })
        .to('#inner-diamond', {
            attr: { d: 'M152.335 108L219.322 108L175.335 215.354L105.348 215.354Z' },
            duration: 1,
            ease: "power4.inOut"
        })
        .to({}, { duration: 0.4 })
        .to('#inner-diamond', {
            attr: { d: 'M152.335 108L172.335 108L172.335 215.354L152.335 215.354Z' },
            duration: 1,
            ease: "power4.inOut"
        })
        .to({}, { duration: 0.2 });

        // Company Animations
        gsap.set([block1, block2, block3, block4, block5], {
            opacity: 0,
            scale: 0.8,
            transformOrigin: "center center"
        });

        const companyTimeline = gsap.timeline({ repeat: -1 });

        companyTimeline.to(block1, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)"
        })
        .to(block2, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)"
        })
        .to(block3, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)"
        })
        .to(block4, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)"
        })
        .to(block5, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.4)"
        })
        .to(diagonalClipRect, {
            height: 237.354,
            y: 85,
            duration: 0.8,
            ease: "power4.inOut"
        })
        .to({}, { duration: 1.2 })
        .to(diagonalClipRect, {
            height: 0,
            y: 322.354,
            duration: 0.8,
            ease: "power4.inOut"
        })
        .to(block5, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.inOut"
        })
        .to(block4, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.inOut"
        })
        .to(block3, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.inOut"
        })
        .to(block2, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.inOut"
        })
        .to(block1, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.inOut"
        })
        .to({}, { duration: 0.8 });
    }

    // Initialize all animations
    initializeAllAnimations();
}


// ============================================================
// GRID OVERLAY TOGGLE
// ============================================================

function initGridOverlayToggle() {
  document.addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "G") {
      const gridOverlay = document.querySelector(".grid-overlay");
      if (gridOverlay) {
        gridOverlay.remove();
      } else {
        const overlay = document.createElement("div");
        overlay.className = "grid-overlay";
        for (let i = 0; i < 12; i++) {
          const column = document.createElement("div");
          overlay.appendChild(column);
        }
        document.body.appendChild(overlay);
      }
    }
  });
}




// ============================================================
// INITIALIZE ALL FUNCTIONS - REMOVED (Now using initializeApplication())
// ============================================================
// All initialization now happens in the single initializeApplication() function
// at the bottom of this file. Do not add initialization calls here.


// ============================================================
// WINDOW LOAD HANDLER
// ============================================================


// ============================================================
// IMAGE TRAIL
// ============================================================

function initImageTrail() {
    const MathUtils = {
        lerp: (a, b, n) => (1 - n) * a + n * b,
        distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
    };

    const trailContainer = document.querySelector('.images-trail');
    if (!trailContainer) return;

    const getMousePos = (ev) => {
        const rect = trailContainer.getBoundingClientRect();
        return { 
            x: ev.clientX - rect.left, 
            y: ev.clientY - rect.top 
        };
    };

    let mousePos = (lastMousePos = cacheMousePos = { x: 0, y: 0 });
    let isMouseInside = false;
    let hasMouseEntered = false;
    let imageTrailInstance = null;

    trailContainer.addEventListener("mousemove", (ev) => {
        if (!hasMouseEntered) return;
        mousePos = getMousePos(ev);
        isMouseInside = true;
    });

    trailContainer.addEventListener("mouseenter", (ev) => {
        mousePos = getMousePos(ev);
        lastMousePos = { ...mousePos };
        cacheMousePos = { ...mousePos };
        isMouseInside = true;
        hasMouseEntered = true;
        if (imageTrailInstance) {
            imageTrailInstance.startRendering();
        }
    });

    trailContainer.addEventListener("mouseleave", () => {
        isMouseInside = false;
    });

    const getMouseDistance = () => {
        if (!hasMouseEntered) return 0;
        return MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);
    };

    class Image {
        constructor(el) {
            this.DOM = { el: el };
            this.getRect();
        }

        getRect() {
            this.rect = this.DOM.el.getBoundingClientRect();
        }
        
        isActive() {
            return gsap.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
        }
    }

    class ImageTrail {
        constructor() {
            this.DOM = { content: trailContainer };
            this.images = [];
            [...this.DOM.content.querySelectorAll("img")].forEach((img) =>
                this.images.push(new Image(img))
            );
            this.imagesTotal = this.images.length;
            this.imgPosition = 0;
            this.zIndexVal = 1;
            this.threshold = 150;
            this.isRendering = false;
        }

        startRendering() {
            if (!this.isRendering) {
                this.isRendering = true;
                requestAnimationFrame(() => this.render());
            }
        }
        
        render() {
            if (!hasMouseEntered || !isMouseInside) {
                this.isRendering = false;
                return;
            }

            let distance = getMouseDistance();
            cacheMousePos.x = MathUtils.lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
            cacheMousePos.y = MathUtils.lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

            if (distance > this.threshold) {
                this.showNextImage();
                ++this.zIndexVal;
                this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
                lastMousePos = mousePos;
            }

            let isIdle = true;
            for (let img of this.images) {
                if (img.isActive()) {
                    isIdle = false;
                    break;
                }
            }
            if (isIdle && this.zIndexVal !== 1) {
                this.zIndexVal = 1;
            }

            if (this.isRendering) {
                requestAnimationFrame(() => this.render());
            }
        }
        
        showNextImage() {
            const img = this.images[this.imgPosition];
            gsap.killTweensOf(img.DOM.el);

            // Add active class to make visible
            img.DOM.el.classList.add('active');

            const tl = gsap.timeline({
                onComplete: () => {
                    // Remove active class when animation completes
                    img.DOM.el.classList.remove('active');
                }
            });
            
            tl.set(img.DOM.el, {
                opacity: 1,
                scale: 0,
              rotate:0,
                zIndex: this.zIndexVal,
                x: cacheMousePos.x - img.rect.width / 2,
                y: cacheMousePos.y - img.rect.height / 2,
                visibility: 'visible'
            })
            .to(img.DOM.el, {
                duration: 0.9,
              scale: 1,
                ease: "expo.out",
                x: mousePos.x - img.rect.width / 2,
                y: mousePos.y - img.rect.height / 2
            }, 0)
            .to(img.DOM.el, {
                duration: 1,
                ease: "power4.out",
                opacity: 0,
                scale: 0,
            }, 0.6);
        }
    }

    const preloadImages = () => {
        return new Promise((resolve) => {
            imagesLoaded(document.querySelectorAll(".trail"), resolve);
        });
    };

    // Ensure all images are hidden initially
    const hideAllImages = () => {
        document.querySelectorAll(".trail").forEach(img => {
            img.classList.remove('active');
            gsap.set(img, {
                opacity: 0,
                scale: 1,
                x: 0,
                y: 0,
                zIndex: 1,
                visibility: 'hidden'
            });
        });
    };

    preloadImages().then(() => {
        hideAllImages();
        imageTrailInstance = new ImageTrail();
    });
}


// ============================================================
// IMAGE PARALLAX
// ============================================================

function initImageParallax() {
  
  
  
  
  
       gsap.utils.toArray(".symbol").forEach(symbol => {
    gsap.fromTo(symbol,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: symbol,
          start: "top 100%",
          toggleActions: "play none none none"
        }
      }
    );
  });
   
   
     gsap.utils.toArray(".profile-image .image").forEach((img) => {
    gsap.fromTo(
      img,
      {
        clipPath: "inset(7% 7% 7% 7%)", 
        yPercent: 10,
        opacity: 1,
      },
      {
        scrollTrigger: {
          trigger: img,
          start: "top 100%",
          end: "bottom 0%",
          toggleActions: "play none none none",
        },
        duration: 1.5,
        clipPath: "inset(0% 0% 0% 0%)", 
        yPercent: 0,
        ease: "power4.out",
      }
    );
  });
  


if (window.innerWidth > 650 && !document.body.classList.contains('about-page')) {
  const footer = document.querySelector(".footer");
  if (!footer) return;

  const footerHeight = footer.offsetHeight;

  gsap.fromTo(footer,
    { yPercent: -30 },
    {
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: footer,
        start: "top 102%",
        end: `+=${footerHeight}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress === 1 || self.progress === 0) {
            gsap.set(footer, { clearProps: "transform" });
          }
        }
      }
    }
  );
}





  [
    { sel: ".one",   y: "20vw" },
    { sel: ".two",   y: "-10vw" },
    { sel: ".three", y:  "-30vw" }
  ].forEach(({ sel, y }) => {
    gsap.to(`.career-hero .grid ${sel}`, {
      y,
      ease: "none",
      scrollTrigger: {
        trigger: ".career-hero",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  [
    { sel: ".one",   y: "20vw" },
    { sel: ".two",   y: "-30vw" }
  ].forEach(({ sel, y }) => {
    gsap.to(`.part-two .grid ${sel}`, {
      y,
      ease: "none",
      scrollTrigger: {
        trigger: ".part-two",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
  
  
 gsap.utils.toArray('.image-wrapper img').forEach(img => {
    // Parallax scroll effect
    gsap.fromTo(
        img,
        { y: '-10%' },
        {
            y: '10%',
            ease: 'none',
            scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
            }
        }
    );

    // Apply hover only if inside .home
    if (img.closest('.home, .more-work')) {
        img.addEventListener('mouseenter', () => {
            gsap.to(img, {
                scale: 1.1,
                duration: 1.3,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        });

        img.addEventListener('mouseleave', () => {
            gsap.to(img, {
                scale: 1,
                duration: 1.3,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        });
    }
   

});
  
  
  
  gsap.fromTo(
  ".about-page section:nth-of-type(12) .center h1",
  {
    scale: 0.5
  },
  {
    scale: 1,
    duration: 1.2,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".about-page section:nth-of-type(12) .center h1",
      start: "top 100%",
      scrub: 0.3,
      toggleActions: "play none none none"
    }
  }
);

gsap.set(".about-page section:nth-of-type(17) .center .symbol-about", {
  clipPath: "inset(100% 0% 0% 0%)"
});

gsap.to(
  ".about-page section:nth-of-type(17) .center .symbol-about",
  { 
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 1.5,
    ease: "power4.inOut",
    scrollTrigger: {
      trigger: ".about-page section:nth-of-type(17) .center .symbol-about",
      start: "top 100%",
      toggleActions: "play none none none"
    }
  }
);

  
  
}


// ============================================================
// LINK CLICKS EVENT HANDLERS SETUP
// ============================================================

function setupLinkClicksEventHandlers() {
  // Add click event listener for internal links
  document.body.addEventListener('click', handleInternalLinkClicks);
  
  // Add popstate event listener for browser back/forward
  window.addEventListener('popstate', handlePopState);
}


// ============================================================
// HANDLE INTERNAL LINK CLICKS
// ============================================================

async function handleInternalLinkClicks(event) {
    const target = event.target.closest("a[href]");
    if (
        target &&
        target.id !== "toggle-button" &&
        !target.target &&
        !target.href.includes("#") &&
        !target.href.includes("mailto:") &&
        !target.href.includes("tel:")
    ) {
        event.preventDefault();

        const currentUrl = window.location.href;
        const targetUrl = target.href;
        const isThankYouPage = currentUrl.includes("/thank-you");

        if (currentUrl === targetUrl && !isThankYouPage) {
            pageTransition(targetUrl);
            return;
        }

        if (!isThankYouPage) {
            window.history.pushState({}, '', targetUrl);
            pageTransition(targetUrl);
        }
    }
}


// ============================================================
// PAGE TRANSITION
// ============================================================

async function pageTransition(url, isPopState = false) {
    if (window.transitioning) return;
    window.transitioning = true;

    // Kill all existing ScrollTrigger instances
    if (gsap.ScrollTrigger) {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    const overlayFirst = document.querySelector(".page-overlay-first");
    const overlaySecond = document.querySelector(".page-overlay-second");
    const cursor = document.querySelector(".cursor");

    gsap.set([overlayFirst, overlaySecond], {
        display: "block",
        visibility: "visible",
    });

    gsap.set(overlayFirst, {
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
        width: "18svh",
        height: "15svh",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        position: "fixed",
        zIndex: 9999
    });

    const transitionIn = gsap.timeline();
    transitionIn
        .to(overlayFirst, {
            clipPath: "polygon(62% 0, 86% 0, 42% 100%, 18% 100%)",
            duration: 0.6,
            ease: "power3.inOut"
        })
        .to(overlayFirst, {
            width: "100vw",
            height: "100svh",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            xPercent: 0,
            yPercent: 0,
            top: 0,
            left: 0,
            duration: 0.9,
            ease: "expo.inOut"
        })
  /*
  .to (".mega-menu-container", {
            opacity: 0.5,
            duration: 0.9,
      ease: "power3.out"
    
       })
       */
        .to(overlaySecond, {
            opacity: 0.5,
            duration: 1,
            ease: "power3.out",
        }, 0)
        .to(".logo img", { 
            yPercent: -100, 
            duration: 1, 
            ease: "power4.inOut",
        }, -0.1)
        .to(cursor, {
            scale: 0,
            duration: 0.5,
            ease: "power2.out"
        }, -0.1);

    await new Promise(resolve => setTimeout(resolve, 1420));

    if (!isPopState) {
        window.location.href = url;
    } else {
        // Reset everything before reloading
        resetAndReinitialize();
        window.location.reload();
    }
}


// ============================================================
// RESET AND REINITIALIZE
// ============================================================

function resetAndReinitialize() {
    // Kill all ScrollTrigger instances
    if (gsap.ScrollTrigger) {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    // Clear all timeouts
    if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
    }

    // Reset transitioning state
    window.transitioning = false;

    // Hide all text elements
    const elements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, .btn, .nav, .footer a, .name, .role, .link-box"
    );
    gsap.set(elements, { visibility: "hidden" });

    // Force a full page reflow
    document.body.offsetHeight;
}


// ============================================================
// HANDLE POPSTATE
// ============================================================

function handlePopState() {
    if (!window.transitioning) {
        resetAndReinitialize();
        // pageTransition with isPopState=true will reload the page
        // setupWindowLoadHandler will handle split text initialization after reload
        pageTransition(window.location.href, true);
    }
}


// ============================================================
// GSAP ANIMATIONS
// ============================================================

function initGsapAnimations() {
  


  gsap.fromTo(".clipping-video, .symbol-about", 
  { clipPath: "inset(100% 0% 0% 0%)" }, 
  { 
    clipPath: "inset(0% 0% 0% 0%)", 
    delay:0.6,
    duration: 1.5, 
    ease: "power4.inOut" 
  }
  );

  gsap.set("img, .burger", { opacity: 0 });
  gsap.to("img, .burger", { opacity: 1, duration: 1, ease: "power2.inOut" });
  

const visual = document.querySelector(".video-visual");
if (!visual) return;

const isMobile = window.innerWidth < 650;
const scrollEnd = isMobile ? 900 : 2000;

let playThumb;
let thumbClicked = false;

if (isMobile) {
  playThumb = document.createElement("div");
  playThumb.className = "play-thumb";
  playThumb.textContent = "Click to Play";
  visual.appendChild(playThumb);

  gsap.set(playThumb, { opacity: 0, pointerEvents: "auto" });

/*
  playThumb.addEventListener("click", () => {
    thumbClicked = true;
    playThumb.textContent = "Click to Pause";
  });


  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: `+=${scrollEnd}`,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: self => {
      if (!thumbClicked && self.progress > 0.05 && self.progress < 0.95) {
        gsap.to(playThumb, { opacity: 1, pointerEvents: "auto", duration: 0.3 });
      } else if (!thumbClicked) {
        gsap.to(playThumb, { opacity: 0, pointerEvents: "none", duration: 0.3 });
      }
    }
  });

    */
   
}
  

gsap.to(visual, {
  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  width: "100vw",
  height: "100svh",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: `+=${scrollEnd}`,
    scrub: 1,
    invalidateOnRefresh: true
  }
});




    gsap.to(".hero-headline", {
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".hero",
            start: "top 1%",
            end: "bottom 0%",
            scrub: 1,
        }
    });

    const isMobile2 = window.innerWidth < 650;
    const pinScrollEnd = isMobile2 ? 1200 : 3000;

    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${pinScrollEnd}`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onEnter: () => ScrollTrigger.getAll().forEach(st => {
            if (st.trigger !== document.querySelector(".hero")) st.disable();
        }),
        onLeave: () => ScrollTrigger.getAll().forEach(st => st.enable())
    });
  

    gsap.to(".header .logo", {
        opacity: 0,
        scrollTrigger: {
            trigger: ".footer",
            start: "top 60%",
            end: "top 20%",
            scrub: true,
        }
    });
  
  

  
  
}


// ============================================================
// MEGA MENU CORE
// ============================================================

let megaMenuState = null;

function initMegaMenu() {
    const sourceMenu = document.getElementById('source-menu');
    if (!sourceMenu) return;

    // Create scroll blocking wrapper
    const scrollBlocker = document.createElement('div');
    scrollBlocker.className = 'scroll-blocker';
    scrollBlocker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9;
        display: none;
        background: transparent;
        pointer-events: none;
    `;
    document.body.appendChild(scrollBlocker);

    const menuItems = Array.from(sourceMenu.querySelectorAll('.menu-item'));
    sourceMenu.style.display = 'none';

    const megaMenuContainer = document.createElement('div');
    megaMenuContainer.className = 'mega-menu-container';
    megaMenuContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9;
    `;
    document.body.appendChild(megaMenuContainer);
    gsap.set(megaMenuContainer, { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' });

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'menu-wrapper';
    menuWrapper.style.cssText = `
        position: relative;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
    `;
    const menuList = document.createElement('ul');
    menuList.className = 'infinite-menu';
    menuList.style.cssText = `
        position: relative;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
    `;

    menuWrapper.appendChild(menuList);
    menuWrapper.style.pointerEvents = 'auto';
    menuList.style.pointerEvents = 'auto';
    megaMenuContainer.appendChild(menuWrapper);

    let menuItemHeight = 0, totalMenuHeight = 0, wrapperHeight = 0;
    let currentScrollPosition = 0, smoothScrollY = 0;
    let menuItemsList;

    function fillMenu(menuWrapper, originalItems) {
        menuWrapper.innerHTML = '';
        wrapperHeight = menuWrapper.clientHeight || window.innerHeight;

        const temp = originalItems[0].cloneNode(true);
        temp.style.visibility = 'hidden';
        menuWrapper.appendChild(temp);
        menuItemHeight = temp.clientHeight || 1;
        menuWrapper.removeChild(temp);

        const minCount = Math.ceil((wrapperHeight * 3) / menuItemHeight);
        let items = [];
        // Repeat complete sets of original items until we have enough
        const fullSets = Math.ceil(minCount / originalItems.length);
        for (let i = 0; i < fullSets; i++) {
            items = items.concat(originalItems);
        }

        items.forEach(el => {
            // Ensure menu items are <a> tags for clickability
            let link = el.querySelector('a');
            if (!link) {
                link = document.createElement('a');
                link.href = '#';
                link.textContent = el.textContent.trim();
                el.innerHTML = '';
                el.appendChild(link);
            }
            const clone = el.cloneNode(true);
            clone.classList.add('menu-item');
            clone.querySelectorAll('br').forEach(br => br.remove());

            // --- Touch scroll/tap detection ---
            let touchStartY = null;
            let touchStartTime = null;
            clone.addEventListener('touchstart', function(e) {
                if (e.touches && e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                    touchStartTime = Date.now();
                }
            });
            function closeMenuHandler(e) {
                // For touchend, only close if it's a quick tap (less than 200ms)
                if (e.type === 'touchend' && touchStartY !== null) {
                    const touchEndY = e.changedTouches[0].clientY;
                    const touchDuration = Date.now() - touchStartTime;
                    
                    // If it's a quick tap and minimal movement, treat as a click
                    if (touchDuration < 200 && Math.abs(touchEndY - touchStartY) < 10) {
                        const link = e.target.closest('a');
                        if (link && megaMenuState) {
                            const menuToggle = document.querySelector('.menu-toggle');
                            megaMenuState.hide(menuToggle);
                            menuToggle?.classList.remove('clicked');
                        }
                    }
                } else if (e.type === 'click') {
                    // Handle desktop clicks
                    const link = e.target.closest('a');
                    if (link && megaMenuState) {
                        const menuToggle = document.querySelector('.menu-toggle');
                        megaMenuState.hide(menuToggle);
                        menuToggle?.classList.remove('clicked');
                    }
                }
                touchStartY = null;
                touchStartTime = null;
            }
            clone.addEventListener('click', closeMenuHandler);
            clone.addEventListener('touchend', closeMenuHandler);
            menuWrapper.appendChild(clone);
        });
    }

    function refresh(centerText) {
        fillMenu(menuList, menuItems);

        const existingImage = document.querySelector('.symbol-menu');
        if (existingImage) {
            menuWrapper.appendChild(existingImage);
        }

        menuItemsList = menuWrapper.querySelectorAll('.menu-item');
        totalMenuHeight = menuItemsList.length * menuItemHeight;

        menuWrapper.style.position = 'relative';
        menuItemsList.forEach(item => {
            item.style.position = 'absolute';
            item.style.left = 0;
            item.style.right = 0;
        });

        const centerOffset = wrapperHeight / 2 - menuItemHeight / 2;
        let activeIndex = 0;
        if (centerText) {
            const idx = Array.from(menuItemsList).findIndex(li => li.textContent.trim() === centerText);
            if (idx !== -1) activeIndex = idx;
        }
        currentScrollPosition = -activeIndex * menuItemHeight + centerOffset;
        smoothScrollY = currentScrollPosition;
      
      
      
    }

    function interpolate(start, end, factor) {
        return start * (1 - factor) + end * factor;
    }

    function adjustMenu(scroll) {
        menuItemsList.forEach((item, index) => {
            const y = index * menuItemHeight + scroll;
            const wrappedY = gsap.utils.wrap(-menuItemHeight, totalMenuHeight - menuItemHeight, y);
            item.style.transform = `translateY(${wrappedY}px)`;
        });
    }

    function updateActive() {
        const items = menuWrapper.querySelectorAll('.menu-item');
        const centerY = menuWrapper.getBoundingClientRect().top + menuWrapper.clientHeight / 2;
        let closest = null;
        let closestDist = Infinity;
        items.forEach(item => {
            const box = item.getBoundingClientRect();
            const itemCenter = box.top + box.height / 2;
            const dist = Math.abs(centerY - itemCenter);
            if (dist < closestDist) {
                closestDist = dist;
                closest = item;
            }
        });
        items.forEach(i => i.classList.remove('active'));
        if (closest) closest.classList.add('active');
    }

    megaMenuState = {
        isVisible: false,
        isAnimating: false,
        isTransitioning: false,
        rafId: null,
        refresh,
        show(menuToggle) {
            if (this.isVisible || this.isTransitioning) return;
            this.isVisible = true;
            this.isTransitioning = true;

            if (window.customSmoothScroll?.destroy) {
                window.customSmoothScroll.destroy();
                window.customSmoothScroll = null;
            }

            scrollBlocker.style.display = 'block';
            scrollBlocker.style.pointerEvents = 'none';

            this.refresh('Home');

            const pageWrapper = document.querySelector('.page-overlay-second');
            if (pageWrapper) {
                gsap.to(pageWrapper, { opacity: 0.2, duration: 1.2, ease: 'power4.out' });
            }

          gsap.set(".infinity-menu", { display: "block" });

          
            gsap.from('ul', {
                y: -500,
                opacity: 0.5,
                duration: 1.2,
                ease: 'power4.out'
            });

            gsap.set(megaMenuContainer, { clipPath: 'inset(100% 0% 0% 0%)' });
            gsap.to(megaMenuContainer, {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.8,
                ease: 'expo.out',
                onStart: () => this.startScrollLoop(),
                onComplete: () => { this.isTransitioning = false; }
            });

            if (menuToggle) {
                const bars = menuToggle.querySelectorAll('.menu-bar');
                gsap.to(bars[0], { top: '50%', duration: 0.6, ease: 'power2.out' });
                gsap.to(bars[1], { top: '50%', duration: 0.6, ease: 'power2.out' });
            }
        },
        hide(menuToggle) {
            if (!this.isVisible || this.isTransitioning) return;
            this.isVisible = false;
            this.isTransitioning = true;

            scrollBlocker.style.display = 'none';
            scrollBlocker.style.pointerEvents = 'none';

            const pageWrapper = document.querySelector('.page-overlay-second');
            if (pageWrapper) {
                gsap.to(pageWrapper, { opacity: 0, duration: 1, ease: 'power4.out' });
            }

            gsap.to(megaMenuContainer, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 0.8,
                ease: 'expo.out',
                onStart: () => this.stopScrollLoop(),
                onComplete: () => {
                    gsap.set(megaMenuContainer, { pointerEvents: 'none' });
                    this.isTransitioning = false;
                    // Re-enable smooth scrolling without resetting scroll position
                    if (window.customSmoothScroll && window.customSmoothScroll.restart) {
                        window.customSmoothScroll.restart();
                    } else if (typeof initCustomSmoothScrolling === 'function') {
                        initCustomSmoothScrolling();
                    }
                }
            });

            if (menuToggle) {
                const bars = menuToggle.querySelectorAll('.menu-bar');
                const isMobile = window.innerWidth < 650;
                const offset = isMobile ? '1.3vw' : '0.3vw';

                gsap.to(bars[0], { top: `calc(50% - ${offset})`, duration: 0.6, ease: 'power2.out' });
                gsap.to(bars[1], { top: `calc(50% + ${offset})`, duration: 0.6, ease: 'power2.out' });
            }
        },
        toggle(menuToggle) {
            if (this.isTransitioning) return;
            this.isVisible ? this.hide(menuToggle) : this.show(menuToggle);
        },
        startScrollLoop() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            this.loop();
        },
        stopScrollLoop() {
            this.isAnimating = false;
            cancelAnimationFrame(this.rafId);
        },
        loop() {
            if (!this.isAnimating) return;
            smoothScrollY = interpolate(smoothScrollY, currentScrollPosition, 0.07);
            adjustMenu(smoothScrollY);
            updateActive();
            this.rafId = requestAnimationFrame(this.loop.bind(this));
        }
    };

    megaMenuContainer.addEventListener('wheel', e => {
        e.preventDefault();
        e.stopPropagation();
        currentScrollPosition -= e.deltaY * 0.8;
    }, { passive: false });

    megaMenuContainer.addEventListener('touchstart', e => {
        // Only prevent default if we're not clicking a link
        if (!e.target.closest('a')) {
            e.preventDefault();
            e.stopPropagation();
        }
        megaMenuState.startY = e.touches[0].clientY;
        megaMenuState.isDragging = true;
    }, { passive: false });

    megaMenuContainer.addEventListener('touchmove', e => {
        if (!megaMenuState.isDragging) return;
        // Only prevent default if we're actually dragging
        if (Math.abs(e.touches[0].clientY - megaMenuState.startY) > 5) {
            e.preventDefault();
            e.stopPropagation();
        }
        const y = e.touches[0].clientY;
        currentScrollPosition += (y - megaMenuState.startY) * 2.5;
        megaMenuState.startY = y;
    }, { passive: false });

megaMenuContainer.addEventListener('touchend', () => {
    megaMenuState.isDragging = false;
});

  
  
    document.body.addEventListener('touchmove', (e) => {
        if (megaMenuState && megaMenuState.isVisible) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    document.body.addEventListener('wheel', (e) => {
        if (megaMenuState && megaMenuState.isVisible) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });


    refresh('Home');
}




// ============================================================
// MEGA MENU EVENT LISTENERS SETUP
// ============================================================

function setupMegaMenuEventListeners() {
  document.addEventListener('DOMContentLoaded', () => {
      initMegaMenu();
      const menuToggle = document.querySelector('.menu-toggle');
      if (menuToggle) {
          menuToggle.addEventListener('click', () => {
              if (megaMenuState) {
                  megaMenuState.toggle(menuToggle);
                  menuToggle.classList.toggle('clicked');
              }
          });
      }
  });

  window.addEventListener('resize', () => {
      if (megaMenuState && typeof megaMenuState.refresh === 'function') {
          megaMenuState.refresh('Home');
      }
  });
}








// ============================================================
// LOGOS LOOP
// ============================================================

function initLogosLoop() {
  const track = document.querySelector('.logos-track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }
}


// ============================================================
// CUSTOM SMOOTH SCROLLING
// ============================================================




function initCustomSmoothScrolling() {
    const lerp = (start, end, t) => start * (1 - t) + end * t;
    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
    let isSliderDragging = false;

    class CustomSmoothScroll {
        constructor() {
            const isMobile = window.innerWidth < 750;
            
            // Core settings
            this.wrapper = window;
            this.content = document.documentElement;
            this.lerp = isMobile ? 0.1 : 0.06; // Faster lerp for mobile
            this.duration = isMobile ? 1.5 : 1.2; // Shorter duration for mobile
            this.easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)); // Lenis easing function
            this.wheelMultiplier = 0.8; // Reduced wheel multiplier for gentler scrolling
            this.touchMultiplier = isMobile ? 3 : 1.5; // Reduced touch multiplier
            this.dragMultiplier = isMobile ? 3 : 1.8; // Reduced drag multiplier

            // Internal values
            this.targetScroll = 0;
            this.currentScroll = 0;
            this.scrollEnabled = false;
            this.isDragging = false; // Always false for mouse drag disabled
            this.startX = 0;
            this.startY = 0;
            this.lastFrameTime = performance.now();
            this.velocity = 0;
            this.direction = 0;
            this.currentTime = 0;
            this.isRunning = false;
            this.isRightClick = false;

            // Initialize
            this.init();
        }

        init() {
            this.applyStyles();
            this.updateDimensions();
            this.bindEvents();

            // Enable scrolling after a small delay
            setTimeout(() => {
                this.scrollEnabled = true;
                this.forceScrollUpdate();
                this.smoothScrollLoop();
            }, 10);
        }

        applyStyles() {
            document.body.style.overflow = "hidden";
            document.documentElement.style.scrollBehavior = "auto";
            document.documentElement.style.touchAction = "manipulation";
        }

        updateDimensions() {
            const wrapper = this.wrapper === window ? document.documentElement : this.wrapper;
            const content = this.content;

            this.dimensions = {
                width: wrapper.clientWidth,
                height: wrapper.clientHeight,
                scrollWidth: content.scrollWidth,
                scrollHeight: content.scrollHeight
            };

            // Update body height
            const scrollableContent = document.querySelector(".wrapper");
            if (scrollableContent) {
                document.body.style.height = `${scrollableContent.clientHeight}px`;
            }
        }

        bindEvents() {
            // Mouse Wheel Scroll
            window.addEventListener("wheel", (e) => {
                if (!this.scrollEnabled || isSliderDragging) return;
                const delta = e.deltaY * this.wheelMultiplier;
                this.onScroll(delta);
                e.preventDefault();
            }, { passive: false });

            // Touch Dragging
            window.addEventListener("touchstart", (e) => this.startTouchDrag(e), { passive: true });
            window.addEventListener("touchmove", (e) => this.onTouchDrag(e), { passive: false });
            window.addEventListener("touchend", () => this.endTouchDrag());

            // Completely disable mouse dragging by preventing any mouse events from affecting scroll
            window.addEventListener("mousedown", (e) => {
                e.preventDefault();
                return false;
            }, { passive: false });
            
            window.addEventListener("mousemove", (e) => {
                // Prevent any mouse movement from affecting scroll
                return false;
            }, { passive: false });

            // Mouse Dragging - DISABLED
            // window.addEventListener("mousedown", (e) => {
            //     // Track right click state
            //     if (e.button === 2) {
            //         this.isRightClick = true;
            //         return;
            //     }
            //     // Only start drag if not right click
            //     if (!this.isRightClick) {
            //         this.startMouseDrag(e);
            //     }
            // });
            // window.addEventListener("mousemove", (e) => this.onMouseDrag(e));
            // window.addEventListener("mouseup", () => {
            //     this.endMouseDrag();
            //     // Reset right click state after a short delay
            //     setTimeout(() => {
            //         this.isRightClick = false;
            //     }, 100);
            // });

            // Resize Event
            window.addEventListener("resize", () => {
                requestAnimationFrame(() => this.updateDimensions());
            });

            // Slider detection
            if (window.innerWidth < 767) {
                document.querySelectorAll(".slider").forEach((slider) => {
                    slider.addEventListener("touchstart", (e) => this.startSliderDrag(e), { passive: true });
                    slider.addEventListener("touchmove", (e) => this.detectSliderDrag(e), { passive: false });
                    slider.addEventListener("touchend", () => this.endSliderDrag());
                    slider.addEventListener("touchcancel", () => this.endSliderDrag());
                });
            }
        }

        onScroll(delta) {
            if (!this.scrollEnabled || isSliderDragging) return;

            // Reset animation time when new scroll starts
            this.currentTime = 0;

            // Calculate velocity and direction
            this.velocity = delta;
            this.direction = Math.sign(delta);

            // Get the actual scroll limit
            const scrollLimit = document.documentElement.scrollHeight - window.innerHeight;

            // Update target scroll with proper limit
            this.targetScroll = clamp(
                this.targetScroll + delta,
                0,
                scrollLimit
            );
        }

        startTouchDrag(e) {
            if (!this.scrollEnabled || isSliderDragging) return;
            // Only allow touch drag, not mouse drag
            this.isDragging = true;
            this.startY = e.touches[0].clientY;
        }

        onTouchDrag(e) {
            if (!this.isDragging || !this.scrollEnabled) return;

            const currentY = e.touches[0].clientY;
            const delta = (this.startY - currentY) * this.touchMultiplier;

            const atTop = Math.round(this.currentScroll) <= 0;
            const pullingDown = delta < 0;

            if (atTop && pullingDown) return;

            this.onScroll(delta);
            this.startY = currentY;
            e.preventDefault();
        }

        endTouchDrag() {
            this.isDragging = false;
        }

        startMouseDrag(e) {
            // Mouse drag disabled - do nothing
            return;
        }

        onMouseDrag(e) {
            // Mouse drag disabled - do nothing
            return;
        }

        endMouseDrag() {
            // Mouse drag disabled - do nothing
            return;
        }

        startSliderDrag(e) {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            isSliderDragging = false;
        }

        detectSliderDrag(e) {
            const deltaX = Math.abs(e.touches[0].clientX - this.startX);
            const deltaY = Math.abs(e.touches[0].clientY - this.startY);

            if (deltaX > deltaY && deltaX > 10) {
                isSliderDragging = true;
                e.preventDefault();
            }
        }

        endSliderDrag() {
            isSliderDragging = false;
        }

        forceScrollUpdate() {
            // Get current scroll position instead of resetting to 0
            const currentScrollY = window.scrollY || window.pageYOffset || 0;
            this.targetScroll = currentScrollY;
            this.currentScroll = currentScrollY;
        }

        smoothScrollLoop() {
            const now = performance.now();
            const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
            this.lastFrameTime = now;

            if (this.scrollEnabled) {
                // Calculate progress
                const progress = clamp(this.currentTime / this.duration, 0, 1);
                const completed = progress >= 1;
                
                // Calculate easing
                const easing = completed ? 1 : this.easing(progress);
                
                // Apply smooth scrolling with Lenis-style easing
                this.currentScroll = lerp(this.currentScroll, this.targetScroll, this.lerp);
                
                // Update time
                if (!completed) {
                    this.currentTime += deltaTime;
                }

                // Apply scroll
                window.scrollTo(0, this.currentScroll);

                // Reset if completed
                if (completed) {
                    this.currentTime = 0;
                }
            }

            requestAnimationFrame(() => this.smoothScrollLoop());
        }

        setEnableScroll(value) {
            this.scrollEnabled = value;
        }

        restart() {
            // Preserve current scroll position
            const currentScrollY = window.scrollY || window.pageYOffset;
            this.targetScroll = currentScrollY;
            this.currentScroll = currentScrollY;
            this.velocity = 0;
        }

        destroy() {
            this.scrollEnabled = false;
            document.body.style.overflow = "";
            document.body.style.height = "";
            document.documentElement.style.scrollBehavior = "";
            document.documentElement.style.touchAction = "";
            window.removeEventListener("wheel", this.onScroll);
            window.removeEventListener("touchstart", this.startTouchDrag);
            window.removeEventListener("touchmove", this.onTouchDrag);
            window.removeEventListener("touchend", this.endTouchDrag);
            window.removeEventListener("mousedown", this.startMouseDrag);
            window.removeEventListener("mousemove", this.onMouseDrag);
            window.removeEventListener("mouseup", this.endMouseDrag);
            window.removeEventListener("resize", this.updateDimensions);
        }
    }

    // Store instance globally so it can be restarted without resetting scroll
    if (window.customSmoothScroll && window.customSmoothScroll.destroy) {
        window.customSmoothScroll.destroy();
    }
    window.customSmoothScroll = new CustomSmoothScroll();
}


// ============================================================
// INTERACTIVE CURSOR
// ============================================================

function initInteractiveCursor() {
    if (window.innerWidth <= 650) return;

    const cursor = document.querySelector("#cursor");
    if (!cursor) return;

    // Reset any existing cursor state
    if (window.cursorAnimationFrame) {
        cancelAnimationFrame(window.cursorAnimationFrame);
    }
    if (window.cleanupCursor) {
        window.cleanupCursor();
    }

    const mouse = { x: -100, y: -100 };
    let isMoving = false;
    let isDragging = false;
    let cursorLocked = false;
    let cursorAnimationFrame;
    let dragTimeout;

    // Set initial cursor state
    gsap.set(cursor, { 
        xPercent: -50, 
        yPercent: -50,
        scale: 1,
        opacity: 1,
        visibility: "visible"
    });

    function trackMouse(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isMoving = true;
    }

    function animateCursor() {
        if (isMoving) {
            gsap.to(cursor, { 
                duration: 0.7, 
                x: mouse.x, 
                y: mouse.y, 
                ease: "power3.out" 
            });
            isMoving = false;
        }
        cursorAnimationFrame = requestAnimationFrame(animateCursor);
    }

    function resetCursor() {
        if (!cursorLocked) {
            cursor.classList.remove("change", "explore", "drag", "scroll", "enter", "play");
        }
    }

    function handleLinkEnter() {
        if (!cursorLocked) cursor.classList.add("change");
        cursor.classList.remove("explore", "scroll", "enter", "play");
    }

    function handleLinkLeave() {
        if (!cursorLocked) cursor.classList.remove("change");
    }

    function handleLinkClick() {
        resetCursor();
        cursorLocked = true;
        setTimeout(() => (cursorLocked = false), 1000);
    }

    function handleMouseDown() {
/*
        dragTimeout = setTimeout(() => {
            isDragging = true;
            cursor.classList.add("drag");
        }, 150);
        */
    }

    function handleMouseMove() {
        if (isDragging) cursor.classList.add("drag");
    }

    function handleMouseUp() {
        if (isDragging) {
            isDragging = false;
            cursor.classList.remove("drag");
        }
        clearTimeout(dragTimeout);
    }

    // Hover zones for different modes
    document.querySelectorAll(".hero, .scroll").forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("scroll"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("scroll"));
    });
  
      // Hover zones for different modes
    document.querySelectorAll(".gallery").forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("drag"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("drag"));
    });

    document.querySelectorAll(".work-thumbnail").forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("enter"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("enter"));
    });

    document.querySelectorAll(".click-disable").forEach(el => {
        // Only attach events if .click-disable is NOT inside a .work-content ancestor
        let insideWorkContent = !!el.closest('.work-content, .project-cover');
        if (!insideWorkContent) {
            el.addEventListener("mouseenter", () => cursor.classList.add("soon"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("soon"));
        }
    });

/*
document.querySelectorAll(".video-visual").forEach(el => {
    el.addEventListener("mouseenter", () => {
        cursor.classList.add("play");
        cursor.classList.remove("pause");
    });

    el.addEventListener("mouseleave", () => {
        cursor.classList.remove("pause");
        cursor.classList.remove("play");
    });

    el.addEventListener("click", () => {
        if (cursor.classList.contains("play")) {
            cursor.classList.remove("play");
            cursor.classList.add("pause");
        } else {
            cursor.classList.remove("pause");
            cursor.classList.add("play");
        }
    });
});
*/












    // Add event listeners
    document.addEventListener("mousemove", trackMouse);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Start animation
    animateCursor();

    // Store references for cleanup
    window.cursorAnimationFrame = cursorAnimationFrame;
    window.cleanupCursor = function () {
        cancelAnimationFrame(cursorAnimationFrame);
        document.removeEventListener("mousemove", trackMouse);
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };
}




// ============================================================
// NAVBAR SHOW/HIDE
// ============================================================

function initNavbarShowHide() {
    const navElements = document.querySelectorAll(".header");
    let lastScrollTop = 0;
    const isMobile = window.innerWidth < 650;
    const hideY = isMobile ? "-20vw" : "-8vw";
    let hasScrolledDown = false;
    let scrollHandler = null;

    // Force scroll to top and reset navbar position on initialization
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    lastScrollTop = 0;

    if (navElements.length) {
        navElements.forEach((nav) => {
            gsap.set(nav, { y: 0, position: "fixed", top: 0, left: 0, right: 0, zIndex: 999 });
        });

        // Remove any existing scroll handler
        if (window.navbarScrollHandler) {
            window.removeEventListener("scroll", window.navbarScrollHandler);
        }

        // Create new scroll handler
        scrollHandler = function() {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDelta = st - lastScrollTop;

            if (!hasScrolledDown && st > 0) {
                hasScrolledDown = true;
            }

const threshold = isMobile ? 500 : 1500;
if (!hasScrolledDown || st < threshold) return;
          
            if (st > lastScrollTop) {
                // Scrolling down - hide navbar
                navElements.forEach((nav) => {
                    gsap.to(nav, { y: hideY, duration: 1, ease: "power2.out" });
                });
            } else if (st < lastScrollTop && Math.abs(scrollDelta) > 5) {
                // Scrolling up - only show navbar if scroll delta is significant
                navElements.forEach((nav) => {
                    gsap.to(nav, { y: "0vw", duration: 1, ease: "power2.out" });
                });
            }

            lastScrollTop = Math.max(0, st);
        };

        // Store the handler reference globally
        window.navbarScrollHandler = scrollHandler;
        window.addEventListener("scroll", scrollHandler);
    }

    // Return cleanup function
    return {
        destroy: function() {
            if (window.navbarScrollHandler) {
                window.removeEventListener("scroll", window.navbarScrollHandler);
                window.navbarScrollHandler = null;
            }
            // Reset GSAP animations
            navElements.forEach((nav) => {
                gsap.killTweensOf(nav);
                gsap.set(nav, { clearProps: "all" });
            });
        }
    };
}


// ============================================================
// SCROLL DELAY - PREVENT SCROLLING FOR 2 SECONDS
// ============================================================

function initScrollDelay() {
    let scrollDisabled = true;
    
    // Prevent all scroll events for 2 seconds
    const preventScroll = (e) => {
        if (scrollDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };
    
    // Add scroll prevention to multiple event types
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (scrollDisabled && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'Home' || e.key === 'End' || e.key === ' ')) {
            e.preventDefault();
        }
    });
    
    // Enable scrolling after 2 seconds
    setTimeout(() => {
        scrollDisabled = false;
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
    }, 2000);
}




/* ==============================================
Slider Infinifty
============================================== */


function sliderInfinity() {
    class InfiniteHorizontalScroll {
    constructor(container) {
      if (!container) return;
      this.container = container;
      this.items = Array.from(this.container.children);
      if (this.items.length === 0) return;
      this.scrollX = 0;
      this.smoothScrollX = 0;
      this.touchStartY = 0;
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
      this.mouseStartX = 0;
      this.mouseDeltaX = 0;
      this.previousDeltaX = 0;
      this.isDragging = false;
      this.autoplaySpeed = 1;
      this.autoplayInterval = null;
      this.isAutoplayPaused = false;
      this.cloneItems();
      this.calculateDimensions();
      this.init();
    }
    
    cloneItems() {
      const fragmentBefore = document.createDocumentFragment();
      const fragmentAfter = document.createDocumentFragment();
      this.items.forEach((item) => {
        const cloneBefore = item.cloneNode(true);
        const cloneAfter = item.cloneNode(true);
        fragmentBefore.appendChild(cloneBefore);
        fragmentAfter.appendChild(cloneAfter);
      });
      this.container.insertBefore(fragmentBefore, this.container.firstChild);
      this.container.appendChild(fragmentAfter);
    }
    
    calculateDimensions() {
      this.totalWidth = 0;
      Array.from(this.container.children).forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const computedStyle = getComputedStyle(item);
        const marginRight = parseFloat(computedStyle.marginRight) || 0;
        this.totalWidth += itemRect.width + marginRight;
      });
      const originalWidth = this.totalWidth / 3;
      this.scrollX = originalWidth;
      this.smoothScrollX = originalWidth;
      this.container.style.transform = `translateX(${-this.scrollX}px)`;
    }
    
    init() {
      this.bindEvents();
      this.animate();
      this.startAutoplay();
      window.addEventListener("resize", () => {
        this.calculateDimensions();
        this.resetPosition();
      });
    }
    
    bindEvents() {
      document.addEventListener("wheel", (e) => this.handleWheel(e), { passive: false });
      document.addEventListener("touchstart", (e) => this.handleTouchStart(e), { passive: true });
      document.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
      document.addEventListener("touchend", () => this.handleTouchEnd());
      document.addEventListener("mousedown", (e) => this.handleMouseDown(e), { passive: false });
      document.addEventListener("mousemove", (e) => this.handleMouseMove(e), { passive: false });
      document.addEventListener("mouseup", () => this.handleMouseUp());
      document.addEventListener("mouseleave", () => this.handleMouseUp());
    }
    
    handleWheel(event) {
      if (event.target.closest("button, input, textarea, select")) return;
      event.preventDefault();
      this.pauseAutoplay();
      this.scrollX += event.deltaY * 1.5;
      this.handleInfiniteScroll();
      this.resumeAutoplayAfterDelay();
    }
    
    handleTouchStart(event) {
      this.pauseAutoplay();
      this.touchStartY = event.touches[0].clientY;
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
    }
    
    handleTouchMove(event) {
      event.preventDefault();
      if (window.innerWidth < 750) {
        const touchY = event.touches[0].clientY;
        this.touchDeltaY = touchY - this.touchStartY;
        const touchSpeed = 4;
        this.scrollX -= (this.touchDeltaY - this.previousDeltaY) * touchSpeed;
        this.previousDeltaY = this.touchDeltaY;
      }
      this.handleInfiniteScroll();
    }
    
    handleTouchEnd() {
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
      this.resumeAutoplayAfterDelay();
    }
    
    handleInfiniteScroll() {
      const originalWidth = this.totalWidth / 3;
      if (this.scrollX < 0) {
        this.scrollX += originalWidth;
        this.smoothScrollX += originalWidth;
      } else if (this.scrollX > this.totalWidth - originalWidth) {
        this.scrollX -= originalWidth;
        this.smoothScrollX -= originalWidth;
      }
    }
    
    handleMouseDown(event) {
      this.pauseAutoplay();
      this.isDragging = true;
      this.mouseStartX = event.clientX;
      this.mouseDeltaX = 0;
      this.previousDeltaX = 0;
      event.preventDefault();
    }
    
    handleMouseMove(event) {
      if (!this.isDragging) return;
      event.preventDefault();
      const mouseX = event.clientX;
      this.mouseDeltaX = mouseX - this.mouseStartX;
      const mouseSpeed = 2;
      this.scrollX -= (this.mouseDeltaX - this.previousDeltaX) * mouseSpeed;
      this.previousDeltaX = this.mouseDeltaX;
      this.handleInfiniteScroll();
    }
    
    handleMouseUp() {
      if (this.isDragging) {
        this.isDragging = false;
        this.mouseDeltaX = 0;
        this.previousDeltaX = 0;
        this.resumeAutoplayAfterDelay();
      }
    }
    
    startAutoplay() {
      this.autoplayInterval = setInterval(() => {
        if (!this.isAutoplayPaused) {
          this.scrollX += this.autoplaySpeed;
          this.handleInfiniteScroll();
        }
      }, 16);
    }
    
    pauseAutoplay() {
      this.isAutoplayPaused = true;
    }
    
    resumeAutoplayAfterDelay() {
      clearTimeout(this.autoplayTimeout);
      this.isAutoplayPaused = false;
    }
    
    resetPosition() {
      const originalWidth = this.totalWidth / 3;
      this.scrollX = originalWidth;
      this.smoothScrollX = originalWidth;
      this.container.style.transform = `translateX(${-this.scrollX}px)`;
    }
    
    animate() {
      this.smoothScrollX += (this.scrollX - this.smoothScrollX) * 0.06;
      this.container.style.transform = `translateX(${-this.smoothScrollX}px)`;
      requestAnimationFrame(() => this.animate());
    }
    }
    
    // Initialize for all galleries that should have infinite scroll
    const gallerySelectors = [".works-container", ".gallery-container", ".infinite-scroll"];
    gallerySelectors.forEach(selector => {
      const containers = document.querySelectorAll(selector);
      containers.forEach(container => {
        new InfiniteHorizontalScroll(container);
      });
    });
    }
    

    sliderInfinity();

// ============================================================
// MASTER INITIALIZATION - SINGLE ENTRY POINT
// ============================================================


function initializeApplication() {
    // Disable scroll for 2 seconds to allow galleries and videos to load
    initScrollDelay();

/*    initLogosLoop();*/
    initGsapAnimations();
    setupSplitTextEventListeners();
    setupLinkClicksEventHandlers();
    initNavbarShowHide();
    initScrollRestoration();
    setupMegaMenuEventListeners();
    initCustomSmoothScrolling();
    // Initialize Vimeo videos
    initVimeoVideos();
  setTimeout(() => {
    initSplitTextAnimations();
  }, 800);

    initInteractiveCursor();
    refreshbreakingpoints();
    initShowreelToggle();
    extraTabs();
    tabsAccordion();
    initGridOverlayToggle();
    initImageParallax();
    initInfinityGallery();
    initSvgAnimations();
    initImageTrail();
 
}

// SINGLE INITIALIZATION CALL
initializeApplication();






