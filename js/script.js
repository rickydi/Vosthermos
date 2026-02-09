document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // MOBILE MENU
    // ============================================
    var menuToggle = document.getElementById('menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    var header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(0,37,48,0.98)';
            } else {
                header.style.background = 'rgba(0,37,48,0.95)';
            }
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var headerHeight = header ? header.offsetHeight : 72;
                var top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // GALLERY FILTER
    // ============================================
    var galleryTabs = document.querySelectorAll('.gallery-tab');
    var galleryItems = document.querySelectorAll('.gallery-item');

    galleryTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var filter = this.dataset.filter;

            galleryTabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            galleryItems.forEach(function (item) {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // ============================================
    // LIGHTBOX
    // ============================================
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCounter = document.getElementById('lightbox-counter');

    if (lightbox) {
        var allImages = [];
        var currentIdx = 0;

        // Collect all visible gallery images
        function getVisibleImages() {
            var imgs = [];
            document.querySelectorAll('.gallery-item:not(.hidden) img').forEach(function (img) {
                imgs.push(img);
            });
            return imgs;
        }

        document.querySelectorAll('.gallery-item').forEach(function (item) {
            item.addEventListener('click', function () {
                allImages = getVisibleImages();
                var clickedImg = this.querySelector('img');
                currentIdx = allImages.indexOf(clickedImg);
                if (currentIdx === -1) currentIdx = 0;
                showLightboxImage();
                lightbox.classList.add('visible');
            });
        });

        function showLightboxImage() {
            if (allImages[currentIdx]) {
                lightboxImg.src = allImages[currentIdx].src;
                lightboxImg.alt = allImages[currentIdx].alt;
                lightboxCounter.textContent = (currentIdx + 1) + ' / ' + allImages.length;
            }
        }

        function closeLightbox() {
            lightbox.classList.remove('visible');
            setTimeout(function () { lightboxImg.src = ''; }, 300);
        }

        function nextImage() {
            currentIdx = (currentIdx + 1) % allImages.length;
            showLightboxImage();
        }

        function prevImage() {
            currentIdx = (currentIdx - 1 + allImages.length) % allImages.length;
            showLightboxImage();
        }

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); nextImage(); });
        lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); prevImage(); });
        lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
        lightboxImg.addEventListener('click', function (e) { e.stopPropagation(); });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('visible')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowRight') nextImage();
            else if (e.key === 'ArrowLeft') prevImage();
        });

        // Swipe support
        var touchX = 0;
        lightbox.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
        lightbox.addEventListener('touchend', function (e) {
            var diff = e.changedTouches[0].screenX - touchX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) nextImage(); else prevImage();
            }
        }, { passive: true });
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    var fadeElements = document.querySelectorAll('.service-card, .step-card, .testimonial-card, .sector-card, .gallery-item, .contact-form-wrap, .contact-info-card');

    fadeElements.forEach(function (el) {
        el.classList.add('fade-up');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(function (el) { observer.observe(el); });
});
