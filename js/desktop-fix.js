// Script pour améliorer la compatibilité de navigation sur ordinateur
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est sur un ordinateur de bureau
    const isDesktop = window.innerWidth >= 1024 && !('ontouchstart' in window);
    
    if (isDesktop) {
        console.log("Ordinateur de bureau détecté, application des correctifs...");
        
        // Ajouter des boutons de navigation visibles pour ordinateur
        addDesktopNavButtons();
        
        // Améliorer la gestion des événements clavier
        enhanceKeyboardNavigation();
        
        // Désactiver la détection d'orientation qui peut causer des problèmes sur desktop
        disableRotationWarning();
        
        // Améliorer la visibilité du curseur personnalisé
        enhanceCursorVisibility();
        
        // Corriger les problèmes de défilement
        fixScrollingIssues();
    }
    
    // Fonction pour ajouter des boutons de navigation visibles
    function addDesktopNavButtons() {
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'desktop-navigation';
        navigationContainer.innerHTML = `
            <button class="desktop-nav-btn prev-btn">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="desktop-nav-btn next-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        document.body.appendChild(navigationContainer);
        
        // Ajouter le CSS pour les boutons
        const style = document.createElement('style');
        style.textContent = `
            .desktop-navigation {
                position: fixed;
                top: 50%;
                width: 100%;
                display: flex;
                justify-content: space-between;
                padding: 0 30px;
                transform: translateY(-50%);
                z-index: 100;
                pointer-events: none;
            }
            
            .desktop-nav-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--primary-color);
                color: white;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.2rem;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            
            .desktop-nav-btn:hover {
                transform: scale(1.1);
                background-color: #c60615;
            }
        `;
        
        document.head.appendChild(style);
        
        // Ajouter les événements aux boutons
        const prevBtn = document.querySelector('.desktop-nav-btn.prev-btn');
        const nextBtn = document.querySelector('.desktop-nav-btn.next-btn');
        
        prevBtn.addEventListener('click', function() {
            const event = new Event('prevSlide');
            window.dispatchEvent(event);
            
            // Backup au cas où l'événement ne fonctionne pas
            const prevBtnOriginal = document.querySelector('[data-hitbox="PREV"]');
            if (prevBtnOriginal) {
                prevBtnOriginal.click();
            } else {
                // Navigation manuelle
                const currentSlide = getCurrentSlide();
                if (currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                } else {
                    goToSlide(getTotalSlides() - 1);
                }
            }
        });
        
        nextBtn.addEventListener('click', function() {
            const event = new Event('nextSlide');
            window.dispatchEvent(event);
            
            // Backup au cas où l'événement ne fonctionne pas
            const nextBtnOriginal = document.querySelector('[data-hitbox="NEXT"]');
            if (nextBtnOriginal) {
                nextBtnOriginal.click();
            } else {
                // Navigation manuelle
                const currentSlide = getCurrentSlide();
                if (currentSlide < getTotalSlides() - 1) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(0);
                }
            }
        });
    }
    
    // Fonction pour améliorer la navigation au clavier
    function enhanceKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                
                const nextBtnOriginal = document.querySelector('[data-hitbox="NEXT"]');
                if (nextBtnOriginal) {
                    nextBtnOriginal.click();
                } else {
                    // Navigation manuelle
                    const currentSlide = getCurrentSlide();
                    if (currentSlide < getTotalSlides() - 1) {
                        goToSlide(currentSlide + 1);
                    } else {
                        goToSlide(0);
                    }
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                
                const prevBtnOriginal = document.querySelector('[data-hitbox="PREV"]');
                if (prevBtnOriginal) {
                    prevBtnOriginal.click();
                } else {
                    // Navigation manuelle
                    const currentSlide = getCurrentSlide();
                    if (currentSlide > 0) {
                        goToSlide(currentSlide - 1);
                    } else {
                        goToSlide(getTotalSlides() - 1);
                    }
                }
            } else if (e.key >= '1' && e.key <= '9') {
                const slideIndex = parseInt(e.key) - 1;
                if (slideIndex < getTotalSlides()) {
                    goToSlide(slideIndex);
                }
            }
        }, true);
    }
    
    // Fonction pour désactiver l'avertissement de rotation sur desktop
    function disableRotationWarning() {
        const rotationWarning = document.querySelector('.div-block-44');
        if (rotationWarning) {
            rotationWarning.style.display = 'none';
        }
    }
    
    // Fonction pour améliorer la visibilité du curseur personnalisé
    function enhanceCursorVisibility() {
        const cursorW = document.querySelector('.cursor-w');
        if (cursorW) {
            const style = document.createElement('style');
            style.textContent = `
                .cursor-w.active {
                    opacity: 1 !important;
                    transform: translate(-50%, -50%) scale(1.2);
                    background-color: rgba(227, 7, 24, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Fonction pour corriger les problèmes de défilement
    function fixScrollingIssues() {
        const homeRollContainer = document.querySelector('[data-roll="container"]');
        const homeRollItems = document.querySelectorAll('[data-roll="item"]');
        
        if (homeRollContainer) {
            // Ajouter un nouveau gestionnaire d'événements de défilement fiable
            window.addEventListener('wheel', function(e) {
                e.preventDefault();
                
                // Utiliser un délai pour éviter le défilement trop rapide
                if (window.scrollTimeout) {
                    clearTimeout(window.scrollTimeout);
                }
                
                window.scrollTimeout = setTimeout(() => {
                    if (e.deltaY > 0) {
                        const nextBtn = document.querySelector('.desktop-nav-btn.next-btn');
                        if (nextBtn) nextBtn.click();
                    } else {
                        const prevBtn = document.querySelector('.desktop-nav-btn.prev-btn');
                        if (prevBtn) prevBtn.click();
                    }
                }, 50);
            }, { passive: false });
        }
    }
    
    // Correction directe pour les points de navigation sur grands écrans
    function fixNavigationDots() {
        console.log("Application du correctif pour les points de navigation sur grand écran");
        
        // Assure-toi que le conteneur de points peut recevoir des clics
        const navDots = document.querySelector('.navigation-dots');
        if (navDots) {
            navDots.style.pointerEvents = 'auto';
            
            // Ajouter une fonction globale pour la navigation
            window.goToPageByIndex = function(index) {
                console.log("Navigation directe vers page " + index);
                
                // Reset animation flag
                if (window.isAnimating !== undefined) {
                    window.isAnimating = false;
                }
                
                const dots = document.querySelectorAll('.nav-dot');
                if (dots && dots[index]) {
                    // Version directe et simple pour forcer le clic sur un point
                    dots[index].click();
                    
                    // Si le clic ne fonctionne pas, force la navigation manuellement
                    setTimeout(() => {
                        const slides = document.querySelectorAll('[data-roll="item"]');
                        const container = document.querySelector('[data-roll="container"]');
                        
                        if (slides && container) {
                            // 1. Réinitialiser les classes actives
                            slides.forEach((slide, i) => {
                                if (i === index) {
                                    slide.classList.add('active');
                                } else {
                                    slide.classList.remove('active');
                                }
                            });
                            
                            // 2. Mettre à jour les points de navigation
                            dots.forEach((dot, i) => {
                                if (i === index) {
                                    dot.classList.add('active');
                                } else {
                                    dot.classList.remove('active');
                                }
                            });
                            
                            // 3. Déplacer le conteneur
                            const slideWidth = window.innerWidth;
                            container.style.transform = `translateX(-${index * slideWidth}px)`;
                        }
                    }, 10);
                }
            };
            
            // Ajouter manuellement des gestionnaires d'événements aux points de navigation
            const dots = document.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                dot.style.pointerEvents = 'auto';
                dot.style.cursor = 'pointer';
                
                // Rendre les points de navigation cliquables directement
                dot.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Clic direct sur point " + index);
                    window.goToPageByIndex(index);
                    return false;
                };
            });
        }
    }
    
    // Appliquer ce correctif après un court délai
    setTimeout(fixNavigationDots, 500);
    
    // Fonctions utilitaires
    function getCurrentSlide() {
        const activeSlide = document.querySelector('[data-roll="item"].active');
        if (activeSlide) {
            const slides = document.querySelectorAll('[data-roll="item"]');
            for (let i = 0; i < slides.length; i++) {
                if (slides[i] === activeSlide) {
                    return i;
                }
            }
        }
        return 0;
    }
    
    function getTotalSlides() {
        return document.querySelectorAll('[data-roll="item"]').length;
    }
    
    function goToSlide(index) {
        // Accéder à la variable isAnimating du script principal et la réinitialiser
        // pour éviter les conflits de navigation
        if (window.isAnimating !== undefined) {
            window.isAnimating = false;
        }
        
        console.log("Navigation desktop vers slide " + index);
        
        const dots = document.querySelectorAll('.nav-dot');
        if (dots && dots[index]) {
            // Force l'activation directe de la fonction de navigation au lieu d'utiliser un clic
            // Direct call to scrollToSlide instead of relying on click event
            if (typeof window.scrollToSlide === 'function') {
                window.scrollToSlide(index);
            } else {
                // Fallback à l'ancienne méthode si scrollToSlide n'est pas disponible
                // S'assurer que le clic fonctionne en ajoutant un trigger manuel
                dots[index].click();
                
                // Double assurance - navigation manuelle si le clic échoue
                setTimeout(() => {
                    const slides = document.querySelectorAll('[data-roll="item"]');
                    const homeRollContainer = document.querySelector('[data-roll="container"]');
                    
                    if (slides && homeRollContainer) {
                        // Mettre à jour les classes actives
                        slides.forEach((item, i) => {
                            if (i === index) {
                                item.classList.add('active');
                            } else {
                                item.classList.remove('active');
                            }
                        });
                        
                        // Déplacer le conteneur
                        const slideWidth = window.innerWidth;
                        homeRollContainer.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                        homeRollContainer.style.transform = `translateX(-${index * slideWidth}px)`;
                        
                        // Mise à jour des points aussi
                        navDots.forEach((dot, i) => {
                            if (i === index) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });
                    }
                }, 50);
            }
        } else {
            // Navigation manuelle
            const slides = document.querySelectorAll('[data-roll="item"]');
            const homeRollContainer = document.querySelector('[data-roll="container"]');
            
            if (slides && homeRollContainer) {
                // Mettre à jour les classes actives
                slides.forEach((item, i) => {
                    if (i === index) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                // Déplacer le conteneur
                const slideWidth = window.innerWidth;
                const scrollPos = index * slideWidth;
                homeRollContainer.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                homeRollContainer.style.transform = `translateX(-${scrollPos}px)`;
                
                // Mettre à jour les points de navigation
                const navDots = document.querySelectorAll('.nav-dot');
                navDots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
                
                // Mettre à jour l'opacité du fond si nécessaire
                const backgroundImage = document.getElementById('background-image');
                if (backgroundImage) {
                    const opacity = Math.max(0.05, 0.2 - (index * 0.03));
                    backgroundImage.style.opacity = opacity;
                }
            }
        }
    }
});
