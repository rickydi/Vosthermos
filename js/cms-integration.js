/**
 * Script d'intégration CMS pour Vosthermos
 * Ce script charge les données du CMS et met à jour les images du site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Charger les images configurées dans le CMS
    loadImagesFromCMS();
});

/**
 * Charge les images depuis les fichiers JSON du CMS
 */
async function loadImagesFromCMS() {
    console.log("Chargement des images depuis le CMS...");
    try {
        // Sections à charger
        const sections = [
            { id: 'background', element: '#background-image' },
            { id: 'accueil', element: '#accueil .roll-img-w img' },
            { id: 'services', element: '#services .roll-img-w img' },
            { id: 'pourquoi-nous', element: '#pourquoi-nous .roll-img-w img' },
            { id: 'galerie', element: '#galerie .roll-img-w img' },
            { id: 'a-propos', element: '#a-propos .roll-img-w img' }
        ];

        // Charger chaque section
        for (const section of sections) {
            await loadSectionImage(section.id, section.element);
        }

        // Charger les images de la galerie
        await loadGalleryImages();

        console.log("Chargement des images terminé avec succès");
    } catch (error) {
        console.error("Erreur lors du chargement des images:", error);
    }
}

/**
 * Charge l'image d'une section spécifique
 */
async function loadSectionImage(sectionId, elementSelector) {
    try {
        const response = await fetch(`/_data/images/${sectionId}.json?t=${new Date().getTime()}`);
        
        if (!response.ok) {
            throw new Error(`Impossible de charger les données pour ${sectionId}`);
        }

        const data = await response.json();
        const targetElement = document.querySelector(elementSelector);

        if (targetElement && data.image) {
            console.log(`Mise à jour de l'image pour ${sectionId}:`, data.image);
            targetElement.src = data.image;
            
            // Sauvegarder aussi dans localStorage comme sauvegarde
            localStorage.setItem(`image-${sectionId}`, data.image);
        }
    } catch (error) {
        console.warn(`Erreur lors du chargement de l'image pour ${sectionId}:`, error);
        
        // Essayer de charger depuis localStorage si disponible
        const storedImage = localStorage.getItem(`image-${sectionId}`);
        if (storedImage) {
            const targetElement = document.querySelector(elementSelector);
            if (targetElement) {
                console.log(`Chargement de l'image depuis localStorage pour ${sectionId}`);
                targetElement.src = storedImage;
            }
        }
    }
}

/**
 * Charge les images de la galerie
 */
async function loadGalleryImages() {
    try {
        const response = await fetch(`/_data/images/galerie.json?t=${new Date().getTime()}`);
        
        if (!response.ok) {
            throw new Error("Impossible de charger les données de la galerie");
        }

        const data = await response.json();
        
        if (data.gallery_images && data.gallery_images.length > 0) {
            const galleryItems = document.querySelectorAll('.gallery-grid-horizontal .gallery-item');
            
            // Mettre à jour chaque image de la galerie
            data.gallery_images.forEach((item, index) => {
                if (index < galleryItems.length) {
                    const imgElement = galleryItems[index].querySelector('img');
                    const overlayElement = galleryItems[index].querySelector('.gallery-overlay');
                    
                    if (imgElement) {
                        imgElement.src = item.image;
                        imgElement.alt = item.alt;
                    }
                    
                    if (overlayElement) {
                        overlayElement.textContent = item.alt;
                    }
                }
            });
        }
    } catch (error) {
        console.warn("Erreur lors du chargement des images de la galerie:", error);
    }
}

// Si Netlify Identity est présent, configurer l'utilisateur
if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
        if (!user) {
            // Si l'utilisateur n'est pas connecté, afficher le widget de connexion
            window.netlifyIdentity.on("login", () => {
                document.location.href = "/admin/";
            });
        }
    });
}
