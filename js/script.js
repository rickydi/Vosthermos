// Script principal pour Vosthermos

document.addEventListener('DOMContentLoaded', function() {
    // Variables principales
    const body = document.body;
    const homeRollWrapper = document.querySelector('[data-roll="wrapper"]');
    const homeRollContainer = document.querySelector('[data-roll="container"]');
    const homeRollItems = document.querySelectorAll('[data-roll="item"]');
    const totalSlides = homeRollItems.length;
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menuW = document.querySelector('.menu-w');
    const cursorBox = document.querySelector('.cursor-box');
    const cursorW = document.querySelector('.cursor-w');
    const prevBtn = document.querySelector('[data-hitbox="PREV"]');
    const nextBtn = document.querySelector('[data-hitbox="NEXT"]');
    const navDotsContainer = document.querySelector('.navigation-dots');
    const menuNavLinks = document.querySelectorAll('.menu-nav-link');
    const preloader = document.querySelector('.preloader');
    
    // Charger les images depuis localStorage
    loadImagesFromStorage();

    // Variables d'état
    let currentSlide = 0;
    let isScrolling = false;
    let startX, startY;
    let isDragging = false;
    let lastScrollTime = 0;
    const scrollCooldown = 1000; // Temps de cooldown en ms

    // Initialisation
    init();

    function init() {
        createNavDots();
        setupEventListeners();
        activateSlide(0);
        
        // Masquer le préchargeur après 1.5s
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 1500);
    }

    function createNavDots() {
        if (!navDotsContainer) return;

        // Créer les points de navigation
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            dot.setAttribute('data-index', i);

            dot.addEventListener('click', function() {
                goToSlide(parseInt(this.getAttribute('data-index')));
            });

            navDotsContainer.appendChild(dot);
        }

        // Activer le premier point
        document.querySelector('.nav-dot[data-index="0"]').classList.add('active');
    }

    function setupEventListeners() {
        // Gestionnaire de défilement
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Gestionnaire de touche clavier (flèches)
        window.addEventListener('keydown', handleKeyDown);

        // Gestionnaires d'événements tactiles
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        // Gestionnaires de glisser-déposer (souris)
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Boutons précédent/suivant
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Menu mobile
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Liens du menu
        menuNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Fermer le menu mobile
                if (menuW.classList.contains('active')) {
                    toggleMobileMenu();
                }
                
                // Naviguer vers la slide correspondante
                const index = parseInt(this.getAttribute('data-index'));
                if (!isNaN(index)) {
                    e.preventDefault();
                    goToSlide(index);
                }
            });
        });

        // Curseur personnalisé sur les boutons de navigation
        if (cursorBox) {
            prevBtn.addEventListener('mouseenter', () => showCursor('PREV'));
            prevBtn.addEventListener('mouseleave', hideCursor);
            nextBtn.addEventListener('mouseenter', () => showCursor('NEXT'));
            nextBtn.addEventListener('mouseleave', hideCursor);
        }

        // Gestion du formulaire de contact
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }

        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', handleResize);
    }

    // Fonctions de navigation
    function goToSlide(index) {
        // Vérifier si nous pouvons défiler (cooldown)
        const now = new Date().getTime();
        if (now - lastScrollTime < scrollCooldown) return;
        lastScrollTime = now;

        // Boucler si on dépasse les limites
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        // Mettre à jour l'état
        currentSlide = index;

        // Animer le défilement
        activateSlide(currentSlide);
    }

    function activateSlide(index) {
        // Calculer la position de défilement
        const slideWidth = window.innerWidth;
        const scrollPos = index * slideWidth;

        // Animer le défilement
        if (homeRollContainer) {
            homeRollContainer.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            homeRollContainer.style.transform = `translateX(-${scrollPos}px)`;
        }

        // Mettre à jour les classes actives
        homeRollItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Mettre à jour les points de navigation
        updateNavDots(index);

        // Ajuster l'opacité de l'arrière-plan en fonction de la slide active
        const backgroundImage = document.getElementById('background-image');
        if (backgroundImage) {
            // Réduire l'opacité progressivement en fonction de l'index de la slide
            const opacity = Math.max(0.05, 0.2 - (index * 0.03));
            backgroundImage.style.opacity = opacity;
        }
    }

    function updateNavDots(index) {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // Gestionnaires d'événements
    function handleWheel(e) {
        e.preventDefault();

        // Si nous sommes en train de défiler, ignorer
        if (isScrolling) return;
        isScrolling = true;

        // Déterminer la direction
        if (e.deltaY > 0) {
            nextSlide();
        } else {
            prevSlide();
        }

        // Définir un délai pour permettre la fin de l'animation
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    function handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                prevSlide();
                break;
        }
    }

    // Gestion des événements tactiles
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        // Empêcher le défilement par défaut
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;

        // Calculer la distance
        const diffX = startX - currentX;
        const diffY = startY - currentY;

        // Si le mouvement horizontal est plus important que le mouvement vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Défilement temporaire pour le feedback visuel
            const slideWidth = window.innerWidth;
            const scrollPos = currentSlide * slideWidth + diffX;

            if (homeRollContainer) {
                homeRollContainer.style.transition = 'none';
                homeRollContainer.style.transform = `translateX(-${scrollPos}px)`;
            }
        }
    }

    function handleTouchEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        const currentX = e.changedTouches[0].clientX;
        const diffX = startX - currentX;

        // Déterminer s'il s'agit d'un swipe
        const threshold = window.innerWidth * 0.15; // 15% de la largeur de l'écran

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            // Revenir à la diapositive actuelle
            activateSlide(currentSlide);
        }
    }

    // Gestion des événements de la souris
    function handleMouseDown(e) {
        // Vérifier si l'événement ne provient pas des zones interactives comme les formulaires ou boutons
        if (e.target.closest('form') || e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
            return;
        }

        startX = e.clientX;
        isDragging = true;
        body.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!isDragging) return;

        const currentX = e.clientX;
        const diffX = startX - currentX;

        // Défilement temporaire pour le feedback visuel
        const slideWidth = window.innerWidth;
        const scrollPos = currentSlide * slideWidth + diffX;

        if (homeRollContainer) {
            homeRollContainer.style.transition = 'none';
            homeRollContainer.style.transform = `translateX(-${scrollPos}px)`;
        }
    }

    function handleMouseUp(e) {
        if (!isDragging) return;
        isDragging = false;
        body.style.cursor = '';

        const currentX = e.clientX;
        const diffX = startX - currentX;

        // Déterminer s'il s'agit d'un glisser
        const threshold = window.innerWidth * 0.15; // 15% de la largeur de l'écran

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            // Revenir à la diapositive actuelle
            activateSlide(currentSlide);
        }
    }

    // Gestion du curseur personnalisé
    function showCursor(direction) {
        if (!cursorW) return;

        cursorW.classList.add('active');

        // Mettre à jour le texte du curseur
        const cursorText = cursorW.querySelector('[data-cursor="text"]');
        if (cursorText) {
            cursorText.textContent = direction === 'PREV' ? 'PRÉCÉDENT' : 'SUIVANT';
        }

        // Déplacer le curseur en fonction de la position de la souris
        document.addEventListener('mousemove', moveCursor);
    }

    function hideCursor() {
        if (!cursorW) return;

        cursorW.classList.remove('active');
        document.removeEventListener('mousemove', moveCursor);
    }

    function moveCursor(e) {
        if (!cursorW) return;

        const x = e.clientX;
        const y = e.clientY;

        cursorW.style.left = `${x}px`;
        cursorW.style.top = `${y}px`;
    }

    // Toggle du menu mobile
    function toggleMobileMenu() {
        if (!mobileMenuBtn || !menuW) return;

        mobileMenuBtn.classList.toggle('active');
        menuW.classList.toggle('active');

        if (menuW.classList.contains('active')) {
            // Désactiver le défilement du body
            body.style.overflow = 'hidden';
        } else {
            // Réactiver le défilement
            body.style.overflow = '';
        }
    }

    // Gestion du formulaire de contact
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validation du formulaire
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value;
        
        // Vérification des champs obligatoires
        if (!name || !email || !phone || !service || !message) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        // Vérification de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Veuillez entrer une adresse email valide.');
            return;
        }
        
        // Simuler l'envoi du formulaire (remplacer par l'envoi réel plus tard)
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Afficher un message de succès
            const formSuccess = document.createElement('div');
            formSuccess.className = 'form-success-message';
            formSuccess.textContent = 'Votre message a été envoyé avec succès! Nous vous contacterons bientôt.';
            
            // Ajouter le message au formulaire
            e.target.appendChild(formSuccess);
            
            // Réinitialiser le formulaire
            e.target.reset();
            
            // Réinitialiser le bouton
            submitBtn.textContent = 'Envoyer la demande';
            submitBtn.disabled = false;
            
            // Supprimer le message après 5 secondes
            setTimeout(() => {
                formSuccess.remove();
            }, 5000);
        }, 2000);
    }

    // Gestion du redimensionnement
    function handleResize() {
        // Réinitialiser la position du défilement lors du redimensionnement
        activateSlide(currentSlide);
    }

    // Animation des éléments au défilement
    function animateElementsOnScroll() {
        const animatedElements = document.querySelectorAll('[data-parallax]');
        
        animatedElements.forEach(el => {
            const depth = el.getAttribute('data-parallax');
            const translateY = window.scrollY * (depth * 0.1);
            
            el.style.transform = `translateY(${translateY}px)`;
        });
    }

    // Ajouter une classe aux éléments visibles
    function revealElementsInView() {
        const inViewElements = document.querySelectorAll('.roll-cont-item');
        
        inViewElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementBottom = el.getBoundingClientRect().bottom;
            
            // Vérifier si l'élément est dans la vue
            if (elementTop < window.innerHeight && elementBottom > 0) {
                el.classList.add('in-view');
            }
        });
    }

    // Fonction pour gérer le bouton de retour en haut de page
    function handleScrollToTop() {
        const scrollToTopBtn = document.querySelector('.scroll-to-top');
        
        if (scrollToTopBtn) {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
            
            scrollToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // Appeler les fonctions d'animation
    window.addEventListener('scroll', function() {
        animateElementsOnScroll();
        revealElementsInView();
        handleScrollToTop();
    });
    
    // Fonction pour charger les images depuis localStorage
    function loadImagesFromStorage() {
        console.log("Chargement des images depuis localStorage...");
        const sections = ['accueil', 'services', 'pourquoi', 'galerie', 'apropos', 'background'];
        
        sections.forEach(section => {
            // Vérifier si une image est stockée pour cette section
            const storedImageData = localStorage.getItem(`image-${section}`);
            
            if (storedImageData) {
                console.log(`Image trouvée pour la section ${section}`);
                // Identifier l'élément image à mettre à jour
                let targetImage;
                
                switch(section) {
                    case 'accueil':
                        targetImage = document.querySelector('#accueil .roll-img-w img');
                        break;
                    case 'services':
                        targetImage = document.querySelector('#services .roll-img-w img');
                        break;
                    case 'pourquoi':
                        targetImage = document.querySelector('#pourquoi-nous .roll-img-w img');
                        break;
                    case 'galerie':
                        targetImage = document.querySelector('#galerie .roll-img-w img');
                        break;
                    case 'apropos':
                        targetImage = document.querySelector('#a-propos .roll-img-w img');
                        break;
                    case 'background':
                        targetImage = document.querySelector('#background-image');
                        break;
                }
                
                // Mettre à jour l'image si l'élément a été trouvé
                if (targetImage) {
                    console.log(`Application de l'image pour ${section}`);
                    targetImage.src = storedImageData;
                    
                    // Garantir que l'image est chargée correctement
                targetImage.onerror = function() {
                    console.error(`Erreur de chargement de l'image pour ${section}`);
                    // Restaurer une image par défaut en cas d'erreur sans créer de boucle infinie
                    if (!this.hasAttribute('data-error-handled')) {
                        this.setAttribute('data-error-handled', 'true');
                        
                        // Utiliser l'image par défaut sécurisée pour éviter les requêtes infinies
                        if (section === 'accueil') {
                            this.src = "images/IMG-20250321-WA0016.jpg";
                        } else {
                            // Utiliser un attribut data-default-src s'il existe, ou une image de secours
                            this.src = this.getAttribute('data-default-src') || "images/cropped-Vos-Thermos-Logo_Fond.jpg";
                        }
                    }
                };
                }
            }
        });
    }
    
    // Sauvegarder l'état des images quand elles sont modifiées
    function saveImageToStorage(section, imageData) {
        localStorage.setItem(`image-${section}`, imageData);
        console.log(`Image sauvegardée pour la section ${section}`);
    }
    
    // Exposer les fonctions de sauvegarde et chargement pour qu'elles soient accessibles aux autres scripts
    window.vosthermosUtils = {
        loadImagesFromStorage: loadImagesFromStorage,
        saveImageToStorage: saveImageToStorage
    };
});

// Réexécuter le chargement des images après un délai pour s'assurer que les autres scripts sont chargés
window.addEventListener('load', function() {
    setTimeout(function() {
        console.log("Rechargement des images après délai...");
        if (window.vosthermosUtils && window.vosthermosUtils.loadImagesFromStorage) {
            window.vosthermosUtils.loadImagesFromStorage();
        }
    }, 500);
});
