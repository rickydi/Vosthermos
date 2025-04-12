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
    
    // Navigation tactile pour mobile (swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    let minSwipeDistance = 50; // Distance minimale en pixels pour considérer qu'il s'agit d'un swipe
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        // Calculer la distance du swipe
        const swipeDistance = touchEndX - touchStartX;
        
        // Si la distance est suffisante pour être considérée comme un swipe
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe vers la droite - page précédente
                navigateSlide(-1);
            } else {
                // Swipe vers la gauche - page suivante
                navigateSlide(1);
            }
        }
    }

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
        
        // Forcer le calcul correct de la largeur et force le recalcul du layout
        // Parfois la largeur n'est pas correctement calculée au premier chargement
        const slideWidth = window.innerWidth; 
        const targetTranslateX = -(slideWidth * index);
        console.log(`slideWidth = ${slideWidth}, targetTranslateX = ${targetTranslateX}`); 
        
        // Appliquer la transformation avec une animation
        homeRollW.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        homeRollW.style.transform = `translateX(${targetTranslateX}px)`;
        
        // Réactiver la navigation après l'animation
        setTimeout(() => {
            console.log(`Navigation terminée vers slide ${index}`);
            isAnimating = false;
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
        const isAtBottom = contentWrapper.scrollHeight - contentWrapper.scrollTop <= contentWrapper.clientHeight + tolerance;

        // Bloquer la navigation horizontale si on peut scroller verticalement
        if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
            allowHorizontalNav = false;
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

    // Fonctionnalité Lightbox pour les galeries
    function setupLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems.length === 0) return; // Sortir si aucune galerie n'est trouvée

        // Créer l'overlay de la lightbox une seule fois
        const lightboxOverlay = document.createElement('div');
        lightboxOverlay.classList.add('lightbox-overlay');
        lightboxOverlay.innerHTML = `
            <div class="lightbox-content">
                <img src="" alt="Image agrandie" class="lightbox-image">
                <button class="lightbox-close" aria-label="Fermer">&times;</button>
            </div>
        `;
        document.body.appendChild(lightboxOverlay);

        const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
        const lightboxCloseBtn = lightboxOverlay.querySelector('.lightbox-close');

        // Fonction pour ouvrir la lightbox
        function openLightbox(imgSrc) {
            lightboxImage.src = imgSrc;
            lightboxOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
        }

        // Fonction pour fermer la lightbox
        function closeLightbox() {
            lightboxOverlay.classList.remove('visible');
            document.body.style.overflow = ''; // Rétablir le scroll du body
            // Optionnel: Réinitialiser l'image source pour éviter un flash de l'ancienne image
            setTimeout(() => { lightboxImage.src = ""; }, 300); 
        }

        // Ajouter les écouteurs d'événements
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                item.addEventListener('click', (e) => {
                    e.preventDefault(); // Empêche le comportement par défaut si l'item est un lien
                    openLightbox(img.src);
                });
            }
        });

        // Fermer en cliquant n'importe où sur l'overlay (y compris l'image) ou sur le bouton de fermeture
        lightboxOverlay.addEventListener('click', (e) => {
            // Ne pas fermer si le clic est spécifiquement sur le bouton de fermeture (il a son propre listener)
            if (e.target !== lightboxCloseBtn) {
                closeLightbox();
            }
        });
        // Le listener séparé pour le bouton close est toujours utile comme fallback ou si le clic sur l'overlay est empêché
        lightboxCloseBtn.addEventListener('click', closeLightbox); 

        // Fermer avec la touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('visible')) {
                closeLightbox();
            }
        });
    }

    // Appeler la fonction pour initialiser la lightbox
    setupLightbox();

}); // Fin de l'écouteur DOMContentLoaded (placé correctement ici)
