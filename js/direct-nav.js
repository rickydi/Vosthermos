// Solution directe pour la navigation sur grands écrans
document.addEventListener('DOMContentLoaded', function() {
    // Supprimer les points existants qui ne fonctionnent pas
    function createDirectNavigation() {
        console.log("Création d'un nouveau système de navigation direct");
        
        // Supprimer tout overlay existant
        const existingOverlay = document.getElementById('direct-nav-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Masquer la navigation d'origine qui ne fonctionne pas
        const originalNav = document.querySelector('.navigation-dots');
        if (originalNav) {
            originalNav.style.display = 'none';
        }
        
        // Récupérer le nombre de slides pour créer les points
        const slides = document.querySelectorAll('.home-roll-item');
        const currentSlideIndex = getCurrentSlideIndex();
        
        if (!slides.length) return;
        
        // Créer le conteneur de navigation direct
        const directNav = document.createElement('div');
        directNav.id = 'direct-nav-overlay';
        directNav.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            padding: 10px 20px;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 30px;
            z-index: 99999;
        `;
        
        // Fonction de navigation directe qui ne dépend pas du système existant
        function navigateToSlide(index) {
            // Ignorer si c'est déjà le slide actif
            if (index === getCurrentSlideIndex()) return;
            
            console.log("Navigation directe vers slide " + index);
            
            // Désactiver toute animation en cours
            window.isAnimating = false;
            
            // 1. Mettre à jour les classes des slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
            
            // 2. Mettre à jour les boutons de navigation
            directNav.querySelectorAll('.direct-nav-dot').forEach((btn, i) => {
                if (i === index) {
                    btn.classList.add('active');
                    btn.style.backgroundColor = 'white';
                    btn.style.opacity = '1';
                } else {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                    btn.style.opacity = '0.5';
                }
            });
            
            // 3. Forcer le déplacement du conteneur de slides
            const container = document.querySelector('.home-roll-w');
            if (container) {
                const slideWidth = window.innerWidth;
                container.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                container.style.transform = `translateX(-${index * slideWidth}px)`;
            }
        }
        
        // Obtenir l'index du slide actif
        function getCurrentSlideIndex() {
            const activeSlide = document.querySelector('.home-roll-item.active');
            if (!activeSlide) return 0;
            
            const slides = document.querySelectorAll('.home-roll-item');
            for (let i = 0; i < slides.length; i++) {
                if (slides[i] === activeSlide) {
                    return i;
                }
            }
            return 0;
        }
        
        // Créer un point direct pour chaque slide
        slides.forEach((_, index) => {
            const navDot = document.createElement('button');
            navDot.className = 'direct-nav-dot' + (index === currentSlideIndex ? ' active' : '');
            navDot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${index === currentSlideIndex ? 'white' : 'rgba(255, 255, 255, 0.6)'};
                opacity: ${index === currentSlideIndex ? '1' : '0.5'};
                border: none;
                outline: none;
                padding: 0;
                margin: 0;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            // Événement de clic direct
            navDot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                navigateToSlide(index);
            });
            
            directNav.appendChild(navDot);
        });
        
        // Ajouter la navigation directe au document
        document.body.appendChild(directNav);
    }
    
    // Vérifier si nous sommes sur grand écran
    function isLargeScreen() {
        return window.innerWidth >= 1024;
    }
    
    // Appliquer la navigation directe seulement sur grands écrans
    function applySolution() {
        if (isLargeScreen()) {
            createDirectNavigation();
        } else {
            // Sur petits écrans, restaurer la navigation originale
            const originalNav = document.querySelector('.navigation-dots');
            if (originalNav) {
                originalNav.style.display = 'flex';
            }
            
            // Supprimer la navigation directe
            const directNav = document.getElementById('direct-nav-overlay');
            if (directNav) {
                directNav.remove();
            }
        }
    }
    
    // Appliquer la solution après un court délai
    setTimeout(applySolution, 800);
    
    // Réappliquer lors du redimensionnement
    window.addEventListener('resize', function() {
        setTimeout(applySolution, 300);
    });
});
