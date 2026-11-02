let megaMenuState = null;

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
  const initializeMenu = () => {
      initMegaMenu();
      const menuToggle = document.querySelector('.menu-toggle');
      if (menuToggle && !menuToggle.dataset.megaMenuBound) {
          menuToggle.dataset.megaMenuBound = "true";
          menuToggle.addEventListener('click', () => {
              if (megaMenuState) {
                  megaMenuState.toggle(menuToggle);
                  menuToggle.classList.toggle('clicked');
              }
          });
      }
  };

  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeMenu, { once: true });
  } else {
      initializeMenu();
  }

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


function sliderInfinity() {
    class InfiniteHorizontalScroll {
    constructor(container) {
      if (!container) return;
      this.container = container;
      this.items = Array.from(this.container.children);
      if (this.items.length === 0) return;
      this.scrollX = 0;
      this.smoothScrollX = 0;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this.previousDeltaX = 0;
      this.mouseStartX = 0;
      this.mouseDeltaX = 0;
      this.previousDeltaX = 0;
      this.isDragging = false;
      this.autoplaySpeed = 2;
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
      this.touchStartX = event.touches[0].clientX;
      this.touchDeltaX = 0;
      this.previousDeltaX = 0;
    }
    
    handleTouchMove(event) {
      event.preventDefault();
      const touchX = event.touches[0].clientX;
      this.touchDeltaX = touchX - this.touchStartX;
      const touchSpeed = 2;
      this.scrollX -= (this.touchDeltaX - this.previousDeltaX) * touchSpeed;
      this.previousDeltaX = this.touchDeltaX;
      this.handleInfiniteScroll();
    }
    
    handleTouchEnd() {
      this.touchDeltaX = 0;
      this.previousDeltaX = 0;
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

  const gallerySelectors = [".works-container", ".gallery-container", ".infinite-scroll"];
  gallerySelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((container) => {
      new InfiniteHorizontalScroll(container);
    });
  });
}

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
