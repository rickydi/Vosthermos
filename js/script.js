document.addEventListener('DOMContentLoaded', function() {
    // Préchargeur
    const preloader = document.querySelector('.preloader');
    
    // Fonction pour masquer le préchargeur avec style direct
    function hidePreloader() {
        if (preloader) {
            preloader.style.display = 'none';
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    }
    
    // Essayer de masquer le préchargeur lors du chargement
    window.addEventListener('load', hidePreloader);
    
    // Délai de sécurité pour forcer le masquage même si l'événement load ne se déclenche pas
    setTimeout(hidePreloader, 2500);

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
        link.addEventListener('click', function(e) {
            // Empêcher le comportement par défaut
            e.preventDefault();
            
            // Fermer le menu
            menuBtn.classList.remove('active');
            menuOverlay.classList.remove('active');
            
            // Vérifier si c'est un lien externe comme le login
            if (this.id === 'menu-login-link' || !this.hasAttribute('data-index')) {
                console.log("Navigation vers lien externe: " + this.getAttribute('href'));
                // Redirection vers la page externe
                window.location.href = this.getAttribute('href');
                return;
            }
            
            // Récupérer l'index de la slide cible
            const index = parseInt(this.dataset.index);
            if (isNaN(index)) {
                console.error("Index invalide dans le lien de menu");
                return;
            }
            
            console.log("Navigation depuis menu vers slide " + index);
            
            // Force l'arrêt de toute animation en cours
            isAnimating = false;
            window.isAnimating = false;
            
            // Réinitialiser les styles pour éviter tout conflit
            homeRollW.style.transition = 'none';
            void homeRollW.offsetWidth; // Force un reflow
            
            // Utiliser un délai plus long pour s'assurer que l'interface a bien fini de réagir
            setTimeout(() => {
                // Réinitialiser complètement les classes actives
                document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
                homeRollItems.forEach(item => item.classList.remove('active'));
                
                // Forcer un nouveau layout avant de déclencher la navigation
                void document.body.offsetHeight;
                
                // Lancer la navigation vers la slide
                scrollToSlide(index);
            }, 100);
        });
    });

    // Navigation par hitbox (curseur à droite et à gauche)
    const prevHitbox = document.querySelector('[data-hitbox="PREV"]');
    const nextHitbox = document.querySelector('[data-hitbox="NEXT"]');
    
    if (prevHitbox) {
        prevHitbox.addEventListener('click', function() {
            navigateSlide(-1);
        });
    }
    
    if (nextHitbox) {
        nextHitbox.addEventListener('click', function() {
            navigateSlide(1);
        });
    }
    
    // Navigation tactile pour mobile (swipe et scroll) - Version améliorée
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let minSwipeDistance = 30; // Réduite pour plus de sensibilité
    let minVerticalSwipeDistance = 40; // Distance minimum pour considérer un scroll vertical comme navigation
    let swipeInProgress = false;
    let isMobile = window.innerWidth <= 768; // Détection de mobile par la largeur d'écran
    
    // Mise à jour de la détection mobile lors du redimensionnement
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
    });
    
    document.addEventListener('touchstart', function(e) {
        // Réinitialiser l'état
        swipeInProgress = false;
        
        // Stocker les coordonnées de départ
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        
        // Forcer l'arrêt de toute animation en cours pour un meilleur temps de réponse
        if (isAnimating) {
            isAnimating = false;
            window.isAnimating = false;
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        // Si une navigation est déjà en cours, ne rien faire
        if (swipeInProgress) return;
        
        const currentX = e.changedTouches[0].screenX;
        const currentY = e.changedTouches[0].screenY;
        
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;
        
        // Déterminer si l'élément courant permet le défilement vertical
        const currentItem = homeRollItems[currentSlide];
        const contentWrapper = currentItem.querySelector('.roll-content-w');
        const isScrollable = contentWrapper && contentWrapper.scrollHeight > contentWrapper.clientHeight;
        
        // Vérifier si on est sur un élément scrollable et si on est à son début ou sa fin
        const isAtTop = !contentWrapper || contentWrapper.scrollTop <= 10;
        const isAtBottom = !contentWrapper || (contentWrapper.scrollHeight - contentWrapper.scrollTop <= contentWrapper.clientHeight + 10);
        
        // Traiter comme navigation si:
        // 1. C'est un swipe horizontal significatif
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            swipeInProgress = true; // Empêcher des déclenchements multiples
            
            if (deltaX > 0) {
                // Swipe vers la droite - page précédente
                console.log("Swipe mobile détecté: droite (page précédente)");
                navigateSlide(-1);
            } else {
                // Swipe vers la gauche - page suivante
                console.log("Swipe mobile détecté: gauche (page suivante)");
                navigateSlide(1);
            }
        } 
        // 2. C'est un scroll vertical significatif ET on est sur mobile ET (on est tout en haut en scrollant vers le haut OU tout en bas en scrollant vers le bas)
        else if (isMobile && Math.abs(deltaY) > minVerticalSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
            // Si on est au début du contenu et qu'on tire vers le bas (pour aller à la page précédente)
            if (deltaY > 0 && isAtTop) {
                swipeInProgress = true;
                console.log("Scroll vertical détecté: vers le bas (page précédente)");
                navigateSlide(-1);
                e.preventDefault(); // Empêcher le scroll standard
            } 
            // Suppression du comportement de navigation à la page suivante quand on est en bas
            // Le défilement vertical normal est conservé
            // Sinon, laisser le scroll normal se faire
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        // Si le swipe n'a pas été traité pendant touchmove, le traiter ici
        if (swipeInProgress) return; // Déjà traité
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });
    
    function handleSwipe() {
        // Calculer les distances
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        
        // Vérifier si c'est principalement un swipe horizontal
        if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > minSwipeDistance) {
            if (swipeDistanceX > 0) {
                // Swipe vers la droite - page précédente
                console.log("Swipe mobile détecté (touchend): droite");
                navigateSlide(-1);
            } else {
                // Swipe vers la gauche - page suivante
                console.log("Swipe mobile détecté (touchend): gauche");
                navigateSlide(1);
            }
        }
        // Vérifier pour la navigation verticale (uniquement sur mobile)
        else if (isMobile && Math.abs(swipeDistanceY) > minVerticalSwipeDistance && Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) {
            const currentItem = homeRollItems[currentSlide];
            const contentWrapper = currentItem.querySelector('.roll-content-w');
            
            // Vérifier si on est au début ou à la fin du contenu scrollable
            const isAtTop = !contentWrapper || contentWrapper.scrollTop <= 10;
            const isAtBottom = !contentWrapper || (contentWrapper.scrollHeight - contentWrapper.scrollTop <= contentWrapper.clientHeight + 10);
            
            if (swipeDistanceY > 0 && isAtTop) {
                // Swipe vers le bas (en haut du contenu) - page précédente
                console.log("Swipe vertical détecté (touchend): bas au début");
                navigateSlide(-1);
            }
            // Navigation supprimée lorsqu'on swipe vers le haut en bas de page
        }
    }

    // Variables pour le défilement horizontal
    const homeRollW = document.querySelector('.home-roll-w');
    let currentSlide = 0;
    let isAnimating = false;
    let startX, startScrollLeft;
    let isDragging = false;
    
    // Exposer isAnimating comme variable globale pour permettre la coordination avec desktop-fix.js
    window.isAnimating = false;

    // Fonction pour naviguer entre les slides
    function navigateSlide(direction) {
        if (isAnimating) return;
        
        const newSlide = currentSlide + direction;
        if (newSlide < 0 || newSlide >= homeRollItems.length) return;
        
        // Remonter la page contact si on est actuellement dessus
        resetContactScrollIfNeeded(() => {
            scrollToSlide(newSlide);
        });
    }
    
    // Fonction pour réinitialiser le défilement de la section contact si nécessaire
    function resetContactScrollIfNeeded(callback) {
        // Si on n'est pas sur la page contact, exécuter le callback directement
        if (currentSlide !== homeRollItems.length - 1) {
            if (callback) callback();
            return;
        }

        // Cibler la zone de contenu scrollable de la section contact
        const contactContentWrapper = document.querySelector('#contact .roll-content-w');

        // Vérifier si cette zone est scrollée
        if (contactContentWrapper && contactContentWrapper.scrollTop > 0) {
            // Forcer le défilement en haut de façon immédiate
            contactContentWrapper.scrollTop = 0;

            // Attendre un court instant pour que le rendu se fasse avant d'exécuter le callback
            requestAnimationFrame(() => {
                 requestAnimationFrame(() => { // Double rAF
                    if (callback) callback();
                 });
            });
        } else {
            // Si la zone n'est pas scrollée, exécuter le callback directement
            if (callback) callback();
        }
    }

    // Fonction pour scrolle vers une slide spécifique
    function scrollToSlide(index) {
        if (isAnimating || index === currentSlide) {
             // console.log(`scrollToSlide: Aborted (isAnimating: ${isAnimating}, index: ${index}, currentSlide: ${currentSlide})`); // Log désactivé par défaut
             return;
        }
        
        // S'assurer que la section contact est bien remontée avant tout changement de page
        resetContactScrollIfNeeded(() => {
            performSlideTransition(index);
        });
    }
    
    // Fonction pour effectuer la transition entre les slides
    function performSlideTransition(index) {
        console.log(`Navigation vers slide ${index}`); // Activer les logs pour debug
        
        // S'assurer que l'index est valide
        if (index < 0 || index >= homeRollItems.length) {
            console.error(`Index de slide invalide: ${index}`);
            return;
        }
        
        // Marquer comme en cours d'animation
        isAnimating = true;
        window.isAnimating = true;
        
        // Mettre à jour l'index actuel
        currentSlide = index;
        
        // Désactiver toutes les classes actives d'abord
        document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
        homeRollItems.forEach(item => item.classList.remove('active'));
        
        // Puis activer uniquement celle qui correspond à l'index
        const dots = document.querySelectorAll('.nav-dot');
        if (dots && dots[index]) {
            dots[index].classList.add('active');
        }
        
        const targetSlide = homeRollItems[index];
        if (targetSlide) {
            targetSlide.classList.add('active');
        }
        
        // Forcer le calcul correct de la largeur et forcer le recalcul du layout
        const slideWidth = window.innerWidth; 
        const targetTranslateX = -(slideWidth * index);
        console.log(`slideWidth = ${slideWidth}, targetTranslateX = ${targetTranslateX}`); 
        
        // Réinitialiser la transition pour éviter tout conflit
        homeRollW.style.transition = 'none';
        
        // Forcer le navigateur à appliquer cette réinitialisation avant d'ajouter la transition
        void homeRollW.offsetWidth; // Déclenche un reflow
        
        // Appliquer la transformation avec une animation
        homeRollW.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        homeRollW.style.transform = `translateX(${targetTranslateX}px)`;
        
        // Réactiver la navigation après l'animation
        setTimeout(() => {
            console.log(`Navigation terminée vers slide ${index}`);
            isAnimating = false;
            window.isAnimating = false;
        }, 1000);
    }

    // Assurer l'initialisation correcte des slides et du système de navigation
    setTimeout(() => {
        console.log("Initialisation des slides...");
        
        // Activer la première slide
        if (homeRollItems.length > 0) {
            homeRollItems.forEach((item, i) => {
                if (i === 0) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Force l'affichage correct dès le départ
            homeRollW.style.transition = 'none'; // Désactive l'animation initialement
            homeRollW.style.transform = 'translateX(0px)';
            
            // Réactiver l'animation après le positionnement initial
            setTimeout(() => {
                homeRollW.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                console.log("Système de navigation initialisé");
            }, 50);
        }
        
        // Vérifier que les points de navigation sont correctement initialisés
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            if (i === 0) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }, 200); // Délai court pour s'assurer que le DOM est prêt
    
    // Ajouter un gestionnaire pour le logo qui mène à la section accueil
    const logoLink = document.querySelector('.logo');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Naviguer vers la première section (accueil)
            console.log("Navigation vers accueil depuis logo");
            isAnimating = false;
            window.isAnimating = false;
            homeRollW.style.transition = 'none';
            void homeRollW.offsetWidth;
            setTimeout(() => {
                document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
                homeRollItems.forEach(item => item.classList.remove('active'));
                void document.body.offsetHeight;
                scrollToSlide(0);
            }, 100);
        });
    }

    // Gestion des boutons qui mènent à la section contact
    const contactButtons = document.querySelectorAll('.explore-btn-w');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Empêcher le comportement par défaut du lien
            e.preventDefault();
            
            // Obtenir l'index de la section de contact (généralement la dernière section)
            const contactIndex = Array.from(homeRollItems).length - 1;
            
            console.log("Navigation vers contact depuis bouton");
            
            // Force l'arrêt de toute animation en cours
            isAnimating = false;
            window.isAnimating = false;
            
            // Réinitialiser les styles pour éviter tout conflit
            homeRollW.style.transition = 'none';
            void homeRollW.offsetWidth; // Force un reflow
            
            // Utiliser un délai pour s'assurer que l'interface a bien fini de réagir
            setTimeout(() => {
                // Réinitialiser complètement les classes actives
                document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
                homeRollItems.forEach(item => item.classList.remove('active'));
                
                // Forcer un nouveau layout avant de déclencher la navigation
                void document.body.offsetHeight;
                
                // Faire défiler jusqu'à la section de contact
                scrollToSlide(contactIndex);
            }, 100);
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
    // Si une animation horizontale est déjà en cours, ne rien faire
    if (isAnimating) {
        e.preventDefault(); // Empêche le scroll pendant l'animation horizontale
        return;
    }

    // Déterminer si l'événement se produit sur une partie scrollable verticalement
    const currentItem = homeRollItems[currentSlide];
    const contentWrapper = currentItem.querySelector('.roll-content-w');
    const isCurrentSlideScrollable = contentWrapper && contentWrapper.scrollHeight > contentWrapper.clientHeight;
    let allowHorizontalNav = true;

    // Logique pour permettre ou non la navigation horizontale
    if (isCurrentSlideScrollable && contentWrapper.contains(e.target)) {
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        const tolerance = 5;
        const isAtTop = contentWrapper.scrollTop <= tolerance;
        
        // Modification: Ne jamais changer de page automatiquement en bas de page
        // Bloquer la navigation horizontale dans une zone à défilement
        if (isScrollingDown) {
            allowHorizontalNav = false; // Toujours bloquer le défilement vers le bas
        } else if (isScrollingUp && !isAtTop) {
            allowHorizontalNav = false; // Bloquer le défilement vers le haut sauf en haut
        } else {
            e.preventDefault();
        }
    } else {
        // Si on est hors d'une zone scrollable, toujours permettre la navigation horizontale
        e.preventDefault();
        allowHorizontalNav = true;
    }

    // Naviguer horizontalement si permis
    if (allowHorizontalNav) {
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
            if (e.deltaY > 0) {
                navigateSlide(1); // Scroll vers le bas = page suivante
            } else {
                navigateSlide(-1); // Scroll vers le haut = page précédente
            }
        }, 50);
    }
 }, { passive: false });
 
 // Gestion du formulaire de contact (Logique déplacée vers js/email.js)
    /*
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

    // Ajouter la classe 'active' au premier élément au chargement
    if (homeRollItems.length > 0) {
        // Utiliser un léger délai pour s'assurer que tout est prêt
        setTimeout(() => {
             if (!homeRollItems[0].classList.contains('active')) {
                 homeRollItems[0].classList.add('active');
                 // Pas besoin de scrollToSlide(0) ici car le translateX initial est déjà 0
             }
        }, 100); // Un petit délai peut aider
    }
// }); // Déplacé à la fin du fichier

// Suppression de la section de gestion du formulaire de contact ici,
// car elle est gérée par js/email.js
/*
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
*/

    // Fonctionnalité Lightbox pour les galeries avec navigation
    function setupLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems.length === 0) return; // Sortir si aucune galerie n'est trouvée

        // Créer l'overlay de la lightbox une seule fois avec des boutons de navigation
        const lightboxOverlay = document.createElement('div');
        lightboxOverlay.classList.add('lightbox-overlay');
        lightboxOverlay.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-nav lightbox-prev" aria-label="Image précédente">&#10094;</button>
                <img src="" alt="Image agrandie" class="lightbox-image">
                <button class="lightbox-nav lightbox-next" aria-label="Image suivante">&#10095;</button>
                <button class="lightbox-close" aria-label="Fermer">&times;</button>
                <div class="lightbox-counter">1 / 1</div>
            </div>
        `;
        document.body.appendChild(lightboxOverlay);

        const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
        const lightboxCloseBtn = lightboxOverlay.querySelector('.lightbox-close');
        const lightboxPrevBtn = lightboxOverlay.querySelector('.lightbox-prev');
        const lightboxNextBtn = lightboxOverlay.querySelector('.lightbox-next');
        const lightboxCounter = lightboxOverlay.querySelector('.lightbox-counter');

        // Ajouter des styles CSS en ligne pour les boutons de navigation
        const style = document.createElement('style');
        style.textContent = `
            .lightbox-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 24px;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.3s;
                z-index: 10;
            }
            .lightbox-prev { left: 15px; }
            .lightbox-next { right: 15px; }
            .lightbox-nav:hover { background: rgba(0, 0, 0, 0.8); }
            .lightbox-counter {
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 14px;
            }
            @media (max-width: 768px) {
                .lightbox-nav {
                    width: 36px;
                    height: 36px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);

        // Variables pour suivre l'état de la lightbox
        let currentGallery = [];
        let currentIndex = 0;

        // Fonction pour ouvrir la lightbox avec une image spécifique
        function openLightbox(imgSrc, gallery, index) {
            currentGallery = gallery;
            currentIndex = index;
            
            lightboxImage.src = imgSrc;
            updateCounter();
            lightboxOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
        }

        // Fonction pour mettre à jour le compteur d'images
        function updateCounter() {
            lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
        }

        // Fonction pour passer à l'image suivante
        function nextImage() {
            currentIndex = (currentIndex + 1) % currentGallery.length;
            lightboxImage.src = currentGallery[currentIndex].src;
            updateCounter();
        }

        // Fonction pour passer à l'image précédente
        function prevImage() {
            currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
            lightboxImage.src = currentGallery[currentIndex].src;
            updateCounter();
        }

        // Fonction pour fermer la lightbox
        function closeLightbox() {
            lightboxOverlay.classList.remove('visible');
            document.body.style.overflow = ''; // Rétablir le scroll du body
            // Optionnel: Réinitialiser l'image source pour éviter un flash de l'ancienne image
            setTimeout(() => { lightboxImage.src = ""; }, 300);
        }

        // Trouver toutes les galeries distinctes (groupées par parent)
        const galleries = {};
        galleryItems.forEach(item => {
            const parent = item.closest('.gallery-grid-horizontal');
            if (!parent) return;
            
            const img = item.querySelector('img');
            if (!img) return;
            
            const parentId = parent.id || 'default-gallery';
            if (!galleries[parentId]) {
                galleries[parentId] = [];
            }
            
            galleries[parentId].push(img);
        });

        // Ajouter les écouteurs d'événements pour chaque item de galerie
        galleryItems.forEach(item => {
            const parent = item.closest('.gallery-grid-horizontal');
            if (!parent) return;
            
            const img = item.querySelector('img');
            if (!img) return;
            
            const parentId = parent.id || 'default-gallery';
            const gallery = galleries[parentId];
            const index = gallery.indexOf(img);
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(img.src, gallery, index);
            });
        });

        // Écouteurs d'événements pour les boutons de navigation
        lightboxNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });

        lightboxPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });

        // Support du swipe sur mobile pour changer d'image
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightboxOverlay.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        lightboxOverlay.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const minSwipeDistance = 50;
            if (touchEndX < touchStartX - minSwipeDistance) {
                // Swipe gauche = image suivante
                nextImage();
            } else if (touchEndX > touchStartX + minSwipeDistance) {
                // Swipe droit = image précédente
                prevImage();
            }
        }

        // Cliquer sur l'image elle-même ne ferme pas la lightbox
        lightboxImage.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Fermer en cliquant sur l'overlay (mais pas sur l'image ou les boutons)
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
        
        // Fermer avec le bouton de fermeture
        lightboxCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        // Navigation clavier
        document.addEventListener('keydown', (e) => {
            if (!lightboxOverlay.classList.contains('visible')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight' || e.key === 'Right') {
                nextImage();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                prevImage();
            }
        });
    }

    // Appeler la fonction pour initialiser la lightbox
    setupLightbox();

}); // Fin de l'écouteur DOMContentLoaded (placé correctement ici)
