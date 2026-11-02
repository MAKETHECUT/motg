function initScrollRestoration() {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

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
            window.addEventListener("wheel", (e) => {
                if (!this.scrollEnabled || isSliderDragging) return;
                if (e.target.closest('.has-video-embed')) return;

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
                if (e.target.closest('input, textarea, select, button, [contenteditable], .w-input, .w-select, .w-checkbox-input, .w-radio-input')) {
                    return;
                }
                e.preventDefault();
                return false;
            }, { passive: false });
            
            window.addEventListener("mousemove", (e) => {
                if (e.target.closest('input, textarea, select, button, [contenteditable], .w-input, .w-select, .w-checkbox-input, .w-radio-input')) {
                    return;
                }
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

export { initScrollRestoration, initCustomSmoothScrolling, initScrollDelay };
