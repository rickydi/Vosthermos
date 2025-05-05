// Script de correction pour les points de navigation qui cible explicitement les grands écrans
document.addEventListener('DOMContentLoaded', function() {
    // Fonction qui détecte si nous sommes sur un grand écran
    function isLargeScreen() {
        return window.innerWidth >= 1024;
    }
    
    // Fonction pour créer un overlay clickable au-dessus des points de navigation
    function createOverlayButtons() {
        console.log("Création de boutons overlay pour les grands écrans");
        
        // Supprimer l'overlay existant s'il existe déjà
        const existingOverlay = document.getElementById('nav-dots-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Récupérer le conteneur de points de navigation existant
        const navDots = document.querySelector('.navigation-dots');
        if (!navDots) return;
        
        // Récupérer la position et la taille du conteneur
        const navDotsRect = navDots.getBoundingClientRect();
        
        // Créer un nouvel overlay
        const overlay = document.createElement('div');
        overlay.id = 'nav-dots-overlay';
        overlay.style.cssText = `
            position: fixed;
            bottom: ${navDotsRect.bottom - window.innerHeight}px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 14px;
            padding: 10px 20px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 30px;
            z-index: 99999;
            pointer-events: auto;
        `;
        
        // Récupérer le nombre de points existants
        const dots = navDots.querySelectorAll('.nav-dot');
        
        // Fonction de navigation directe
        function goToPage(index) {
            console.log("Navigation directe via overlay vers page " + index);
            
            // Forcer la réinitialisation de toute animation
            if (window.isAnimating !== undefined) {
                window.isAnimating = false;
            }
            
            // Récupérer les éléments requis
            const slides = document.querySelectorAll('.home-roll-item');
            const container = document.querySelector('.home-roll-w');
            
            if (!slides || !container) return;
            
            // 1. Mettre à jour les slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
            
            // 2. Mettre à jour les points originaux
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // 3. Forcer le déplacement du conteneur
            const slideWidth = window.innerWidth;
            container.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            container.style.transform = `translateX(-${index * slideWidth}px)`;
        }
        
        // Créer un bouton overlay pour chaque point de navigation
        dots.forEach((dot, index) => {
            const overlayButton = document.createElement('button');
            overlayButton.className = dot.classList.contains('active') ? 'overlay-dot active' : 'overlay-dot';
            overlayButton.style.cssText = `
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background-color: white;
                border: none;
                padding: 0;
                margin: 0;
                cursor: pointer;
                opacity: ${dot.classList.contains('active') ? '1' : '0.5'};
                transition: all 0.3s ease;
            `;
            
            // Ajouter un événement de clic directement au bouton overlay
            overlayButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Mettre à jour les classes actives dans l'overlay
                overlay.querySelectorAll('.overlay-dot').forEach((btn, i) => {
                    if (i === index) {
                        btn.classList.add('active');
                        btn.style.opacity = '1';
                    } else {
                        btn.classList.remove('active');
                        btn.style.opacity = '0.5';
                    }
                });
                
                // Navigation directe
                goToPage(index);
                
                return false;
            });
            
            overlay.appendChild(overlayButton);
        });
        
        // Ajouter l'overlay au document
        document.body.appendChild(overlay);
    }
    
    // Fonction standard pour écrans normaux
    function fixNormalScreenNavigation() {
        console.log("Application du correctif pour navigation normale");
        
        // Force le conteneur à accepter les événements de clic
        const navDots = document.querySelector('.navigation-dots');
        if (!navDots) return;
        
        navDots.style.pointerEvents = 'auto';
        
        // Rendre les points cliquables
        const dots = navDots.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.style.pointerEvents = 'auto';
            dot.style.cursor = 'pointer';
            
            // Fonction simplifiée pour naviguer
            function navigateTo(index) {
                if (window.scrollToSlide && typeof window.scrollToSlide === 'function') {
                    window.scrollToSlide(index);
                } else {
                    const slides = document.querySelectorAll('.home-roll-item');
                    const homeRollW = document.querySelector('.home-roll-w');
                    
                    if (slides && homeRollW) {
                        // Mettre à jour les classes
                        slides.forEach((slide, i) => {
                            slide.classList.toggle('active', i === index);
                        });
                        
                        dots.forEach((d, i) => {
                            d.classList.toggle('active', i === index);
                        });
                        
                        // Déplacer le conteneur
                        const slideWidth = window.innerWidth;
                        homeRollW.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                        homeRollW.style.transform = `translateX(-${index * slideWidth}px)`;
                    }
                }
            }
            
            // Ajouter des gestionnaires d'événements
            const clickHandler = function(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                console.log("Clic sur point " + index);
                navigateTo(index);
                
                return false;
            };
            
            // Nettoyer les gestionnaires existants
            dot.removeEventListener('click', clickHandler);
            dot.removeEventListener('mousedown', clickHandler);
            
            // Ajouter de nouveaux gestionnaires
            dot.addEventListener('click', clickHandler);
            dot.addEventListener('mousedown', clickHandler);
            dot.onclick = clickHandler;
        });
    }
    
    // Fonction principale qui applique le correctif approprié selon la taille d'écran
    function applyNavFix() {
        if (isLargeScreen()) {
            console.log("Grand écran détecté - application du correctif spécial");
            createOverlayButtons();
        } else {
            console.log("Écran normal détecté - application du correctif standard");
            fixNormalScreenNavigation();
            
            // Supprimer l'overlay s'il existe
            const existingOverlay = document.getElementById('nav-dots-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }
    }
    
    // Appliquer les correctifs après un court délai
    setTimeout(applyNavFix, 500);
    
    // Réappliquer lors du redimensionnement
    window.addEventListener('resize', function() {
        setTimeout(applyNavFix, 200);
    });
});
