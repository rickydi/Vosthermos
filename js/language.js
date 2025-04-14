// language.js : gestion du changement de langue pour Vosthermos

const translations = {
  en: {
    "Experts en réparation": "Repair Experts",
    "PORTES ET FENÊTRES": "DOORS AND <span>WINDOWS</span>",
    "Service rapide et professionnel dans un rayon de 100km de Saint-François-Xavier pour tous vos besoins de réparation de portes et fenêtres.": "Fast and professional service within 100km of Saint-François-Xavier for all your door and window repair needs.",
    "Qualité": "Quality",
    "Garantie": "Warranty",
    "Service": "Service",
    "Rapide": "Fast",
    "Prix": "Prices",
    "Compétitifs": "Competitive",
    "Accueil": "Home",
    "Quincaillerie": "Hardware",
    "Vitre Thermos": "Thermo Glass",
    "Portes en Bois": "Wooden Doors",
    "Moustiquaires": "Screens",
    "Contact": "Contact",
    "REMPLACEMENT DE <span>QUINCAILLERIE</span>": "HARDWARE <span>REPLACEMENT</span>",
    "Besoin de remplacer la quincaillerie de vos portes-patio ou fenêtres ? Notre équipe d'experts intervient rapidement pour fournir et installer les pièces adaptées à vos besoins. Nous offrons un service professionnel et une garantie de satisfaction pour tous vos problèmes de quincaillerie.": "Need to replace the hardware on your patio doors or windows? Our team of experts quickly provides and installs the right parts for your needs. We offer professional service and a satisfaction guarantee for all your hardware issues.",
    "REMPLACEMENT DE <span>VITRE THERMOS</span>": "THERMO GLASS <span>REPLACEMENT</span>",
    "Vous constatez une perte d'efficacité thermique ou de la buée dans vos fenêtres ? Notre service spécialisé vous garantit un remplacement professionnel de vos vitres thermos. Nous offrons une garantie de 10 ans sur tous nos travaux, pour votre tranquillité d'esprit.": "Noticing fog or loss of thermal efficiency in your windows? Our specialized service guarantees professional replacement of your thermo glass. We offer a 10-year warranty on all our work for your peace of mind.",
    "RÉPARATION DE <span>PORTES EN BOIS</span>": "WOODEN DOOR <span>REPAIR</span>",
    "Vous avez un besoin urgent ou non de faire réparer des portes ou fenêtres de votre demeure ou entreprise ? Laissez-nous le soin d'en faire une estimation gratuite au préalable avant de mener à terme l'exécution parfaite de ces travaux, si cela vous convient.": "Need urgent or non-urgent repairs for your home or business doors and windows? Let us provide a free estimate before carrying out the perfect execution of the work, if you wish.",
    "SERVICES <span>MOUSTIQUAIRES</span>": "<span>SCREEN</span> SERVICES",
    "Besoin de profiter de l'air frais sans les insectes ? Notre atelier se charge de la fabrication sur mesure et de la réparation de tous types de moustiquaires pour vos fenêtres et portes. Qualité garantie et service rapide pour une étanchéité parfaite qui vous protège efficacement.": "Want to enjoy fresh air without insects? Our workshop custom-makes and repairs all types of screens for your windows and doors. Guaranteed quality and fast service for perfect sealing and effective protection.",
    "CONTACTEZ-NOUS": "CONTACT US",
    "Nom complet": "Full Name",
    "Email": "Email",
    "Téléphone": "Phone",
    "Service requis": "Required Service",
    "Sélectionnez un service": "Select a service",
    "Remplacement de quincaillerie": "Hardware replacement",
    "Remplacement de vitre thermos": "Thermo glass replacement",
    "Réparation de portes en bois": "Wooden door repair",
    "Réparation/fabrication de moustiquaires": "Screen repair/fabrication",
    "Autre (précisez)": "Other (specify)",
    "Message": "Message",
    "Envoyer la demande": "Send Request",
    "Adresse": "Address",
    "Téléphone": "Phone",
    "Email": "Email",
    "Tous droits réservés.": "All rights reserved.",
    // Ajoutez d'autres traductions ici si nécessaire
  },
  fr: {} // Le français est la langue par défaut, donc pas besoin de mapping
};

// Fonction pour changer la langue dans la nouvelle interface (FR/EN superposés)
function setLanguage(lang) {
  document.documentElement.lang = lang;
  
  // Mettre à jour les options de langue dans le sélecteur
  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    if (option.getAttribute('data-lang') === lang) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Parcourir tous les éléments à traduire
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (lang === "en" && translations.en[key]) {
      el.innerHTML = translations.en[key];
    } else if (lang === "fr" && translations.en[key]) {
      el.innerHTML = key;
    }
  });

  // Placeholder pour les inputs
  if (lang === "en") {
    document.getElementById("name")?.setAttribute("placeholder", "Full Name");
    document.getElementById("email")?.setAttribute("placeholder", "Email");
    document.getElementById("phone")?.setAttribute("placeholder", "Phone");
    document.getElementById("message")?.setAttribute("placeholder", "Message");
  } else {
    document.getElementById("name")?.setAttribute("placeholder", "Nom complet");
    document.getElementById("email")?.setAttribute("placeholder", "Email");
    document.getElementById("phone")?.setAttribute("placeholder", "Téléphone");
    document.getElementById("message")?.setAttribute("placeholder", "Message");
  }

  // Sauvegarder la langue dans le localStorage
  localStorage.setItem('vosthermosLang', lang);
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  // Récupérer la langue sauvegardée ou utiliser le français par défaut
  let currentLang = localStorage.getItem('vosthermosLang') || "fr";
  
  // Appliquer la langue au chargement
  setLanguage(currentLang);

  // Nouveau sélecteur de langue avec options FR/EN superposées
  const langToggle = document.getElementById("lang-toggle");
  const langOptions = document.querySelectorAll('.lang-option');
  
  if (langToggle) {
    // Gérer les clics sur les options individuelles
    langOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation(); // Empêcher la propagation au bouton parent
        const newLang = this.getAttribute('data-lang');
        if (newLang !== currentLang) {
          currentLang = newLang;
          setLanguage(currentLang);
        }
      });
    });
  }
});
