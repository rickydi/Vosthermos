document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // ELEMENTS
    // ============================================
    const sliderTrack = document.getElementById('slider-track');
    const slides = document.querySelectorAll('.slide');
    const navDotsContainer = document.getElementById('nav-dots');
    const menuToggle = document.getElementById('menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');
    const logoLink = document.getElementById('logo-link');
    const btnContactFixed = document.getElementById('btn-contact-fixed');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');

    // ============================================
    // STATE
    // ============================================
    let currentSlide = 0;
    let isAnimating = false;
    window.isAnimating = false;
    const totalSlides = slides.length;

    // ============================================
    // NAVIGATION DOTS
    // ============================================
    slides.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.classList.add('nav-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', 'Section ' + (i + 1));
        dot.addEventListener('click', function () {
            goToSlide(i);
        });
        navDotsContainer.appendChild(dot);
    });

    function updateDots() {
        var dots = navDotsContainer.querySelectorAll('.nav-dot');
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // ============================================
    // SLIDE NAVIGATION
    // ============================================
    function goToSlide(index) {
        if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;

        // Reset contact section scroll before leaving
        if (currentSlide === totalSlides - 1) {
            var contactScroll = slides[currentSlide].querySelector('.slide-content-scroll');
            if (contactScroll) contactScroll.scrollTop = 0;
        }

        isAnimating = true;
        window.isAnimating = true;

        // Remove active from previous slide
        slides[currentSlide].classList.remove('active');

        currentSlide = index;

        // Apply transform
        var offset = -(currentSlide * window.innerWidth);
        sliderTrack.style.transform = 'translateX(' + offset + 'px)';

        // Set active on new slide
        slides[currentSlide].classList.add('active');
        updateDots();
        updateContactBarVisibility();

        // Unlock after animation completes
        setTimeout(function () {
            isAnimating = false;
            window.isAnimating = false;
        }, 850);
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
    }

    // Expose globally
    window.goToSlide = goToSlide;

    // Initialize first slide
    slides[0].classList.add('active');
    sliderTrack.style.transform = 'translateX(0px)';

    // ============================================
    // CONTACT BAR VISIBILITY
    // ============================================
    function updateContactBarVisibility() {
        if (slides[currentSlide].id === 'contact') {
            document.body.classList.add('on-contact');
        } else {
            document.body.classList.remove('on-contact');
        }
    }

    btnContactFixed.addEventListener('click', function () {
        goToSlide(totalSlides - 1);
    });

    // ============================================
    // HAMBURGER MENU
    // ============================================
    menuToggle.addEventListener('click', function () {
        menuToggle.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    menuLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            menuToggle.classList.remove('active');
            menuOverlay.classList.remove('active');

            // Check for login link
            if (this.id === 'menu-login-link' || !this.hasAttribute('data-index')) {
                window.location.href = this.getAttribute('href');
                return;
            }

            var index = parseInt(this.dataset.index);
            if (!isNaN(index)) {
                isAnimating = false;
                window.isAnimating = false;
                setTimeout(function () {
                    goToSlide(index);
                }, 100);
            }
        });
    });

    // Logo click -> go to home
    logoLink.addEventListener('click', function (e) {
        e.preventDefault();
        isAnimating = false;
        window.isAnimating = false;
        goToSlide(0);
    });

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    document.addEventListener('keydown', function (e) {
        // Skip if lightbox is open
        if (lightbox.classList.contains('visible')) return;

        if (e.key === 'ArrowLeft') prevSlide();
        else if (e.key === 'ArrowRight') nextSlide();
    });

    // ============================================
    // MOUSE WHEEL NAVIGATION
    // ============================================
    var wheelTimer = null;
    document.addEventListener('wheel', function (e) {
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        // Check if current slide has scrollable content
        var currentEl = slides[currentSlide];
        var scrollable = currentEl.querySelector('.slide-content-scroll');
        if (scrollable && scrollable.contains(e.target)) {
            var isAtTop = scrollable.scrollTop <= 5;
            var isAtBottom = scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight + 5;

            // Scrolling up at top -> go to previous slide
            if (e.deltaY < 0 && isAtTop) {
                e.preventDefault();
            }
            // Let vertical scroll happen otherwise
            else {
                return;
            }
        } else {
            e.preventDefault();
        }

        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(function () {
            if (e.deltaY > 0) nextSlide();
            else prevSlide();
        }, 60);
    }, { passive: false });

    // ============================================
    // TOUCH / SWIPE NAVIGATION
    // ============================================
    var touchStartX = 0;
    var touchStartY = 0;
    var touchHandled = false;
    var minSwipe = 40;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchHandled = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        if (touchHandled || isAnimating) return;

        var dx = e.changedTouches[0].screenX - touchStartX;
        var dy = e.changedTouches[0].screenY - touchStartY;

        // Horizontal swipe
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
            touchHandled = true;
            if (dx > 0) prevSlide();
            else nextSlide();
        }
    }, { passive: true });

    // ============================================
    // RESIZE HANDLER
    // ============================================
    var resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            var offset = -(currentSlide * window.innerWidth);
            sliderTrack.style.transition = 'none';
            sliderTrack.style.transform = 'translateX(' + offset + 'px)';
            // Re-enable transition
            requestAnimationFrame(function () {
                sliderTrack.style.transition = '';
            });
        }, 150);
    });

    // ============================================
    // LIGHTBOX
    // ============================================
    var currentGallery = [];
    var currentGalleryIndex = 0;

    function openLightbox(images, index) {
        currentGallery = images;
        currentGalleryIndex = index;
        lightboxImg.src = images[index].src;
        lightboxCounter.textContent = (index + 1) + ' / ' + images.length;
        lightbox.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.style.overflow = '';
        setTimeout(function () { lightboxImg.src = ''; }, 300);
    }

    function lightboxNext() {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
        lightboxImg.src = currentGallery[currentGalleryIndex].src;
        lightboxCounter.textContent = (currentGalleryIndex + 1) + ' / ' + currentGallery.length;
    }

    function lightboxPrev() {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
        lightboxImg.src = currentGallery[currentGalleryIndex].src;
        lightboxCounter.textContent = (currentGalleryIndex + 1) + ' / ' + currentGallery.length;
    }

    // Collect galleries per slide
    document.querySelectorAll('.gallery').forEach(function (gallery) {
        var images = [];
        gallery.querySelectorAll('.gallery-item img').forEach(function (img) {
            images.push(img);
        });

        gallery.querySelectorAll('.gallery-item').forEach(function (item, i) {
            item.addEventListener('click', function () {
                openLightbox(images, i);
            });
        });
    });

    // Lightbox controls
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) {
        e.stopPropagation();
        lightboxNext();
    });
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) {
        e.stopPropagation();
        lightboxPrev();
    });

    // Click on backdrop closes lightbox
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Lightbox keyboard
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('visible')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowRight') lightboxNext();
        else if (e.key === 'ArrowLeft') lightboxPrev();
    });

    // Lightbox swipe
    var lbTouchStart = 0;
    lightbox.addEventListener('touchstart', function (e) {
        lbTouchStart = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var diff = e.changedTouches[0].screenX - lbTouchStart;
        if (Math.abs(diff) > 50) {
            if (diff < 0) lightboxNext();
            else lightboxPrev();
        }
    }, { passive: true });

    // Prevent image click from closing lightbox
    lightboxImg.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});
