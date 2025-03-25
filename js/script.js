document.addEventListener('DOMContentLoaded', function() {
    // Préchargeur
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
        }, 500);
    });

    // Navigation par points
    const homeRollItems = document.querySelectorAll('.home-roll-item');
    const navDots = document.querySelector('.navigation-dots');
    
    // Créer les points de navigation
    homeRollItems.forEach((item, index) => {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        if (index === 0) dot.classList.add('active');
        dot.dataset.index = index;
        navDots.appendChild(dot);
        
        dot.addEventListener('click', function() {
            scrollToSlide(index);
        });
    });

    // Menu mobile
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.menu-w');
    const menuLinks = document.querySelectorAll('.menu-nav-link');
    
    menuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('active');
            menuOverlay.classList.remove('active');
            const index = parseInt(this.dataset.index);
            scrollToSlide(index);
        });
    });

    // Navigation par hitbox (curseur à droite et à gauche)
    const prevHitbox = document.querySelector('[data-hitbox="PREV"]');
    const nextHitbox = document.querySelector('[data-hitbox="NEXT"]');
    
    prevHitbox.addEventListener('click', function() {
        navigateSlide(-1);
    });
    
    nextHitbox.addEventListener('click', function() {
        navigateSlide(1);
    });

    // Variables pour le défilement horizontal
    const homeRollW = document.querySelector('.home-roll-w');
    let currentSlide = 0;
    let isAnimating = false;
    let startX, startScrollLeft;
    let isDragging = false;

    // Fonction pour naviguer entre les slides
    function navigateSlide(direction) {
        if (isAnimating) return;
        
        const newSlide = currentSlide + direction;
        if (newSlide < 0 || newSlide >= homeRollItems.length) return;
        
        scrollToSlide(newSlide);
    }

    // Fonction pour scrolle vers une slide spécifique
    function scrollToSlide(index) {
        if (isAnimating || index === currentSlide) return;
        
        isAnimating = true;
        currentSlide = index;
        
        // Mettre à jour les classes actives
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        homeRollItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Effectuer le défilement
        const slideWidth = homeRollItems[0].offsetWidth;
        homeRollW.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        homeRollW.style.transform = `translateX(-${slideWidth * index}px)`;
        
        setTimeout(() => {
            isAnimating = false;
        }, 1000);
    }

    // Activer la première slide
    setTimeout(() => {
        homeRollItems[0].classList.add('active');
    }, 500);
    
    // Gestion des boutons qui mènent à la section contact
    const contactButtons = document.querySelectorAll('.explore-btn-w');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Empêcher le comportement par défaut du lien
            e.preventDefault();
            
            // Obtenir l'index de la section de contact (généralement la dernière section)
            const contactIndex = Array.from(homeRollItems).length - 1;
            
            // Faire défiler jusqu'à la section de contact
            scrollToSlide(contactIndex);
        });
    });

    // Navigation clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateSlide(-1);
        } else if (e.key === 'ArrowRight') {
            navigateSlide(1);
        }
    });

    // Navigation par molette de souris
    let wheelTimer;
    document.addEventListener('wheel', function(e) {
        clearTimeout(wheelTimer);
        
        wheelTimer = setTimeout(() => {
            if (e.deltaY > 0) {
                navigateSlide(1);
            } else {
                navigateSlide(-1);
            }
        }, 50);
    }, { passive: true });

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simuler l'envoi du formulaire
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
            
            // Simuler un délai d'envoi
            setTimeout(() => {
                submitBtn.textContent = 'Envoyé avec succès!';
                submitBtn.style.backgroundColor = '#28a745';
                
                // Réinitialiser le formulaire
                this.reset();
                
                // Rétablir le bouton après 3 secondes
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // Ajouter la classe 'active' au premier élément
    if (homeRollItems.length > 0) {
        homeRollItems[0].classList.add('active');
        scrollToSlide(0);
    }
});
