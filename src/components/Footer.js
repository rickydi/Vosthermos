"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const cities = [
  { name: "Montreal", slug: "montreal" },
  { name: "Laval", slug: "laval" },
  { name: "Longueuil", slug: "longueuil" },
  { name: "Brossard", slug: "brossard" },
  { name: "Saint-Hyacinthe", slug: "saint-hyacinthe" },
  { name: "Granby", slug: "granby" },
];

export default function Footer() {
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const p = isEn ? "/en" : "";

  const labels = isEn
    ? {
        tagline: "Door and window repair experts for over 15 years. Professional and guaranteed service.",
        services: "Services",
        company: "Company",
        areas: "Service Areas",
        contact: "Contact",
        thermos: "Sealed glass replacement",
        hardware: "Hardware",
        woodDoors: "Wooden door repair",
        patio: "Patio door repair",
        frenchDoor: "French door repair",
        screens: "Screen doors",
        caulking: "Caulking",
        defogging: "Defogging",
        doorInsert: "Door insert",
        weatherstrip: "Weatherstripping",
        why: "Why Vosthermos?",
        projects: "Our projects",
        warranty: "Our warranty",
        blog: "Blog",
        faq: "FAQ",
        careers: "Careers",
        shop: "Online store",
        booking: "Book an appointment",
        hours: "Mon-Fri: 8am - 5pm",
        radius: "Service radius: 100km",
        rights: "All rights reserved.",
        privacy: "Privacy policy",
      }
    : {
        tagline: "Experts en reparation de portes et fenetres depuis plus de 15 ans. Service professionnel et garanti.",
        services: "Services",
        company: "Entreprise",
        areas: "Secteurs",
        contact: "Contact",
        thermos: "Remplacement de thermos",
        hardware: "Quincaillerie",
        woodDoors: "Reparation portes en bois",
        patio: "Reparation porte-patio",
        frenchDoor: "Reparation porte-fenetre",
        screens: "Moustiquaires",
        caulking: "Calfeutrage",
        defogging: "Desembuage",
        doorInsert: "Insertion de porte",
        weatherstrip: "Coupe-froid",
        why: "Pourquoi Vosthermos?",
        projects: "Nos realisations",
        warranty: "Notre garantie",
        blog: "Blogue",
        faq: "FAQ",
        careers: "Carrieres",
        shop: "Boutique en ligne",
        booking: "Prendre rendez-vous",
        hours: "Lun-Ven : 8h - 17h",
        radius: "Rayon de service : 100km",
        rights: "Tous droits reserves.",
        privacy: "Politique de confidentialite",
      };

  return (
    <footer className="bg-[var(--color-teal-dark)] text-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Image
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos"
              width={300}
              height={85}
              className="h-20 md:h-40 w-auto mb-6 brightness-110 drop-shadow-md"
            />
            <p className="text-white/60 text-sm leading-relaxed">
              {labels.tagline}
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61562303553558"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[var(--color-red)] hover:text-white transition-all"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://instagram.com/vosthermos/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[var(--color-red)] hover:text-white transition-all"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">{labels.services}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href={`${p}/services/remplacement-vitre-thermos`} className="hover:text-white transition-colors">{labels.thermos}</Link></li>
              <li><Link href={`${p}/services/remplacement-quincaillerie`} className="hover:text-white transition-colors">{labels.hardware}</Link></li>
              <li><Link href={`${p}/services/reparation-portes-bois`} className="hover:text-white transition-colors">{labels.woodDoors}</Link></li>
              <li><Link href={`${p}/services/reparation-porte-patio`} className="hover:text-white transition-colors">{labels.patio}</Link></li>
              <li><Link href={`${p}/services/reparation-porte-fenetre`} className="hover:text-white transition-colors">{labels.frenchDoor}</Link></li>
              <li><Link href={`${p}/services/moustiquaires-sur-mesure`} className="hover:text-white transition-colors">{labels.screens}</Link></li>
              <li><Link href={`${p}/services/calfeutrage`} className="hover:text-white transition-colors">{labels.caulking}</Link></li>
              <li><Link href={`${p}/services/desembuage`} className="hover:text-white transition-colors">{labels.defogging}</Link></li>
              <li><Link href={`${p}/services/insertion-porte`} className="hover:text-white transition-colors">{labels.doorInsert}</Link></li>
              <li><Link href={`${p}/services/coupe-froid`} className="hover:text-white transition-colors">{labels.weatherstrip}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">{labels.company}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href={`${p}/pourquoi-vosthermos`} className="hover:text-white transition-colors">{labels.why}</Link></li>
              <li><Link href={`${p}/realisations`} className="hover:text-white transition-colors">{labels.projects}</Link></li>
              <li><Link href={`${p}/garantie`} className="hover:text-white transition-colors">{labels.warranty}</Link></li>
              <li><Link href={`${p}/blogue`} className="hover:text-white transition-colors">{labels.blog}</Link></li>
              <li><Link href={`${p}/faq`} className="hover:text-white transition-colors">{labels.faq}</Link></li>
              <li><Link href={`${p}/carrieres`} className="hover:text-white transition-colors">{labels.careers}</Link></li>
              <li><Link href="/prix" className="hover:text-white transition-colors">Prix et tarifs</Link></li>
              <li><Link href="/problemes" className="hover:text-white transition-colors">Problemes courants</Link></li>
              <li><Link href="/diagnostic" className="hover:text-white transition-colors">Diagnostic gratuit</Link></li>
              <li><Link href="/glossaire" className="hover:text-white transition-colors">Glossaire</Link></li>
              <li><Link href="/calculateur" className="hover:text-white transition-colors">Calculateur d'economies</Link></li>
              <li><Link href="/opti-fenetre" className="hover:text-white transition-colors">OPTI-FENETRE</Link></li>
              <li><Link href={`${p}/boutique`} className="hover:text-white transition-colors">{labels.shop}</Link></li>
              <li><Link href={`${p}/rendez-vous`} className="hover:text-white transition-colors">{labels.booking}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">{labels.areas}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`${p}/reparation-portes-et-fenetres/${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">{labels.contact}</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1 text-[var(--color-red)]"></i>
                330 Ch. St-Francois-Xavier, Local 101
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone text-[var(--color-red)]"></i>
                <a href="tel:15148258411" className="hover:text-white transition-colors">514-825-8411</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-[var(--color-red)]"></i>
                <a href="mailto:info@vosthermos.com" className="hover:text-white transition-colors">info@vosthermos.com</a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/40 text-xs">{labels.hours}</p>
              <p className="text-white/40 text-xs mt-1">{labels.radius}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/40">
          <span>&copy; {new Date().getFullYear()} Vosthermos. {labels.rights}</span>
          <span>
            RBQ : 5790-9498-01 |{" "}
            <Link href={`${p}/politique-confidentialite`} className="hover:text-white transition-colors">
              {labels.privacy}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
