import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { serializeProducts } from "@/lib/serialize";
import QuoteForm from "@/components/QuoteForm";
import Gallery from "@/components/Gallery";
import GoogleReviews from "@/components/GoogleReviews";
import ProblemsSection from "@/components/ProblemsSection";
import VideoSection from "@/components/VideoSection";
import EcoSection from "@/components/EcoSection";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Accordion from "@/components/Accordion";
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions } from "@/lib/promotions";

export default async function Home() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: true } },
      children: { include: { _count: { select: { products: true } } } },
    },
    orderBy: { order: "asc" },
  });

  const rawProducts = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  const featuredProducts = serializeProducts(rawProducts);

  const totalProducts = await prisma.product.count();
  const activePromos = await getActivePromotions();

  let showImages = true;
  try {
    const imgSetting = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'show_boutique_images'`);
    if (imgSetting[0]?.value === "false") showImages = false;
  } catch {}

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Comment faire reparer vos portes et fenetres avec Vosthermos",
    description: "Un processus simple en 3 etapes pour faire reparer vos portes et fenetres par des experts.",
    step: [
      { "@type": "HowToStep", name: "Contactez-nous", text: "Appelez-nous au 514-825-8411 ou remplissez notre formulaire en ligne. Decrivez votre besoin et nous vous repondrons rapidement.", url: "https://www.vosthermos.com/#contact" },
      { "@type": "HowToStep", name: "Estimation gratuite", text: "Nous evaluons vos besoins et vous fournissons une soumission claire et detaillee, sans surprise ni frais caches." },
      { "@type": "HowToStep", name: "Intervention rapide", text: "Notre equipe intervient a votre domicile ou entreprise avec tout le materiel necessaire pour un travail de qualite." },
    ],
    totalTime: "PT2H",
    estimatedCost: { "@type": "MonetaryAmount", currency: "CAD", value: "150" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quelle est la garantie sur les vitres thermos?",
        acceptedAnswer: { "@type": "Answer", text: "Tous nos remplacements de vitres thermos sont couverts par une service professionnel garanti." },
      },
      {
        "@type": "Question",
        name: "Quels secteurs desservez-vous?",
        acceptedAnswer: { "@type": "Answer", text: "Nous desservons Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny et toute la region dans un rayon de 100km autour de Saint-Francois-Xavier." },
      },
      {
        "@type": "Question",
        name: "Offrez-vous des soumissions gratuites?",
        acceptedAnswer: { "@type": "Answer", text: "Oui, toutes nos soumissions sont gratuites et sans engagement. Appelez-nous au 514-825-8411 ou remplissez notre formulaire en ligne." },
      },
      {
        "@type": "Question",
        name: "Peut-on acheter des pieces en ligne?",
        acceptedAnswer: { "@type": "Answer", text: "Oui, notre boutique en ligne offre plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires avec paiement securise." },
      },
      {
        "@type": "Question",
        name: "Quel est le delai d'intervention?",
        acceptedAnswer: { "@type": "Answer", text: "Notre equipe intervient rapidement, generalement dans les jours suivant votre demande. Contactez-nous pour un rendez-vous." },
      },
      {
        "@type": "Question",
        name: "Reparez-vous les portes en bois?",
        acceptedAnswer: { "@type": "Answer", text: "Oui, nous offrons un service complet de reparation et restauration de portes et fenetres en bois avec estimation gratuite." },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      {/* Soumission + Image */}
      <section className="bg-[var(--color-teal-dark)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 lg:pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-8 border border-white/[0.08] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider">Service disponible</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-1">Besoin d&apos;une reparation?</h2>
              <p className="text-white/50 text-sm mb-5">Soumission gratuite, reponse rapide.</p>
              <QuoteForm compact />
            </div>
            <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-technicien.jpg"
                alt="Technicien Vosthermos installant une vitre thermos"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hero — Boutique catalogue */}
      <section className="bg-[var(--color-background)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Top row: heading + trust badges */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block bg-[var(--color-red)]/10 text-[var(--color-red)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                Plus de {totalProducts} pieces en stock
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                Pieces de remplacement pour{" "}
                <span className="text-[var(--color-red)]">portes et fenetres</span>
              </h1>
              <p className="text-[var(--color-muted)] text-lg mt-4 max-w-2xl">
                Quincaillerie, vitres thermos, moustiquaires et plus. Livraison rapide ou cueillette sur place.
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">15+</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">ans d&apos;exp.</span>
              </div>
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">15+</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">garantie</span>
              </div>
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">5&#9733;</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">avis</span>
              </div>
            </div>
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {categories.filter(c => c._count.products > 0 || c.children.some(ch => ch._count.products > 0)).slice(0, 10).map((cat) => {
              const total = cat._count.products + cat.children.reduce((s, c) => s + c._count.products, 0);
              const catPromo = activePromos.find(p => !p.categoryId || p.categoryId === cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/boutique/${cat.slug}`}
                  className="group relative bg-white hover:bg-white border border-[var(--color-border)] hover:border-[var(--color-red)]/40 rounded-xl px-4 py-4 text-center transition-all hover:shadow-md"
                >
                  {catPromo && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[var(--color-red)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      {catPromo.type === "percent" ? `-${Number(catPromo.value)}%` : "PROMO"}
                    </div>
                  )}
                  <div className="w-10 h-10 bg-[var(--color-teal)]/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[var(--color-red)] transition-colors">
                    <i className={`${getCategoryIcon(cat.slug)} text-sm text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                  </div>
                  <h3 className="text-sm font-semibold leading-tight">{cat.name}</h3>
                  <p className="text-[var(--color-muted)] text-[10px] mt-0.5">{total} pieces</p>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <i className="fas fa-shopping-bag"></i> Parcourir la boutique
            </Link>
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-teal)] border border-[var(--color-border)] hover:border-[var(--color-teal)]/30 px-8 py-3.5 rounded-full font-bold text-sm transition-all"
            >
              <i className="fas fa-phone text-xs"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-[var(--color-background)] py-20" id="services">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos services</span>
            <h2 className="text-3xl font-extrabold">
              Des solutions adaptees a <span className="text-[var(--color-red)]">tous vos besoins</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Que ce soit pour une reparation urgente ou un projet planifie, notre equipe intervient rapidement avec un service professionnel et garanti.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-cogs", title: "Remplacement de quincaillerie", slug: "remplacement-quincaillerie", desc: "Remplacement professionnel de la quincaillerie de vos portes-patio et fenetres. Pieces adaptees et installation rapide." },
              { icon: "fa-snowflake", title: "Remplacement de vitre thermos", slug: "remplacement-vitre-thermos", desc: "Buee ou perte d'efficacite thermique? Remplacement professionnel avec service professionnel garanti sur tous nos travaux." },
              { icon: "fa-door-open", title: "Reparation de portes en bois", slug: "reparation-portes-bois", desc: "Reparation et restauration de portes et fenetres en bois. Estimation gratuite et execution parfaite des travaux." },
              { icon: "fa-border-all", title: "Moustiquaires sur mesure", slug: "moustiquaires-sur-mesure", desc: "Fabrication sur mesure et reparation de tous types de moustiquaires. Service rapide et etancheite parfaite garantie." },
            ].map((s) => (
              <Link
                key={s.title}
                href={`/services/${s.slug}`}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all group border border-[var(--color-border)]"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-red)] transition-colors">
                  <i className={`fas ${s.icon} text-xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold mt-4">
                  En savoir plus <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Problemes courants */}
      <ProblemsSection />

      {/* Produits populaires */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]" id="boutique">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Produits populaires</span>
            <h2 className="text-3xl font-extrabold">
              Nos pieces les plus <span className="text-[var(--color-red)]">demandees</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Parcourez nos pieces de remplacement les plus vendues pour portes, fenetres et moustiquaires.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showImage={showImages} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Voir toute la boutique <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="section-dark py-20" id="comment-ca-marche">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Comment ca marche</span>
            <h2 className="text-3xl font-extrabold text-white">
              Un processus <span className="text-[var(--color-red)]">simple et rapide</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Contactez-nous", desc: "Appelez-nous ou remplissez notre formulaire en ligne. Decrivez votre besoin et nous vous repondrons rapidement." },
              { num: "2", title: "Estimation gratuite", desc: "Nous evaluons vos besoins et vous fournissons une soumission claire et detaillee, sans surprise ni frais caches." },
              { num: "3", title: "Intervention rapide", desc: "Notre equipe intervient a votre domicile ou entreprise avec tout le materiel necessaire pour un travail de qualite." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-5">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-[var(--color-background)] py-20" id="galerie">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Nos realisations</span>
            <h2 className="text-3xl font-extrabold">
              Galerie de <span className="text-[var(--color-red)]">nos travaux</span>
            </h2>
          </div>
          <Gallery />
        </div>
      </section>

      {/* Avis Google verifies */}
      <GoogleReviews />

      {/* Video section */}
      <VideoSection />

      {/* Avant/Apres — caché en attendant de vraies photos */}

      {/* Eco-responsabilite */}
      <EcoSection />

      {/* Sectors */}
      <section className="bg-[var(--color-background)] py-20" id="secteurs">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Secteurs desservis</span>
            <h2 className="text-3xl font-extrabold">
              Nous desservons <span className="text-[var(--color-red)]">votre region</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Notre equipe se deplace dans un rayon de 100km autour de Saint-Francois-Xavier pour offrir nos services.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {["Montreal","Laval","Longueuil","Brossard","Boucherville","Saint-Hyacinthe","Granby","Saint-Jean-sur-Richelieu","Chambly","Terrebonne","Repentigny","Blainville","Chateauguay","La Prairie","Sainte-Julie","Varennes","Delson","Candiac","Saint-Bruno","Mascouche"].map((city) => (
              <Link
                key={city}
                href={`/secteurs/${city.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 text-sm font-medium hover:shadow-md hover:bg-[var(--color-teal)] hover:text-white transition-all border border-[var(--color-border)]"
              >
                <i className="fas fa-map-marker-alt text-[var(--color-red)] text-xs"></i>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ visible */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]" id="faq">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Questions frequentes</span>
            <h2 className="text-3xl font-extrabold">
              Vos <span className="text-[var(--color-red)]">questions</span>, nos reponses
            </h2>
          </div>
          <Accordion items={[
            { q: "Quelle est la garantie sur les vitres thermos?", a: "Tous nos remplacements de vitres thermos sont couverts par une service professionnel garanti. Cette garantie est transferable au prochain proprietaire en cas de vente de votre propriete." },
            { q: "Quels secteurs desservez-vous?", a: "Nous desservons Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny et toute la region dans un rayon de 100km autour de Saint-Francois-Xavier." },
            { q: "Combien coute un remplacement de thermos?", a: "Le prix varie selon les dimensions et le type de verre. Nos remplacements commencent a partir de 150$ par unite installee. Contactez-nous pour une soumission gratuite et precise." },
            { q: "Peut-on acheter des pieces en ligne?", a: "Oui! Notre boutique en ligne offre plus de 740 pieces de remplacement pour portes, fenetres et moustiquaires. Paiement securise par carte de credit et livraison rapide." },
            { q: "Quel est le delai d'intervention?", a: "Notre equipe intervient generalement dans les jours suivant votre demande. Pour les urgences, nous faisons de notre mieux pour intervenir le plus rapidement possible." },
            { q: "Reparez-vous les portes en bois?", a: "Oui, nous offrons un service complet de reparation et restauration de portes et fenetres en bois incluant le poncage, le remplissage, la peinture et le remplacement de quincaillerie." },
          ]} />
          <div className="text-center mt-8">
            <Link href="/faq" className="text-[var(--color-teal)] font-semibold text-sm hover:text-[var(--color-red)] transition-colors">
              Voir toutes les questions <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Besoin d&apos;une reparation? Contactez-nous des maintenant!
          </h2>
          <p className="text-white/80 mb-8">
            Soumission gratuite, service rapide et garanti. Notre equipe est prete a vous aider.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all">
              Demander une soumission
            </a>
            <a href="tel:15148258411" className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/40 px-8 py-4 rounded-full font-bold hover:border-white hover:bg-white/10 transition-all">
              <i className="fas fa-phone"></i> 514-825-8411
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-[var(--color-background)] py-20" id="contact">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Contact</span>
            <h2 className="text-3xl font-extrabold">
              Nos <span className="text-[var(--color-red)]">coordonnees</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-border)]">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-map-marker-alt text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <strong className="block mb-1">Adresse</strong>
                    <p className="text-[var(--color-muted)] text-sm">330 Ch. St-Francois-Xavier, Local 101<br />Saint-Francois-Xavier, QC</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <strong className="block mb-1">Telephone</strong>
                    <a href="tel:15148258411" className="text-[var(--color-teal)] font-medium hover:text-[var(--color-red)] transition-colors">1 514-825-8411</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-envelope text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <strong className="block mb-1">Email</strong>
                    <a href="mailto:info@vosthermos.com" className="text-[var(--color-teal)] font-medium hover:text-[var(--color-red)] transition-colors">info@vosthermos.com</a>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <a href="https://www.facebook.com/profile.php?id=61562303553558" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] hover:bg-[var(--color-red)] hover:text-white transition-all">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://instagram.com/vosthermos/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center text-[var(--color-teal)] hover:bg-[var(--color-red)] hover:text-white transition-all">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)]">
              <iframe
                src="https://maps.google.com/maps?q=330+Chemin+Saint-Francois-Xavier+Delson+QC+Canada&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "350px" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Vosthermos"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
