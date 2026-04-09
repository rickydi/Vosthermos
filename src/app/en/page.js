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
import { getCategoryIcon } from "@/lib/category-icons";
import { getActivePromotions } from "@/lib/promotions";

export const metadata = {
  title: "Vosthermos | Door and Window Repair | Montreal, South Shore",
  description:
    "Door and window repair experts for over 15 years. Sealed glass unit replacement with professional guaranteed service, hardware, wooden doors, screen doors. Fast service Montreal, South Shore and 100km radius. Free quote 514-825-8411. Online parts store.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/",
    languages: {
      fr: "https://www.vosthermos.com/",
      en: "https://www.vosthermos.com/en/",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/",
    title: "Vosthermos | Door and Window Repair | Montreal, South Shore",
    description:
      "Door and window repair experts for over 15 years. Online parts store. Free quote.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
};

export default async function HomeEn() {
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

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to get your doors and windows repaired with Vosthermos",
    description: "A simple 3-step process to get your doors and windows repaired by experts.",
    step: [
      { "@type": "HowToStep", name: "Contact us", text: "Call us at 514-825-8411 or fill out our online form. Describe your need and we'll respond quickly.", url: "https://www.vosthermos.com/en/#contact" },
      { "@type": "HowToStep", name: "Free estimate", text: "We assess your needs and provide a clear, detailed quote with no surprises or hidden fees." },
      { "@type": "HowToStep", name: "Quick service", text: "Our team comes to your home or business with all the materials needed for quality work." },
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
        name: "What is the warranty on sealed glass units?",
        acceptedAnswer: { "@type": "Answer", text: "All our sealed glass unit replacements are covered by a professional guaranteed service." },
      },
      {
        "@type": "Question",
        name: "What areas do you serve?",
        acceptedAnswer: { "@type": "Answer", text: "We serve Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny and the entire region within a 100km radius of Saint-Francois-Xavier." },
      },
      {
        "@type": "Question",
        name: "Do you offer free quotes?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, all our quotes are free and without obligation. Call us at 514-825-8411 or fill out our online form." },
      },
      {
        "@type": "Question",
        name: "Can I buy parts online?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, our online store offers over 740 replacement parts for doors, windows and screen doors with secure payment." },
      },
      {
        "@type": "Question",
        name: "What is the response time?",
        acceptedAnswer: { "@type": "Answer", text: "Our team responds quickly, usually within days of your request. Contact us for an appointment." },
      },
      {
        "@type": "Question",
        name: "Do you repair wooden doors?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, we offer a complete repair and restoration service for wooden doors and windows with a free estimate." },
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

      {/* Hero -- Shop catalogue */}
      <section className="bg-[var(--color-background)] pt-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 lg:pt-16 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block bg-[var(--color-red)]/10 text-[var(--color-red)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                Over {totalProducts} parts in stock
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                Replacement parts for{" "}
                <span className="text-[var(--color-red)]">doors and windows</span>
              </h1>
              <p className="text-[var(--color-muted)] text-lg mt-4 max-w-2xl">
                Hardware, sealed glass units, screen doors and more. Fast delivery or in-store pickup.
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">15+</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">yrs exp.</span>
              </div>
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">10 yrs</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">warranty</span>
              </div>
              <div className="text-center">
                <strong className="block text-2xl font-extrabold text-[var(--color-teal)]">5&#9733;</strong>
                <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">reviews</span>
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
                  <p className="text-[var(--color-muted)] text-[10px] mt-0.5">{total} parts</p>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[var(--color-red-dark)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <i className="fas fa-shopping-bag"></i> Browse the shop
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

      {/* Quote + Image */}
      <section className="bg-[var(--color-teal-dark)] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-8 border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider">Service available</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-1">Need a repair?</h2>
              <p className="text-white/50 text-sm mb-5">Free quote, fast response.</p>
              <QuoteForm compact />
            </div>
            <div className="hidden lg:block">
              <Image
                src="/images/hero-technicien.jpg"
                alt="Vosthermos technician installing a sealed glass unit"
                width={600}
                height={500}
                className="rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-[var(--color-background)] py-20" id="services">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Our services</span>
            <h2 className="text-3xl font-extrabold">
              Solutions for <span className="text-[var(--color-red)]">all your needs</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Whether it&apos;s an urgent repair or a planned project, our team responds quickly with professional and guaranteed service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-cogs", title: "Hardware Replacement", slug: "hardware-replacement", desc: "Professional replacement of hardware for your patio doors and windows. Adapted parts and quick installation." },
              { icon: "fa-snowflake", title: "Sealed Glass Replacement", slug: "sealed-glass-replacement", desc: "Fog or loss of thermal efficiency? Professional replacement with a professional guaranteed service on all our work." },
              { icon: "fa-door-open", title: "Wooden Door Repair", slug: "wooden-door-repair", desc: "Repair and restoration of wooden doors and windows. Free estimate and flawless execution." },
              { icon: "fa-border-all", title: "Custom Screen Doors", slug: "custom-screen-doors", desc: "Custom manufacturing and repair of all types of screen doors. Fast service and guaranteed perfect seal." },
            ].map((s) => (
              <Link
                key={s.title}
                href={`/en/services/${s.slug}`}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all group border border-[var(--color-border)]"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-red)] transition-colors">
                  <i className={`fas ${s.icon} text-xl text-[var(--color-teal)] group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-[var(--color-red)] text-sm font-semibold mt-4">
                  Learn more <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Common problems */}
      <ProblemsSection />

      {/* Popular Products */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]" id="shop">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Popular products</span>
            <h2 className="text-3xl font-extrabold">
              Our most <span className="text-[var(--color-red)]">requested</span> parts
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Browse our best-selling replacement parts for doors, windows and screen doors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white px-8 py-4 rounded-full font-bold hover:bg-[var(--color-red-dark)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              View all products <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-dark py-20" id="how-it-works">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">How it works</span>
            <h2 className="text-3xl font-extrabold text-white">
              A <span className="text-[var(--color-red)]">simple and fast</span> process
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Contact us", desc: "Call us or fill out our online form. Describe your need and we'll respond quickly." },
              { num: "2", title: "Free estimate", desc: "We assess your needs and provide a clear, detailed quote with no surprises or hidden fees." },
              { num: "3", title: "Quick service", desc: "Our team comes to your home or business with all the materials needed for quality work." },
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
      <section className="bg-[var(--color-background)] py-20" id="gallery">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Our work</span>
            <h2 className="text-3xl font-extrabold">
              Gallery of <span className="text-[var(--color-red)]">our projects</span>
            </h2>
          </div>
          <Gallery />
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviews />

      {/* Video */}
      <VideoSection />

      {/* Before/After — hidden until real photos are available */}

      {/* Eco */}
      <EcoSection />

      {/* Service Areas */}
      <section className="bg-[var(--color-background)] py-20" id="areas">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Service areas</span>
            <h2 className="text-3xl font-extrabold">
              We serve <span className="text-[var(--color-red)]">your area</span>
            </h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
              Our team travels within a 100km radius of Saint-Francois-Xavier to offer our services.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {["Montreal","Laval","Longueuil","Brossard","Boucherville","Saint-Hyacinthe","Granby","Saint-Jean-sur-Richelieu","Chambly","Terrebonne","Repentigny","Blainville","Chateauguay","La Prairie","Sainte-Julie","Varennes","Delson","Candiac","Saint-Bruno","Mascouche"].map((city) => (
              <Link
                key={city}
                href={`/reparation-portes-et-fenetres/${city.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 text-sm font-medium hover:shadow-md hover:bg-[var(--color-teal)] hover:text-white transition-all border border-[var(--color-border)]"
              >
                <i className="fas fa-map-marker-alt text-[var(--color-red)] text-xs"></i>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 border-t border-[var(--color-border)]" id="faq">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-tag">Frequently asked questions</span>
            <h2 className="text-3xl font-extrabold">
              Your <span className="text-[var(--color-red)]">questions</span>, our answers
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "What is the warranty on sealed glass units?", a: "All our sealed glass unit replacements are covered by a professional guaranteed service. This warranty is transferable to the next owner if you sell your property." },
              { q: "What areas do you serve?", a: "We serve Montreal, Laval, Longueuil, Brossard, Saint-Hyacinthe, Granby, Terrebonne, Repentigny and the entire region within a 100km radius of Saint-Francois-Xavier." },
              { q: "How much does a sealed glass replacement cost?", a: "The price varies depending on dimensions and glass type. Our replacements start at $150 per installed unit. Contact us for a free and accurate quote." },
              { q: "Can I buy parts online?", a: "Yes! Our online store offers over 740 replacement parts for doors, windows and screen doors. Secure credit card payment and fast delivery." },
              { q: "What is the response time?", a: "Our team generally responds within days of your request. For emergencies, we do our best to respond as quickly as possible." },
              { q: "Do you repair wooden doors?", a: "Yes, we offer a complete repair and restoration service for wooden doors and windows including sanding, filling, painting and hardware replacement." },
            ].map((item, i) => (
              <details key={i} className="group bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold hover:text-[var(--color-red)] transition-colors">
                  {item.q}
                  <i className="fas fa-chevron-down text-xs text-[var(--color-muted)] group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="px-6 pb-4 text-sm text-[var(--color-muted)] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/en/faq" className="text-[var(--color-teal)] font-semibold text-sm hover:text-[var(--color-red)] transition-colors">
              See all questions <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-red)] py-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Need a repair? Contact us now!
          </h2>
          <p className="text-white/80 mb-8">
            Free quote, fast and guaranteed service. Our team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all">
              Request a quote
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
              Our <span className="text-[var(--color-red)]">contact info</span>
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
                    <strong className="block mb-1">Address</strong>
                    <p className="text-[var(--color-muted)] text-sm">330 Ch. St-Francois-Xavier, Suite 101<br />Saint-Francois-Xavier, QC</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-[var(--color-red)]"></i>
                  </div>
                  <div>
                    <strong className="block mb-1">Phone</strong>
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
                title="Vosthermos Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
