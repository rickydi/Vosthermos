// language.js : gestion du changement de langue pour Vosthermos

const translations = {
  en: {
    "Experts en reparation": "Repair Experts",
    "PORTES ET FENETRES": "DOORS AND <span>WINDOWS</span>",
    "Service rapide et professionnel dans un rayon de 100km de Saint-Francois-Xavier pour tous vos besoins de reparation de portes et fenetres.": "Fast and professional service within 100km of Saint-Francois-Xavier for all your door and window repair needs.",
    "Qualite": "Quality",
    "Garantie": "Warranty",
    "Service": "Service",
    "Rapide": "Fast",
    "Prix": "Prices",
    "Competitifs": "Competitive",
    "Accueil": "Home",
    "Quincaillerie": "Hardware",
    "Vitre Thermos": "Thermo Glass",
    "Portes en Bois": "Wooden Doors",
    "Moustiquaires": "Screens",
    "Contact": "Contact",
    "Contactez-nous": "Contact Us",
    "REMPLACEMENT DE <span>QUINCAILLERIE</span>": "HARDWARE <span>REPLACEMENT</span>",
    "Besoin de remplacer la quincaillerie de vos portes-patio ou fenetres ? Notre equipe d'experts intervient rapidement pour fournir et installer les pieces adaptees a vos besoins. Nous offrons un service professionnel et une garantie de satisfaction pour tous vos problemes de quincaillerie.": "Need to replace the hardware on your patio doors or windows? Our team of experts quickly provides and installs the right parts for your needs. We offer professional service and a satisfaction guarantee for all your hardware issues.",
    "REMPLACEMENT DE <span>VITRE THERMOS</span>": "THERMO GLASS <span>REPLACEMENT</span>",
    "Vous constatez une perte d'efficacite thermique ou de la buee dans vos fenetres ? Notre service specialise vous garantit un remplacement professionnel de vos vitres thermos. Nous offrons une garantie de 10 ans sur tous nos travaux, pour votre tranquillite d'esprit.": "Noticing fog or loss of thermal efficiency in your windows? Our specialized service guarantees professional replacement of your thermo glass. We offer a 10-year warranty on all our work for your peace of mind.",
    "REPARATION DE <span>PORTES EN BOIS</span>": "WOODEN DOOR <span>REPAIR</span>",
    "Vous avez un besoin urgent ou non de faire reparer des portes ou fenetres de votre demeure ou entreprise ? Laissez-nous le soin d'en faire une estimation gratuite au prealable avant de mener a terme l'execution parfaite de ces travaux, si cela vous convient.": "Need urgent or non-urgent repairs for your home or business doors and windows? Let us provide a free estimate before carrying out the perfect execution of the work, if you wish.",
    "SERVICES <span>MOUSTIQUAIRES</span>": "<span>SCREEN</span> SERVICES",
    "Besoin de profiter de l'air frais sans les insectes ? Notre atelier se charge de la fabrication sur mesure et de la reparation de tous types de moustiquaires pour vos fenetres et portes. Qualite garantie et service rapide pour une etancheite parfaite qui vous protege efficacement.": "Want to enjoy fresh air without insects? Our workshop custom-makes and repairs all types of screens for your windows and doors. Guaranteed quality and fast service for perfect sealing and effective protection.",
    "CONTACTEZ-NOUS": "CONTACT US",
    "Nom complet": "Full Name",
    "Email": "Email",
    "Telephone": "Phone",
    "Service requis": "Required Service",
    "Selectionnez un service": "Select a service",
    "Remplacement de quincaillerie": "Hardware replacement",
    "Remplacement de vitre thermos": "Thermo glass replacement",
    "Reparation de portes en bois": "Wooden door repair",
    "Reparation/fabrication de moustiquaires": "Screen repair/fabrication",
    "Autre (precisez)": "Other (specify)",
    "Message": "Message",
    "Envoyer la demande": "Send Request",
    "Adresse": "Address",
    "Tous droits reserves": "All rights reserved"
  },
  fr: {}
};

function setLanguage(lang) {
  document.documentElement.lang = lang;

  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    if (option.getAttribute('data-lang') === lang) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (lang === "en" && translations.en[key]) {
      el.innerHTML = translations.en[key];
    } else if (lang === "fr" && translations.en[key]) {
      el.innerHTML = key;
    }
  });

  if (lang === "en") {
    document.getElementById("name")?.setAttribute("placeholder", "Full Name");
    document.getElementById("email")?.setAttribute("placeholder", "Email");
    document.getElementById("phone")?.setAttribute("placeholder", "Phone");
    document.getElementById("message")?.setAttribute("placeholder", "Message");
  } else {
    document.getElementById("name")?.setAttribute("placeholder", "Nom complet");
    document.getElementById("email")?.setAttribute("placeholder", "Email");
    document.getElementById("phone")?.setAttribute("placeholder", "Telephone");
    document.getElementById("message")?.setAttribute("placeholder", "Message");
  }

  localStorage.setItem('vosthermosLang', lang);
}

document.addEventListener("DOMContentLoaded", () => {
  let currentLang = localStorage.getItem('vosthermosLang') || "fr";
  setLanguage(currentLang);

  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      const newLang = this.getAttribute('data-lang');
      if (newLang !== currentLang) {
        currentLang = newLang;
        setLanguage(currentLang);
      }
    });
  });
});
