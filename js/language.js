// language.js : gestion du changement de langue pour Vosthermos

const translations = {
  en: {
    // Navigation
    "Services": "Services",
    "Comment ca marche": "How it works",
    "Galerie": "Gallery",
    "Temoignages": "Testimonials",
    "Secteurs desservis": "Service areas",
    "Contact": "Contact",

    // Hero
    "Plus de 15 ans d'experience": "Over 15 years of experience",
    "Experts en reparation de <span>portes et fenetres</span>": "Experts in <span>door and window</span> repair",
    "Service rapide et professionnel pour le remplacement de vitres thermos, la reparation de quincaillerie, de portes en bois et de moustiquaires. Nous desservons Montreal, la Rive-Sud et un rayon de 100km autour de Saint-Francois-Xavier.": "Fast and professional service for thermo glass replacement, hardware repair, wooden doors and screens. We serve Montreal, the South Shore and a 100km radius around Saint-Francois-Xavier.",
    "Demander une soumission gratuite": "Request a free quote",
    "Annees d'experience": "Years of experience",
    "Rayon de service": "Service radius",
    "Garantie thermos": "Thermo warranty",

    // Services
    "Nos services": "Our services",
    "Des solutions adaptees a <span>tous vos besoins</span>": "Solutions tailored to <span>all your needs</span>",
    "Que ce soit pour une reparation urgente ou un projet planifie, notre equipe intervient rapidement avec un service professionnel et garanti.": "Whether for an urgent repair or a planned project, our team responds quickly with professional and guaranteed service.",
    "Remplacement de quincaillerie": "Hardware replacement",
    "Remplacement professionnel de la quincaillerie de vos portes-patio et fenetres. Pieces adaptees et installation rapide.": "Professional hardware replacement for your patio doors and windows. Custom parts and quick installation.",
    "En savoir plus": "Learn more <i class=\"fas fa-arrow-right\"></i>",
    "Remplacement de vitre thermos": "Thermo glass replacement",
    "Buee ou perte d'efficacite thermique? Remplacement professionnel avec garantie de 10 ans sur tous nos travaux.": "Fog or loss of thermal efficiency? Professional replacement with a 10-year warranty on all our work.",
    "Reparation de portes en bois": "Wooden door repair",
    "Reparation et restauration de portes et fenetres en bois. Estimation gratuite et execution parfaite des travaux.": "Repair and restoration of wooden doors and windows. Free estimate and flawless work execution.",
    "Moustiquaires sur mesure": "Custom screens",
    "Fabrication sur mesure et reparation de tous types de moustiquaires. Service rapide et etancheite parfaite garantie.": "Custom fabrication and repair of all types of screens. Fast service and perfect sealing guaranteed.",

    // How It Works
    "Un processus <span>simple et rapide</span>": "A <span>simple and fast</span> process",
    "Contactez-nous": "Contact us",
    "Appelez-nous ou remplissez notre formulaire en ligne. Decrivez votre besoin et nous vous repondrons rapidement.": "Call us or fill out our online form. Describe your needs and we'll get back to you quickly.",
    "Estimation gratuite": "Free estimate",
    "Nous evaluons vos besoins et vous fournissons une soumission claire et detaillee, sans surprise ni frais caches.": "We assess your needs and provide a clear and detailed quote, with no surprises or hidden fees.",
    "Intervention rapide": "Quick service",
    "Notre equipe intervient a votre domicile ou entreprise avec tout le materiel necessaire pour un travail de qualite.": "Our team comes to your home or business with all the materials needed for quality work.",

    // Gallery
    "Nos realisations": "Our work",
    "Galerie de <span>nos travaux</span>": "Gallery of <span>our work</span>",
    "Tous": "All",
    "Quincaillerie": "Hardware",
    "Vitre Thermos": "Thermo Glass",
    "Portes": "Doors",
    "Moustiquaires": "Screens",

    // Testimonials
    "Ce que nos <span>clients disent</span>": "What our <span>clients say</span>",

    // Sectors
    "Nous desservons <span>votre region</span>": "We serve <span>your area</span>",
    "Notre equipe se deplace dans un rayon de 100km autour de Saint-Francois-Xavier pour offrir nos services de reparation de portes et fenetres.": "Our team travels within a 100km radius of Saint-Francois-Xavier to offer our door and window repair services.",

    // CTA
    "Besoin d'une reparation? Contactez-nous des maintenant!": "Need a repair? Contact us now!",
    "Soumission gratuite, service rapide et garanti. Notre equipe est prete a vous aider.": "Free quote, fast and guaranteed service. Our team is ready to help.",
    "Demander une soumission": "Request a quote",

    // Contact
    "Demandez votre <span>soumission gratuite</span>": "Request your <span>free quote</span>",
    "Nom complet": "Full Name",
    "Telephone": "Phone",
    "Service requis": "Required service",
    "Selectionnez un service": "Select a service",
    "Reparation/fabrication de moustiquaires": "Screen repair/fabrication",
    "Autre (precisez)": "Other (specify)",
    "Envoyer la demande": "Send request",
    "Nos coordonnees": "Our contact info",
    "Adresse": "Address",

    // Footer
    "Experts en reparation de portes et fenetres depuis plus de 15 ans. Service professionnel et garanti.": "Door and window repair experts for over 15 years. Professional and guaranteed service.",
    "Secteurs populaires": "Popular areas",
    "Tous droits reserves": "All rights reserved",

    // Fixed CTA
    "Soumission gratuite": "Free quote"
  },
  fr: {}
};

function setLanguage(lang) {
  document.documentElement.lang = lang;

  var langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(function (option) {
    if (option.getAttribute('data-lang') === lang) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (lang === "en" && translations.en[key]) {
      el.innerHTML = translations.en[key];
    } else if (lang === "fr") {
      el.innerHTML = key;
    }
  });

  if (lang === "en") {
    var nameEl = document.getElementById("name");
    var emailEl = document.getElementById("email");
    var phoneEl = document.getElementById("phone");
    var messageEl = document.getElementById("message");
    if (nameEl) nameEl.setAttribute("placeholder", "Full Name");
    if (emailEl) emailEl.setAttribute("placeholder", "Email");
    if (phoneEl) phoneEl.setAttribute("placeholder", "Phone");
    if (messageEl) messageEl.setAttribute("placeholder", "Describe your needs...");
  } else {
    var nameEl = document.getElementById("name");
    var emailEl = document.getElementById("email");
    var phoneEl = document.getElementById("phone");
    var messageEl = document.getElementById("message");
    if (nameEl) nameEl.setAttribute("placeholder", "Nom complet");
    if (emailEl) emailEl.setAttribute("placeholder", "Email");
    if (phoneEl) phoneEl.setAttribute("placeholder", "Telephone");
    if (messageEl) messageEl.setAttribute("placeholder", "Decrivez votre besoin...");
  }

  localStorage.setItem('vosthermosLang', lang);
}

document.addEventListener("DOMContentLoaded", function () {
  var currentLang = localStorage.getItem('vosthermosLang') || "fr";
  setLanguage(currentLang);

  var langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(function (option) {
    option.addEventListener('click', function (e) {
      e.stopPropagation();
      var newLang = this.getAttribute('data-lang');
      if (newLang !== currentLang) {
        currentLang = newLang;
        setLanguage(currentLang);
      }
    });
  });
});
